import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { legalH2, legalLink, legalList, legalP } from "../_components/legal-page";
import { CONTACT_EMAIL } from "@/lib/url";

export const metadata: Metadata = {
  title: "Privacy Policy | Handle",
  description: "How Handle collects and uses your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 2026">
      <p className={legalP}>
        Handle lets you build a portfolio page and share it at a public link.
        This page explains what information we collect and how it is used.
      </p>

      <h2 className={legalH2}>Information we collect</h2>
      <ul className={legalList}>
        <li>
          Account details: your email address and sign-in method (email or
          Google). From Google we receive only your name, email address and
          basic profile information.
        </li>
        <li>
          Profile content you add: name, headline, bio, location, links, work
          and education history, projects, skills, certifications,
          testimonials, and an optional photo, resume file and project images.
        </li>
        <li>
          Page settings you choose: color theme, font, light or dark mode, and
          whether you show an &ldquo;Open to opportunities&rdquo; badge or
          the AI chat.
        </li>
        <li>
          AI chat on public pages: the questions visitors type are sent to
          Google&apos;s Gemini API together with that public profile to get an
          answer. Handle does not save the questions or answers. To enforce
          daily limits we keep a count of questions per account, or for
          visitors who are not signed in, per scrambled (hashed) IP address,
          never the IP itself. Counts are deleted after about a week.
        </li>
        <li>
          Basic technical data such as cookies needed to keep you signed in,
          and your light or dark choice stored in your browser.
        </li>
      </ul>

      <h2 className={legalH2}>What is public</h2>
      <p className={legalP}>
        Only when you publish your profile, the content you added to it
        (including your photo and resume link) and your page settings become
        visible to anyone at your public page. Your email address is never shown
        on your public page. Unpublished profiles are not visible to others.
      </p>

      <h2 className={legalH2}>How we use information</h2>
      <p className={legalP}>
        To create your account, show your dashboard and public page, and keep
        the service secure. We do not sell your personal information and we do
        not use it for advertising.
      </p>

      <h2 className={legalH2}>Services that process data for us</h2>
      <ul className={legalList}>
        <li>Clerk: authentication and account management.</li>
        <li>
          Google (Gemini API): answers AI chat questions, using only the
          question and the public profile being viewed.
        </li>
        <li>Google Forms: feedback you choose to send us, and only what you type into it.</li>
        <li>Neon: database hosting.</li>
        <li>UploadThing: storage of uploaded photos, resumes and project images.</li>
        <li>
          Vercel: website hosting and anonymous visit statistics (pages viewed,
          referring site, country and device type; no cookies and no personal
          profile).
        </li>
      </ul>

      <h2 className={legalH2}>Your choices</h2>
      <p className={legalP}>
        You can edit or remove your profile content or unpublish your page at
        any time from your dashboard. You can delete your account from your
        account menu, which deletes your profile, its content and your uploaded
        files. For any question about your data, contact us using the email
        below.
      </p>

      <h2 className={legalH2}>Children</h2>
      <p className={legalP}>Handle is not intended for children under 13.</p>

      <h2 className={legalH2}>Changes</h2>
      <p className={legalP}>
        We may update this policy. The date at the top shows when it last
        changed. See also the{" "}
        <Link className={legalLink} href="/terms">
          Terms of Use
        </Link>
        .
      </p>

      <h2 className={legalH2}>Contact</h2>
      <p className={legalP}>
        Email:{" "}
        <a className={legalLink} href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </LegalPage>
  );
}
