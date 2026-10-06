import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { profile: true },
  });

  if (!user) {
    return (
      <main className="p-8">
        <p>Setting up your account. Refresh in a moment.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2">Signed in as {user.email}</p>
      <p>Plan: {user.tier}</p>
      <p>Profile: {user.profile?.isPublished ? "Published" : "Draft"}</p>
    </main>
  );
}