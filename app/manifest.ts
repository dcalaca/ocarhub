import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ocar - Plataforma de Veículos",
    short_name: "Ocar",
    description: "A plataforma mais moderna para comprar e vender veículos",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#7c3aed",
    orientation: "portrait",
    categories: ["automotive", "marketplace"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshot-desktop.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  }
}
