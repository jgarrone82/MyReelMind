import {
  Bowlby_One,
  Bebas_Neue,
  IBM_Plex_Mono,
  Permanent_Marker,
} from "next/font/google";

export const vhsDisplay = Bowlby_One({
  variable: "--font-vhs-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const vhsKicker = Bebas_Neue({
  variable: "--font-vhs-kicker",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const vhsMono = IBM_Plex_Mono({
  variable: "--font-vhs-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const vhsScript = Permanent_Marker({
  variable: "--font-vhs-script",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const vhsFontVariables = [
  vhsDisplay.variable,
  vhsKicker.variable,
  vhsMono.variable,
  vhsScript.variable,
].join(" ");
