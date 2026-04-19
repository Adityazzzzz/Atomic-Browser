# VibeBrowser - System Design & Core Architecture

VibeBrowser is a high-performance Next.js remote browser. This document outlines the backend mechanics, system designs, persistent layers, and optimizations built into the platform.

## 1. Core System Architecture
- **Framework**: Next.js 14+ (App Router), React, TypeScript.
- **Client-Server Flow**: The React frontend maps generic user interaction, but actual internet routing is forcibly handed to a customized Next.js backend API acting as a secure tunnel.

## 2. Server-Side Proxy Engine (`/api/proxy`)
- **CORS Bypass**: Native IFrames crash when loading secure sites (like Google) due to `X-Frame-Options` and strict CORS limitations. Our custom Route fetches the raw buffer server-side, intentionally stripping all restrictive headers.
- **AST DOM Rewriting**: Converts the byte-stream into a DOM using `cheerio`. It injects a `<base href>` tag forcing relative CSS/images to resolve correctly, and maps absolute `<a href>` links backward into the proxy (`/api/proxy?url=XYZ`), totally trapping the network inside the Vibe application.
- **XHR Interception**: Automatically injects a hidden `<script>` payload on all headers that hacks native `window.fetch` and `XMLHttpRequest` instances, re-routing JS-driven background requests safely.
- **Encoding Protection**: Dynamically deletes `accept-encoding` and `transfer-encoding` to force Node to execute plain UTF-8 parsing, completely blocking gzip/brotli payload gibberish corruption.

## 3. UI Ecosystem & Client State
- **Glassmorphic Compositing**: Built on `Shadcn UI` and `Tailwind`. Floating, semitransparent layers mimic premium desktop operating systems.
- **Framer Motion**: Incorporates dynamic stagger (`StaggerChildren: 0.05`), localized spring bounds, and component drag/reorder limits.
- **Store Hydration Safety**: A global `<ClientOnly>` mount checks against Server-Side Rendering (SSR) to ensure Client-bound states don't cause React mismatch crashes.

## 4. Native Custom Search Engine (`/search`)
- Eliminates reliance on framing external Search URLs.
- Executes an invisible server-to-server HTTP request against DuckDuckGo's raw HTML interface. 
- Performs targeted Cheerio `.result__title` mapping to intercept pure data payloads. Parses these into a beautifully designed list natively to boost speed and completely emulate a standalone browser feel.

## 5. Persistence Layer & Caching
- **Zustand Middleware**: Utilizes `zustand/persist` hooked into standard browser `LocalStorage`.
- Stores `tabs[]`, the continuous `historyStack[]`, and universal `globalHistory` trackers securely on the client machine to safeguard session progression over manual hard reloads without requiring an isolated PostgreSQL database.

## 6. Advanced Native Mechanics
- **Internal Adblocking**: Runs a custom-tailored exclusion loop iterating over standard `cheerio` selectors identifying ads and trackers (e.g., `doubleclick`, `.ad-container`). It purges these DOM sequences automatically on the backend node before feeding them to the Next client instance, securing CPU performance and ad-reduction simultaneously.
- **Native Web Downloads**: Detects `Content-Disposition: attachment` mappings organically. Instead of converting `.zip` or `.pdf` payloads to destructive AST blocks, the backend proxy redirects streaming buffers gracefully down to the OS to mimic Chromium's actual download manager flawlessly.
- **Vibe AI Extractive NLP**: Implements a 100% free server-sided text-frequency Natural Language processor. Vibe AI intercepts the `<article>` node of any requested proxy domain, calculates mathematical weighting using standard TF-IDF methodologies, and returns a dynamic 3-sentence summary completely isolated off-network securely without relying on paid OpenAI/HuggingFace API environments.

## 7. Stateful Identity & Network Developers
- **Browser Authentication Profiles**: Incorporates isolated Account structures bounded locally. Accounts emulate a fully state-contained session distinct from one another.
- **Cookie Jar Bypass**: The Next.js API utilizes a localized file-system database mapping `Set-Cookie` intercept streams exclusively to the `ActiveProfileID` mapping array. This ensures automated Single Sign-on Session captures across sites securely.
- **Telemetry Mesh**: Employs Cross-Frame postMessage APIs transferring `VIBE_NETWORK_LOG` traces out of the Javascript execution loop. VibeBrowser captures these traces independently mapping them functionally inside a Framer Motion `Network Toaster` DevTools panel.
