/* Sanitisation HTML — protection XSS pour le contenu CMS */

import sanitizeHtml from "sanitize-html"

/**
 * Sanitise le HTML produit par TipTap/CMS avant rendu côté client.
 * Autorise les balises de mise en forme standard, bloque tout script/iframe.
 */
export function sanitizeCmsHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "strong", "em", "u", "s", "mark",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a",
      "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
      "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    /* Forcer rel="noopener noreferrer" sur les liens externes */
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          ...(attribs.href?.startsWith("http") ? { target: "_blank" } : {}),
        },
      }),
    },
  })
}
