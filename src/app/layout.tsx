import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/fredoka";
import "./globals.css";

export const metadata: Metadata = {
  title: "TinyTable — kindvriendelijk eten in Antwerpen",
  description:
    "Zie in één oogopslag of een restaurant, café of bar een verschoningstafel, kinderstoelen, speelhoek of kindermenu heeft.",
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
      <body>{children}</body>
    </html>
  );
}
