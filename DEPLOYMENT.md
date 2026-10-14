# GitHub Pages and TMDB key setup

GitHub Pages serves the browser app publicly. The TMDB key stays in a Cloudflare Worker secret and is never included in the Pages build.

## Set up the TMDB proxy

1. In `wrangler.toml`, replace the example origins with the exact origins for your GitHub Pages URL and custom domain. Use origins only, such as `https://yourname.github.io,https://yourdomain.com`.
2. Install Wrangler or run it through `npx`, then sign in and deploy the Worker:

   ```powershell
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put TMDB_API_KEY
   ```

   Enter a newly generated TMDB API key when Wrangler prompts for it. The Worker URL is shown after deployment.
3. In the GitHub repository, open **Settings → Secrets and variables → Actions → Variables** and add `VITE_TMDB_API_BASE_URL` with the Worker URL followed by `/api/tmdb`, for example `https://redheadflix-tmdb-api.example.workers.dev/api/tmdb`.
4. In **Settings → Pages**, choose **GitHub Actions** as the publishing source. Push to `main` to build and deploy the site.
5. Add your custom domain in the Pages settings and configure its DNS with Namecheap. Add the domain's HTTPS origin to `ALLOWED_ORIGINS` in `wrangler.toml`, then deploy the Worker again.

The origin allowlist is a browser restriction, not user authentication. Because the site is public, anyone can still use its public API endpoint. Add a Cloudflare rate limit for the Worker and monitor TMDB usage.

## Local development

The local Vite server reads `TMDB_API_KEY` from `.env.local` and proxies requests server-side. `.env.local` is ignored by Git. Never put the key in a `VITE_` variable.

The key that used to be in the browser code should be rotated before publishing if it has been shared or exposed. Put the replacement in `.env.local` and the Cloudflare Worker secret.

## Install on a phone

The manifest and service worker are included in production builds. GitHub Pages serves the site over HTTPS, which lets Android Chrome offer **Install app** or **Add to Home screen** from its browser menu. The app shell can reopen offline after it has loaded, but TMDB data, artwork, and video players still need an internet connection.
