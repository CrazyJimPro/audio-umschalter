#!/usr/bin/env bash
# Audio-Umschalter – Deinstallation
#   bash uninstall.sh
# Entfernt das Applet aus der Leiste, löscht die Dateien und die gespeicherten Einstellungen.

set -euo pipefail

UUID="audio-umschalter@crazyjimpro"

if command -v gsettings >/dev/null 2>&1 && command -v python3 >/dev/null 2>&1; then
    UUID="$UUID" python3 - <<'PY' || true
import ast, os, subprocess
uuid = os.environ["UUID"]
raw = subprocess.check_output(["gsettings", "get", "org.cinnamon", "enabled-applets"]).decode().strip()
if raw.startswith("@as "):
    raw = raw[4:]
eintraege = ast.literal_eval(raw)
rest = [e for e in eintraege if e.split(":")[3:4] != [uuid]]
if len(rest) != len(eintraege):
    subprocess.check_call(["gsettings", "set", "org.cinnamon", "enabled-applets", str(rest)])
PY
fi

rm -rf "$HOME/.local/share/cinnamon/applets/$UUID"
rm -rf "$HOME/.config/cinnamon/spices/$UUID"
rm -rf "$HOME/.cinnamon/configs/$UUID"

echo "✔  Audio-Umschalter wurde entfernt."
