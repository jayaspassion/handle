import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { Webhook } from "svix";

// Exercise the actual route with real Svix signatures. Clerk and the database
// are isolated test doubles: these tests never access accounts or real data.
const source = readFileSync(new URL("../app/api/webhooks/clerk/route.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const secret = "whsec_" + Buffer.from("webhook-tests-only-secret").toString("base64");
const event = (id = "user_new") => ({
  type: "user.created",
  data: { id, created_at: 1, email_addresses: [{ email_address: "stale@example.com" }] },
});
const existing = {
  users: [{ id: "db_user", clerkId: "user_old", email: "person@example.com" }],
  profiles: [{ userId: "db_user", bio: "Keep my portfolio", isPublished: true }],
};

function fixture({ initial, clerkError, dbErrors = [], profileError = false, noEmail = false } = {}) {
  let state = structuredClone(initial ?? { users: [], profiles: [] });
  let version = 0;
  let transactions = 0;
  let lookups = 0;
  const errors = [...dbErrors];
  const prisma = {
    async $transaction(callback, options) {
      transactions++;
      assert.equal(options.isolationLevel, "Serializable");
      if (errors.length) throw { code: errors.shift() };
      const startVersion = version;
      const draft = structuredClone(state);
      const result = await callback({
        user: {
          async findUnique({ where }) {
            return draft.users.find((user) => Object.entries(where).every(([key, value]) => user[key] === value)) ?? null;
          },
          async create({ data }) {
            assert.deepEqual(JSON.parse(JSON.stringify(data.profile)), { create: {} });
            const user = { id: "db_" + data.clerkId, clerkId: data.clerkId, email: data.email };
            draft.users.push(user);
            if (profileError) throw new Error("Profile write failed");
            draft.profiles.push({ userId: user.id });
            return user;
          },
        },
        profile: {
          async upsert({ where, update, create }) {
            assert.equal(Object.keys(update).length, 0);
            if (profileError) throw new Error("Profile write failed");
            const profile = draft.profiles.find((p) => p.userId === where.userId);
            if (!profile) draft.profiles.push({ ...create });
            return profile ?? create;
          },
        },
      });
      // Simulate serializable commits racing against the same snapshot.
      if (version !== startVersion) throw { code: "P2034" };
      state = draft;
      version++;
      return result;
    },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, Response,
    process: { env: { CLERK_WEBHOOK_SECRET: secret } },
    console: { info() {}, error() {} },
    require(name) {
      if (name === "svix") return { Webhook };
      if (name === "@/lib/prisma") return { prisma };
      if (name === "@clerk/nextjs/server") return {
        clerkClient: async () => ({
          users: {
            async getUser(id) {
              lookups++;
              if (clerkError) throw clerkError;
              return {
                id, primaryEmailAddressId: "email_primary",
                emailAddresses: noEmail ? [] : [{ id: "email_primary", emailAddress: "person@example.com" }],
              };
            },
          },
        }),
      };
      throw new Error("Unexpected import: " + name);
    },
  });
  function request(payload, invalid = false) {
    const body = JSON.stringify(payload);
    const date = new Date();
    const id = "msg_test";
    return new Request("http://localhost/api/webhooks/clerk", {
      method: "POST", body,
      headers: {
        "svix-id": id,
        "svix-timestamp": String(Math.floor(date.getTime() / 1000)),
        "svix-signature": invalid ? "v1,invalid" : new Webhook(secret).sign(id, date, body),
      },
    });
  }
  return {
    post: (payload = event(), invalid = false) => exports.POST(request(payload, invalid)),
    state: () => state,
    transactions: () => transactions,
    lookups: () => lookups,
  };
}

test("new signup uses current Clerk email and creates a profile", async () => {
  const f = fixture();
  assert.equal((await f.post()).status, 200);
  assert.equal(f.state().users[0].email, "person@example.com");
  assert.equal(f.state().profiles[0].userId, f.state().users[0].id);
});

test("repeated delivery preserves existing profile and user fields", async () => {
  const f = fixture({ initial: existing });
  assert.equal((await f.post(event("user_old"))).status, 200);
  assert.equal((await f.post(event("user_old"))).status, 200);
  assert.deepEqual(f.state(), existing);
});

test("existing user missing a profile gets one without changing identity", async () => {
  const f = fixture({ initial: { users: existing.users, profiles: [] } });
  assert.equal((await f.post(event("user_old"))).status, 200);
  assert.equal(f.state().profiles.length, 1);
  assert.deepEqual(f.state().users, existing.users);
});

test("different Clerk ID with same email cannot acquire the existing portfolio", async () => {
  const f = fixture({ initial: existing });
  assert.equal((await f.post()).status, 409);
  assert.deepEqual(f.state(), existing);
});

test("deleted account's delayed event is acknowledged without database writes", async () => {
  const f = fixture({ initial: existing, clerkError: { status: 404 } });
  assert.equal((await f.post()).status, 200);
  assert.equal(f.transactions(), 0);
  assert.deepEqual(f.state(), existing);
});

test("Clerk outage or rate limit stays retryable, not treated as deletion", async () => {
  for (const status of [401, 429, 500]) {
    const f = fixture({ clerkError: { status } });
    assert.equal((await f.post()).status, 503);
    assert.equal(f.transactions(), 0);
  }
});

test("simultaneous duplicate deliveries converge on one user and profile", async () => {
  const f = fixture();
  const replies = await Promise.all([f.post(), f.post()]);
  assert.deepEqual(replies.map((r) => r.status), [200, 200]);
  assert.equal(f.state().users.length, 1);
  assert.equal(f.state().profiles.length, 1);
  assert.ok(f.transactions() > 2);
});

test("simultaneous different accounts sharing email do not transfer ownership", async () => {
  const f = fixture();
  const replies = await Promise.all([f.post(event("user_a")), f.post(event("user_b"))]);
  assert.deepEqual(replies.map((r) => r.status).sort(), [200, 409]);
  assert.equal(f.state().users.length, 1);
  assert.equal(f.state().profiles.length, 1);
});

test("unique and serialization failures retry with a bounded limit", async () => {
  const recovered = fixture({ dbErrors: ["P2002", "P2034"] });
  assert.equal((await recovered.post()).status, 200);
  assert.equal(recovered.transactions(), 3);
  const exhausted = fixture({ dbErrors: ["P2034", "P2034", "P2034"] });
  assert.equal((await exhausted.post()).status, 500);
  assert.equal(exhausted.transactions(), 3);
  assert.equal(exhausted.state().users.length, 0);
});

test("profile failure rolls back user creation", async () => {
  const f = fixture({ profileError: true });
  assert.equal((await f.post()).status, 500);
  assert.deepEqual(f.state(), { users: [], profiles: [] });
});

test("invalid signatures and malformed events never access Clerk or database", async () => {
  const f = fixture();
  assert.equal((await f.post(event(), true)).status, 400);
  assert.equal((await f.post(null)).status, 400);
  assert.equal((await f.post({ type: "user.created", data: {} })).status, 400);
  assert.equal(f.lookups(), 0);
  assert.equal(f.transactions(), 0);
});

test("unrelated events are acknowledged without account mutations", async () => {
  const f = fixture();
  assert.equal((await f.post({ type: "user.updated", data: { id: "user_new" } })).status, 200);
  assert.equal(f.lookups(), 0);
  assert.equal(f.transactions(), 0);
});

test("account without primary email fails before database writes", async () => {
  const f = fixture({ noEmail: true });
  assert.equal((await f.post()).status, 422);
  assert.equal(f.transactions(), 0);
});
