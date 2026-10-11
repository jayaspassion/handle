"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import ThemeToggle from "./theme-toggle";

export default function SiteHeader() {
  const pathname = usePathname();

  // The dashboard has its own sidebar and top row
  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <div className="border-b border-[var(--pf-panel-border)] print:hidden">
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          handle
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          <Show when="signed-out">
            <SignInButton>
              <button type="button" className="btn btn-outline btn-sm">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button type="button" className="btn btn-primary btn-sm">
                Sign up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="btn btn-outline btn-sm">
              Dashboard
            </Link>
            <UserButton />
          </Show>
        </div>
      </header>
    </div>
  );
}
