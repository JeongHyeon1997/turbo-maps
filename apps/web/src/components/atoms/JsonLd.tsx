/**
 * Renders a schema.org JSON-LD `<script>` tag from a plain data object. Server
 * component (no interactivity) — used on public pages for structured-data SEO.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Static, server-generated JSON only — never user-supplied HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
