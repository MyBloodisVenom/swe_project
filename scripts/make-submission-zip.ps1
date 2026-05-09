# FocusBlocks — zip what you actually submit (tracked files only).
# Skips node_modules, *.db, .env, etc. — whatever .gitignore already excludes from commits.
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

if (-not (Test-Path ".git")) {
  Write-Host "No .git folder here. Run: git init && git add . && git commit -m 'submit'"
  exit 1
}

$out = Join-Path $Root "FocusBlocks-submission.zip"
if (Test-Path $out) { Remove-Item $out -Force }

git archive --format=zip -o "FocusBlocks-submission.zip" HEAD
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Done: $out"
Write-Host "(Only git-tracked files — no node_modules, no data.db, no .env.)"
