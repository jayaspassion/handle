import { Playfair_Display, Plus_Jakarta_Sans, Source_Sans_3, Space_Grotesk } from "next/font/google";

// Extra font pairs for the public page (see lib/appearance.ts). Not preloaded:
// a page only downloads the files its chosen pair actually uses.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  preload: false,
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  preload: false,
});

// Class names that define the font variables; put on the element that uses them
export const fontPairVariables = [jakarta, playfair, sourceSans, spaceGrotesk]
  .map((f) => f.variable)
  .join(" ");
