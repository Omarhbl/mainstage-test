const ALLOWED_TAGS = new Set([
  "figure",
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h3",
  "h4",
  "a",
  "img",
]);

const ALLOWED_ATTRS = new Set([
  "href",
  "src",
  "alt",
  "title",
  "target",
  "rel",
  "class",
  "style",
]);

function sanitizeStyleAttribute(value: string) {
  const allowedDeclarations: string[] = [];

  for (const declaration of value.split(";")) {
    const [rawProperty, rawValue] = declaration.split(":");
    if (!rawProperty || !rawValue) continue;

    const property = rawProperty.trim().toLowerCase();
    const nextValue = rawValue.trim().toLowerCase();

    if (
      (property === "width" || property === "max-width") &&
      /^\d+(px|%)$/.test(nextValue)
    ) {
      allowedDeclarations.push(`${property}:${nextValue}`);
    }
  }

  return allowedDeclarations.join("; ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeAnchorAttributes(tag: string) {
  const hasTarget = /\btarget\s*=/i.test(tag);
  const hasRel = /\brel\s*=/i.test(tag);

  if (hasTarget && !hasRel) {
    return tag.replace(/>$/, ' rel="noopener noreferrer">');
  }

  return tag;
}

export function sanitizeArticleBodyHtml(value: string) {
  const withoutScripts = value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");

  return withoutScripts
    .replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (full, tagName, attrs) => {
      const tag = String(tagName).toLowerCase();

      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }

      const isClosing = full.startsWith("</");
      if (isClosing) {
        return `</${tag}>`;
      }

      const cleanedAttrs = Array.from(
        String(attrs).matchAll(/([a-zA-Z0-9:-]+)\s*=\s*(".*?"|'.*?')/g)
      )
        .map(([, attrName, rawValue]) => {
          const attr = String(attrName).toLowerCase();
          if (!ALLOWED_ATTRS.has(attr)) {
            return "";
          }

          const valueWithoutQuotes = rawValue.slice(1, -1).trim();
          if (attr === "style") {
            const safeStyle = sanitizeStyleAttribute(valueWithoutQuotes);
            return safeStyle ? `${attr}="${escapeHtml(safeStyle)}"` : "";
          }

          return `${attr}="${escapeHtml(valueWithoutQuotes)}"`;
        })
        .filter(Boolean)
        .join(" ");

      const openingTag = cleanedAttrs.length > 0 ? `<${tag} ${cleanedAttrs}>` : `<${tag}>`;
      return tag === "a" ? normalizeAnchorAttributes(openingTag) : openingTag;
    })
    .trim();
}

export function isRichTextHtml(value?: string | null) {
  if (!value) {
    return false;
  }

  return /<\/?(p|strong|b|em|i|u|ul|ol|li|blockquote|h3|h4|a|img|br)\b/i.test(value);
}

export function paragraphsToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}
