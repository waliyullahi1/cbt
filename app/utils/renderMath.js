import katex from "katex"

// Order matters: check $$ before $
const patterns = [
  { re: /\$\$([\s\S]+?)\$\$/g, display: true },   // $$ ... $$
  { re: /\\\[([\s\S]+?)\\\]/g, display: true },   // \[ ... \]
  { re: /\\\(([\s\S]+?)\\\)/g, display: false },  // \( ... \)
]

// Math coming from the database as HTML may contain entities
const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/<br\s*\/?>/gi, " ")

export function renderMath(input) {
  if (input == null) return ""

  let html = String(input)

  for (const { re, display } of patterns) {
    html = html.replace(re, (_, tex) => {
      try {
        return katex.renderToString(decode(tex).trim(), {
          displayMode: display,
          throwOnError: false,
        })
      } catch {
        return tex // fall back to the raw text if it fails
      }
    })
  }

  return html
}