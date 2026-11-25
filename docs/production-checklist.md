# Production release gate

- Apply migrations 001–008 in order, only once each.
- Verify anonymous reads and denied anonymous writes; test writer, editor, moderator and admin accounts separately.
- Verify sign-up, email confirmation, profile, rating, publishing and moderation using test accounts.
- Verify IGDB licensing and automated-use permission before enabling synchronization.
- Run npm test, npm run typecheck, npm run build, npm audit --audit-level=high.
- Set NEXT_PUBLIC_SITE_URL to the final HTTPS origin; configure Supabase authentication redirect allowlist.
- Keep SUPABASE_SECRET_KEY and IGDB credentials server-only.
- Verify mobile layout, keyboard navigation, image loading, sitemap and robots.
- Verify backups and recovery; do not launch until checks pass.
