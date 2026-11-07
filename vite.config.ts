import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { PRIVACY_POLICY, TERMS_OF_SERVICE, type LegalDoc } from './src/pages/legal/legalContent'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function legalMarkup(doc: LegalDoc): string {
  const sections = doc.sections
    .map((s) => {
      const blocks = s.blocks
        .map((b) =>
          b.kind === 'ul'
            ? `<ul>${(b.items ?? []).map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
            : `<p>${escapeHtml(b.text ?? '')}</p>`,
        )
        .join('')
      return `<section id="${s.id}"><h2>${escapeHtml(s.heading)}</h2>${blocks}</section>`
    })
    .join('')
  return (
    `<main style="max-width:48rem;margin:0 auto;padding:3rem 1.5rem;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#2b2b33">` +
    `<h1>${escapeHtml(doc.title)}</h1><p>${escapeHtml(doc.tagline)}</p><p><small>Last updated: ${escapeHtml(doc.updated)}</small></p>` +
    doc.intro.map((t) => `<p>${escapeHtml(t)}</p>`).join('') +
    sections +
    `</main>`
  )
}

/**
 * The site is a client-rendered SPA, so /privacy and /terms are an empty
 * <div id="root"> to anything that doesn't run JavaScript — including Google's
 * OAuth brand-verification and Play policy reviewers, which then reject the
 * privacy policy as having "insufficient content". This writes dist/privacy.html
 * and dist/terms.html: the built index.html with the full legal text baked into
 * #root. React's createRoot replaces it on load, so browsers still get the
 * normal page. The deploy workflow uploads them to the extensionless S3 keys
 * /privacy and /terms (the native app never requests these files).
 */
function prerenderLegalPages(): Plugin {
  let outDir = 'dist'
  return {
    name: 'prerender-legal-pages',
    apply: 'build',
    configResolved(c) {
      outDir = resolve(c.root, c.build.outDir)
    },
    closeBundle() {
      const shell = readFileSync(resolve(outDir, 'index.html'), 'utf8')
      const pages: [string, LegalDoc, string][] = [
        ['privacy', PRIVACY_POLICY, 'https://wellmindly.com/privacy'],
        ['terms', TERMS_OF_SERVICE, 'https://wellmindly.com/terms'],
      ]
      for (const [name, doc, url] of pages) {
        if (!shell.includes('<div id="root"></div>')) throw new Error('prerender-legal-pages: #root not found in index.html')
        const html = shell
          .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(doc.title)} | WellMindly</title>`)
          .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(doc.tagline)}" />\n    <link rel="canonical" href="${url}" />`)
          .replace('<div id="root"></div>', `<div id="root">${legalMarkup(doc)}</div>`)
        writeFileSync(resolve(outDir, `${name}.html`), html)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    prerenderLegalPages(),
  ],
  server: {
    port: 5173,
  },
})
