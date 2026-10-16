import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { legalH2, legalLink, legalList, legalP } from "../_components/legal-page";
import { CONTACT_EMAIL } from "@/lib/url";

export const metadata: Metadata = {
  title: "Terms of Use | Handle",
  description: "The rules for using Handle and publishing a portfolio page.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="October 2026">
      <p className={legalP}>
        Handle lets you build a portfolio page and share it at a public link. By
        creating an account or using the site, you agree to these terms. Handle is
        in public beta: features may change, and the service is provided free of
        charge while we test it.
      </p>

      <h2 className={legalH2}>Your account</h2>
      <ul className={legalList}>
        <li>You must be at least 13 years old to create an account.</li>
        <li>Keep your sign-in details safe. You are responsible for activity on your account.</li>
        <li>One person per account. Don&apos;t impersonate anyone else.</li>
      </ul>

      <h2 className={legalH2}>Your content</h2>
      <p className={legalP}>
        You own what you add to Handle: your text, photos, resume and project
        images. To run the service we need permission to store it and, when you
        publish your page, to show it publicly at your link. You give us that
        permission for as long as the content stays on Handle. You can edit,
        unpublish or delete it at any time.
      </p>
      <p className={legalP}>
        Only add content you have the right to share, and keep it accurate. Ask
        people before adding their words as a testimonial.
      </p>

      <h2 className={legalH2}>What&apos;s not allowed</h2>
      <ul className={legalList}>
        <li>Illegal content, or content that harasses, threatens or discriminates against others.</li>
        <li>Sexual content, graphic violence, or content that exploits minors.</li>
        <li>Spam, scams, phishing, malware or misleading links.</li>
        <li>Other people&apos;s private information, or content that infringes copyright or trademarks.</li>
        <li>Trying to break, overload or get around the security of the service.</li>
      </ul>
      <p className={legalP}>
        We may remove content or suspend accounts that break these rules,
        usually after contacting you, but immediately when needed to protect
        others.
      </p>

      <h2 className={legalH2}>Reporting a page</h2>
      <p className={legalP}>
        If a public page breaks these rules or uses your content without
        permission, email{" "}
        <a className={legalLink} href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>{" "}
        with the page address and what is wrong. Each public page also has a
        &ldquo;Report this page&rdquo; link at the bottom.
      </p>

      <h2 className={legalH2}>Usernames</h2>
      <p className={legalP}>
        Usernames are first come, first served. We may reclaim a username that
        impersonates someone, infringes a trademark or is clearly being misused.
      </p>

      <h2 className={legalH2}>Ending your account</h2>
      <p className={legalP}>
        You can delete your account at any time from your account menu. This
        deletes your profile, its content and your uploaded files.
      </p>

      <h2 className={legalH2}>No guarantees</h2>
      <p className={legalP}>
        Handle is provided &ldquo;as is&rdquo;, without warranties. We work to
        keep it available and your data safe, but we can&apos;t promise the
        service will be uninterrupted or error free, so keep your own copy of
        anything important. To the extent the law allows, we are not liable for
        indirect losses or for lost data or content.
      </p>

      <h2 className={legalH2}>AI chat</h2>
      <p className={legalP}>
        Public pages can have an AI chat that answers questions using only that
        profile. AI answers can be wrong or incomplete, so check anything
        important with the person directly. Profile owners can turn the chat
        off in their dashboard. Don&apos;t use the chat to try to make it say
        harmful things or to get around its limits.
      </p>

      <h2 className={legalH2}>Privacy</h2>
      <p className={legalP}>
        How we handle your information is described in the{" "}
        <Link className={legalLink} href="/privacy">
          Privacy Policy
        </Link>
        .
      </p>

      <h2 className={legalH2}>Changes</h2>
      <p className={legalP}>
        We may update these terms as Handle grows. The date at the top shows when
        they last changed. If a change is significant, we&apos;ll let account
        holders know.
      </p>

      <h2 className={legalH2}>Contact</h2>
      <p className={legalP}>
        Questions:{" "}
        <a className={legalLink} href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </LegalPage>
  );
}
