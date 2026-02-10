
try {
  $ErrorActionPreference = "Stop"
  Remove-Item -Recurse -Force .wrangler/state/v3/d1 -ErrorAction SilentlyContinue
  npx wrangler d1 migrations apply webapp-production --local
  npx wrangler d1 execute webapp-production --local --file=seed.sql
  Write-Host "Database reset and seeded successfully."
} catch {
  Write-Error $_
  exit 1
}
