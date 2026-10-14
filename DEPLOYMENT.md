# Publish RedHead FLIX with GitHub Pages

The site builds and deploys automatically from the `main` branch using GitHub Actions.

## Add the TMDB key

1. In the repository, open **Settings → Secrets and variables → Actions → Secrets**.
2. Add a repository secret named `VITE_TMDB_API_KEY` and paste your TMDB API key.
3. Push a commit to `main`, or rerun the **Deploy RedHead FLIX to GitHub Pages** workflow from the Actions tab.

The key is stored as an Actions secret and is not committed to the source repository. Since the deployed app calls TMDB directly from each visitor's browser, the key is included in the public JavaScript bundle and can be copied from the live site. Anyone could use it and consume your TMDB quota. Use a dedicated key and rotate it if it is abused.

## Local development

For local development, put `TMDB_API_KEY` in `.env.local`. Vite proxies TMDB requests on the development server, so the local browser does not need a public key. `.env.local` is ignored by Git.

## Install on a phone

The manifest and service worker are included in production builds. GitHub Pages serves the site over HTTPS, which lets Android Chrome offer **Install app** or **Add to Home screen** from its browser menu. The app shell can reopen offline after it has loaded, but TMDB data, artwork, and video players still need an internet connection.
