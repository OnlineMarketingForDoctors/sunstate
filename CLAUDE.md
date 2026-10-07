# Sunstate Family Practice & Skin Cancer Clinic — website

## NOINDEX: this site must not be indexed by search engines (until launch)

Every page MUST stay no-indexed. Three layers are in place — keep all of them:

1. **HTTP header** — `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex`
   on every response, set in `vercel.json` (Vercel) and `_headers` (Netlify / Cloudflare Pages).
   This also covers images, PDFs and other non-HTML files.
2. **Meta tag** — every HTML page's `<head>` must include:
   ```html
   <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
   ```
3. **robots.txt** — intentionally does NOT `Disallow: /`, so crawlers can read the
   noindex directives above (a Disallow would hide them).

Also: do not add a `sitemap.xml`, and do not submit the site to Search Console.

### Going live checklist (only when explicitly told the site is launching)
- Remove the `X-Robots-Tag` header from `vercel.json` and `_headers`
- Remove the robots meta tag from every page (grep for `name="robots"`)
- Update `robots.txt` (add `Sitemap:` line) and add a sitemap
