## Rollback from Yandex Cloud to pure Vercel

1. **GitHub Actions**
   - Open your repo on GitHub → `Actions`.
   - Disable the workflow named `DISABLED - Deploy to Yandex Object Storage` (or any Yandex-related workflow) so it does not run on push.

2. **Environment variables on Vercel**
   - Open your project on Vercel → `Settings` → `Environment Variables`.
   - Remove old variables that reference Yandex, for example `YANDEX_*`, `YC_*`, `DATABASE_URL` pointing to `*.yandexcloud.net`.
   - Add a fresh `VITE_API_URL` pointing to your production backend (for example, a Railway/Render/Amvera URL or `/api` if you proxy through Vercel).
   - Add a clean `DATABASE_URL` if you use a database hosted outside Yandex.
   - Redeploy the project after saving variables.

3. **DNS / domain**
   - Open your domain registrar panel (where the domain is registered).
   - Replace Yandex Cloud NS or A records with the ones recommended by Vercel for your domain.
   - Wait for DNS propagation (usually up to a few hours).

