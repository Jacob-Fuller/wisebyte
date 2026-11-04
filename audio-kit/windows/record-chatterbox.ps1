# Records Wisebyte Go with Chatterbox Turbo on this PC's NVIDIA graphics card.
# Run from the repo folder. Pass --samples for voice samples, or nothing to record every episode.
# Safe to stop (close the window) and run again: finished episodes are kept and skipped.
param([Parameter(ValueFromRemainingArguments = $true)] $Rest)
$ErrorActionPreference = "Continue"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $root

Write-Host "Getting the latest audio kit..."
git fetch origin main
git checkout origin/main -- audio-kit go/audio

if (-not (Get-Command nvidia-smi -ErrorAction SilentlyContinue)) {
  Write-Host "No NVIDIA graphics card driver found, so Chatterbox can't run fast enough on this PC."
  Read-Host "Press Enter to close"; exit 1
}
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader

$py = Get-ChildItem "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe", "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $py) {
  winget install --id Python.Python.3.12 -e --scope user --accept-source-agreements --accept-package-agreements
  $py = Get-ChildItem "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
}
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
  $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
}

$venv = "audio-kit\cb-venv"
$vpy = "$venv\Scripts\python.exe"
if (-not (Test-Path $vpy)) {
  Write-Host "Setting up Chatterbox (a one-off download of about 3 GB)..."
  & $py.FullName -m venv $venv
  & $vpy -m pip install --upgrade pip
  & $vpy -m pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cu124
  & $vpy -m pip install chatterbox-tts
  if ($LASTEXITCODE -ne 0) { Write-Host "Chatterbox didn't install."; Read-Host "Press Enter to close"; exit 1 }
}

$env:PYTHONIOENCODING = "utf-8"
& $vpy audio-kit\chatterbox_gen.py @Rest
Write-Host "Done."
Read-Host "Press Enter to close"
