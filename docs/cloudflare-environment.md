# Cloudflare production environment

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` in both Cloudflare build variables and Worker runtime variables. Use public values only. Never expose the Supabase secret key in a NEXT_PUBLIC variable. Rebuild after changing build variables.

Production URL: https://critivex-web.critivex.workers.dev
