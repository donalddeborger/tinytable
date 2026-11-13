import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/fredoka";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tinytable.be"),
  description:
    "Kindvriendelijke restaurants, cafés en koffiebars in Antwerpen en de provincie. Zie in één oogopslag of er een verschoningstafel, kinderstoelen, speelhoek, kinderaanbod of speeltuin is.",
  alternates: { canonical: "/" },
  appleWebApp: { capable: true, title: "TinyTable", statusBarStyle: "default" },
  openGraph: {
    title: "TinyTable – kindvriendelijk eten & drinken in Antwerpen",
    description:
      "Vind restaurants, cafés en koffiebars met verschoningstafel, kinderstoelen, speelhoek, kinderaanbod of speeltuin.",
    url: "https://www.tinytable.be",
    siteName: "TinyTable",
    locale: "nl_BE",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf8ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
