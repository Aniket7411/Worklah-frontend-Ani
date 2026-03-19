/**
 * Job description HTML normalization.
 *
 * The admin editor uses legacy `document.execCommand('fontName'|'fontSize')`
 * which can produce `<font face="...">` tags and also sometimes leaves
 * non-`<li>` nodes directly under `<ul>/<ol>`.
 *
 * To keep HTML portable (web + native) and consistent:
 * - Convert `<font>` to `<span style="...">`
 * - Normalize `<ul>/<ol>` children so everything becomes `<li>`
 * - Strip scripts/styles and inline `on*` handlers
 */
export function sanitizeJobDescriptionHtml(html: string): string {
  if (!html) return "";
  if (typeof DOMParser === "undefined") return html;

  const parser = new DOMParser();
  // Parse into a detached document
  const doc = parser.parseFromString(html, "text/html");

  // Remove potentially dangerous tags
  doc.querySelectorAll("script, style").forEach((el) => el.remove());

  // Remove inline event handlers + block javascript: URLs
  doc.querySelectorAll("*").forEach((el) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes = Array.from((el as any).attributes || []);
    attributes.forEach((attr) => {
      const name = String(attr.name || "").toLowerCase();
      const value = String(attr.value || "");

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        return;
      }

      if ((name === "href" || name === "src") && value.trim().toLowerCase().startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    });
  });

  // Convert legacy <font> to <span style="...">
  doc.querySelectorAll("font").forEach((fontEl) => {
    const face = fontEl.getAttribute("face") || "";
    const sizeAttr = fontEl.getAttribute("size") || "";

    const styleParts: string[] = [];
    if (face) styleParts.push(`font-family:${face};`);

    const size = Number.parseInt(sizeAttr, 10);
    if (Number.isFinite(size) && size !== 0) {
      // execCommand fontSize commonly uses 1/3/5
      const sizePx =
        size === 1 ? "12px" : size === 2 ? "14px" : size === 3 ? "16px" : size === 4 ? "18px" : size === 5 ? "20px" : "";
      if (sizePx) styleParts.push(`font-size:${sizePx};`);
    }

    const spanEl = doc.createElement("span");
    if (styleParts.length) spanEl.setAttribute("style", styleParts.join(""));

    while (fontEl.firstChild) spanEl.appendChild(fontEl.firstChild);
    fontEl.replaceWith(spanEl);
  });

  // Normalize ul/ol so all element children become <li>
  const normalizeList = (listEl: HTMLElement) => {
    const nodes = Array.from(listEl.childNodes);
    const newChildren: ChildNode[] = [];

    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = String(el.tagName || "").toLowerCase();
        if (tag === "li") {
          newChildren.push(el);
        } else {
          const li = doc.createElement("li");
          li.appendChild(el);
          newChildren.push(li);
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent || "").trim();
        if (text) {
          const li = doc.createElement("li");
          li.textContent = text;
          newChildren.push(li);
        }
      }
      // Ignore comment nodes/whitespace nodes
    });

    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
    newChildren.forEach((child) => listEl.appendChild(child));

    // Remove empty li elements
    listEl.querySelectorAll("li").forEach((li) => {
      const hasText = Boolean(li.textContent && li.textContent.trim());
      const hasElements = li.children && li.children.length > 0;
      if (!hasText && !hasElements) li.remove();
    });
  };

  doc.querySelectorAll("ul, ol").forEach((listEl) => normalizeList(listEl as HTMLElement));

  // Return the container HTML (not including the outer body wrapper)
  return doc.body.innerHTML;
}

