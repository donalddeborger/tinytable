import type { MetadataRoute } from "next";

// Maakt TinyTable installeerbaar op het beginscherm van een gsm.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TinyTable – kindvriendelijk eten & drinken",
    short_name: "TinyTable",
    description: "Vind restaurants, cafés en koffiebars met verschoningstafel, kinderstoelen, speelhoek en meer.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8ef",
    theme_color: "#fbf8ef",
    lang: "nl",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
