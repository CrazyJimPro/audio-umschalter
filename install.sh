#!/usr/bin/env bash
# Audio-Umschalter – Installer für Linux Mint (Cinnamon)
#
# Aufruf aus dem entpackten/geklonten Ordner:   bash install.sh
# oder direkt aus dem Netz:
#   curl -fsSL https://raw.githubusercontent.com/CrazyJimPro/audio-umschalter/main/install.sh | bash
#
# Kopiert das Applet nach ~/.local/share/cinnamon/applets/ und setzt es
# automatisch neben das Lautstärke-Symbol in die Leiste.

set -euo pipefail

UUID="audio-umschalter@crazyjimpro"
REPO_TAR="https://github.com/CrazyJimPro/audio-umschalter/archive/refs/heads/main.tar.gz"
ZIEL="$HOME/.local/share/cinnamon/applets/$UUID"

info()   { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
ok()     { printf '\033[1;32m✔\033[0m  %s\n' "$*"; }
warn()   { printf '\033[1;33m!\033[0m  %s\n' "$*"; }
fehler() { printf '\033[1;31m✘\033[0m  %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] && fehler "Bitte NICHT mit sudo starten – das Applet wird nur für deinen Benutzer installiert."

if ! command -v cinnamon >/dev/null 2>&1; then
    warn "Cinnamon wurde nicht gefunden. Das Applet funktioniert nur unter Linux Mint Cinnamon."
fi

# --- Quelle finden: neben dem Skript oder aus GitHub laden -------------------
QUELLE=""
SKRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
if [ -n "$SKRIPT_DIR" ] && [ -f "$SKRIPT_DIR/$UUID/applet.js" ]; then
    QUELLE="$SKRIPT_DIR/$UUID"
else
    info "Lade Audio-Umschalter von GitHub …"
    TMP="$(mktemp -d)"
    trap 'rm -rf "$TMP"' EXIT
    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$REPO_TAR" | tar -xz -C "$TMP"
    elif command -v wget >/dev/null 2>&1; then
        wget -qO- "$REPO_TAR" | tar -xz -C "$TMP"
    else
        fehler "Weder curl noch wget gefunden."
    fi
    QUELLE="$(find "$TMP" -maxdepth 2 -type d -name "$UUID" | head -n1)"
    [ -n "$QUELLE" ] || fehler "Download unvollständig – Applet-Ordner nicht gefunden."
fi

# --- Dateien kopieren --------------------------------------------------------
info "Kopiere Applet nach $ZIEL"
mkdir -p "$ZIEL"
cp -rf "$QUELLE"/. "$ZIEL"/
ok "Dateien installiert"

if ! command -v pactl >/dev/null 2>&1; then
    warn "pactl fehlt – laufende Wiedergabe wird evtl. nicht sofort mit umgeschaltet."
    warn "Nachinstallieren mit:  sudo apt install pulseaudio-utils"
fi

# --- In die Leiste setzen (falls noch nicht drin) ---------------------------
if command -v gsettings >/dev/null 2>&1 && command -v python3 >/dev/null 2>&1; then
    ERGEBNIS="$(UUID="$UUID" python3 - <<'PY'
import ast, os, subprocess
uuid = os.environ["UUID"]
raw = subprocess.check_output(["gsettings", "get", "org.cinnamon", "enabled-applets"]).decode().strip()
if raw.startswith("@as "):
    raw = raw[4:]
eintraege = ast.literal_eval(raw)
if any(e.split(":")[3:4] == [uuid] for e in eintraege):
    print("schon")
    raise SystemExit
ids = [int(e.split(":")[-1]) for e in eintraege if e.split(":")[-1].isdigit()]
neue_id = max(ids + [0]) + 1
panel, zone, ordnung = "panel1", "right", "0"
for e in eintraege:
    t = e.split(":")
    if len(t) >= 5 and t[3] == "sound@cinnamon.org":
        panel, zone, ordnung = t[0], t[1], t[2]
        break
eintraege.append(f"{panel}:{zone}:{ordnung}:{uuid}:{neue_id}")
subprocess.check_call(["gsettings", "set", "org.cinnamon", "enabled-applets", str(eintraege)])
print("neu")
PY
)" || ERGEBNIS="fehler"

    case "$ERGEBNIS" in
        neu)   ok "Applet wurde in die Leiste gesetzt (neben dem Lautstärke-Symbol)" ;;
        schon)
            ok "Applet ist schon in der Leiste – lade es neu"
            dbus-send --session --dest=org.Cinnamon.LookingGlass --type=method_call \
                /org/Cinnamon/LookingGlass org.Cinnamon.LookingGlass.ReloadExtension \
                string:"$UUID" string:'APPLET' >/dev/null 2>&1 || true
            ;;
        *)     warn "Konnte das Applet nicht automatisch in die Leiste setzen."
               warn "Rechtsklick auf die Leiste → Applets → „Audio-Umschalter“ → Hinzufügen." ;;
    esac
else
    warn "Rechtsklick auf die Leiste → Applets → „Audio-Umschalter“ → Hinzufügen."
fi

echo
ok "Fertig!"
echo "   • Rechtsklick auf das neue Symbol → „Klick-Ziel 1“ = Monitor-Lautsprecher,"
echo "     „Klick-Ziel 2“ = Headset auswählen."
echo "   • Danach schaltet ein Linksklick zwischen beiden um."
