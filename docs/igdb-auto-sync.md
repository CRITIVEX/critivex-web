# Daily catalogue synchronization

After confirming IGDB publication and automated use permission, set the repository Actions variable `IGDB_AUTO_SYNC_ENABLED` to `true`. The workflow runs daily at 18:00 UTC (04:00 AEST / 05:00 AEDT). Scheduled runs may be delayed by GitHub. Remove the variable or set it to `false` to disable scheduled writes. Manual runs still require confirmation. Existing secrets are reused. Each run retrieves up to 100 records using the current preview query and upserts by slug; it is not a full catalogue crawl. Monitor Actions for failures. Migration 006 must be applied.
