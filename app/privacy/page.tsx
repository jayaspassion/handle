import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Handle",
  description: "How Handle collects and uses your information.",
};

const h2 = "mt-8 text-lg font-semibold";
const p = "mt-2 leading-relaxed";

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-pf-bg text-pf-fg">
      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-pf-muted">Last updated: October 2026</p>

        <p className={p}>
          Handle lets you build a portfolio page and share it at a public link.
          This page explains what information we collect and how it is used.
        </p>

        <h2 className={h2}>Information we collect</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
          <li>Account details: your email address and sign-in method (email or Google). From Google we receive only your name, email address and basic profile information.</li>
          <li>Profile content you add: name, headline, bio, location, links, work and education history, projects, skills, certifications, testimonials, and an optional photo and resume file.</li>
          <li>Basic technical data such as cookies needed to keep you signed in, and a theme preference stored in your browser.</li>
        </ul>

        <h2 className={h2}>What is public</h2>
        <p className={p}>
          Only when you publish your profile, the content you added to it (including
          your photo and resume link) becomes visible to anyone at your public page.
          Your email address is never shown on your public page. Unpublished profiles
          are not visible to others.
        </p>

        <h2 className={h2}>How we use information</h2>
        <p className={p}>
          To create your account, show your dashboard and public page, and keep the
          service secure. We do not sell your personal information and we do not use
          it for advertising.
        </p>

        <h2 className={h2}>Services that process data for us</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
          <li>Clerk: authentication and account management.</li>
          <li>Neon: database hosting.</li>
          <li>UploadThing: storage of uploaded photos and resumes.</li>
          <li>Vercel: website hosting.</li>
        </ul>

        <h2 className={h2}>Your choices</h2>
        <p className={p}>
          You can edit or remove your profile content or unpublish your page at any
          time from your dashboard. You can delete your account from your account
          menu, which deletes your profile and its content. To request deletion of
          anything remaining, such as uploaded files, or to ask any question about
          your data, contact us using the email below.
        </p>

        <h2 className={h2}>Children</h2>
        <p className={p}>Handle is not intended for children under 13.</p>

        <h2 className={h2}>Changes</h2>
        <p className={p}>
          We may update this policy. The date at the top shows when it last changed.
        </p>

        <h2 className={h2}>Contact</h2>
        <p className={p}>
          Email: <a className="text-pf-accent underline-offset-4 hover:underline" href="mailto:jayaspassion@gmail.com">jayaspassion@gmail.com</a>
        </p>

        <p className="mt-12 text-sm">
          <Link href="/" className="text-pf-accent underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}