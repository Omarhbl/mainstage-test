import sanitizeHtml from "sanitize-html";

// Parse HTML rather than matching tags with regular expressions. Protocol checks
// include decoded entities and embedded control characters.
export function sanitizeArticleBodyHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: ["div", "figure", "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "h3", "h4", "a", "img"],
    allowedAttributes: {
      "*": ["class", "title"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "class", "style"],
      figure: ["class", "style"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowProtocolRelative: false,
    allowedStyles: { "*": { width: [/^\d+(px|%)$/], "max-width": [/^\d+(px|%)$/] } },
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: "noopener noreferrer" } }),
    },
  }).trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isRichTextHtml(value?: string | null) {
  if (!value) {
    return false;
  }

  return /<\/?(div|p|strong|b|em|i|u|ul|ol|li|blockquote|h3|h4|a|img|br)\b/i.test(value);
}

export function paragraphsToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}
