import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Azaetogo — Association d'aide au développement du Togo",
    short_name: "Azaetogo",
    description:
      "ONG togolaise œuvrant pour l'éducation, le soutien social et l'espoir des communautés vulnérables.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#E87722",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }
}
