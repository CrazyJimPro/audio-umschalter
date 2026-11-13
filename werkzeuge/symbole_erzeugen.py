"""Erzeugt die Symbole des Audio-Umschalters.

    python werkzeuge/symbole_erzeugen.py

Symbolische Icons (16x16) fuer die Leiste: nur gefuellte Flaechen, keine Konturen.
GTK faerbt *-symbolic.svg selbst in der Textfarbe des Themes ein und erzwingt dabei
"fill" fuer alle Formen - Linien (stroke) oder fill="none" wuerden kaputtgehen.
Loecher werden deshalb ueber fill-rule="evenodd" gemacht.
"""
import math
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
ICONS = WURZEL / "audio-umschalter@crazyjimpro" / "icons"
FARBE = "#bebebe"  # Standard-Grau fuer symbolische Icons


def welle(cx, cy, r_innen, r_aussen, winkel):
    """Sichelfoermige Schallwelle nach rechts, +/- winkel Grad."""
    a = math.radians(winkel)
    def p(r, s):
        return f"{cx + r * math.cos(a):.2f},{cy + s * r * math.sin(a):.2f}"
    return (f"M{p(r_aussen, -1)} A{r_aussen},{r_aussen} 0 0 1 {p(r_aussen, 1)} "
            f"L{p(r_innen, 1)} A{r_innen},{r_innen} 0 0 0 {p(r_innen, -1)} Z")


def kreis(cx, cy, r):
    return (f"M{cx - r:.2f},{cy} a{r},{r} 0 1 0 {2 * r:.2f},0 "
            f"a{r},{r} 0 1 0 {-2 * r:.2f},0 Z")


def n(z):
    """Zahl kurz und ohne Rundungsrauschen (1.5000000000000002 -> 1.5)."""
    return f"{round(z, 3):g}"


def rrect(x, y, w, h, r):
    return (f"M{n(x + r)},{n(y)} h{n(w - 2 * r)} a{n(r)},{n(r)} 0 0 1 {n(r)},{n(r)} "
            f"v{n(h - 2 * r)} a{n(r)},{n(r)} 0 0 1 {n(-r)},{n(r)} h{n(-(w - 2 * r))} "
            f"a{n(r)},{n(r)} 0 0 1 {n(-r)},{n(-r)} v{n(-(h - 2 * r))} "
            f"a{n(r)},{n(r)} 0 0 1 {n(r)},{n(-r)} Z")


# ---- Formen im 16er-Raster -------------------------------------------------

HEADSET = [
    # Buegel
    "M1.5,8 A6.5,6.5 0 0 1 14.5,8 L13,8 A5,5 0 0 0 3,8 Z",
    # Ohrmuscheln
    rrect(1, 7.5, 4, 6, 1.5),
    rrect(11, 7.5, 4, 6, 1.5),
    # Mikrofonarm + Kapsel
    "M2.6,13 C2.6,15 4.2,15.8 6.5,15.8 L7.5,15.8 L7.5,14.8 L6.5,14.8 "
    "C4.7,14.8 3.6,14.2 3.6,13 Z",
    rrect(7, 14.3, 3.2, 1.7, 0.85),
]

MONITOR = [
    # Bildschirmrahmen mit Loch
    rrect(0.5, 1, 15, 10.5, 1) + " " + rrect(2, 2.5, 12, 7.5, 0.3),
    # Fuss
    "M7,11.5 h2 v2 h-2 Z",
    rrect(4.5, 13.5, 7, 1.6, 0.8),
    # Lautsprecher im Bild
    "M4,5.1 h1.5 v2.3 h-1.5 Z",
    "M5.5,5.1 L7.6,3.6 V8.9 L5.5,7.4 Z",
    welle(7.4, 6.25, 1.7, 2.6, 48),
    welle(7.4, 6.25, 3.3, 4.2, 44),
]

LAUTSPRECHER = [
    # Gehaeuse mit Loch
    rrect(2.5, 0.5, 11, 15, 1.6) + " " + rrect(4, 2, 8, 12, 0.6),
    # Hochtoener
    kreis(8, 4.6, 1.35),
    # Tieftoener: Ring + Mitte
    kreis(8, 10, 3.2) + " " + kreis(8, 10, 2.0),
    kreis(8, 10, 0.95),
]

SYMBOLISCH = {
    "headset": HEADSET,
    "monitor": MONITOR,
    "lautsprecher": LAUTSPRECHER,
}


def symbolisch_svg(pfade):
    teile = "\n".join(
        f'  <path fill="{FARBE}" fill-rule="evenodd" d="{d}"/>' for d in pfade)
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" '
            f'viewBox="0 0 16 16">\n{teile}\n</svg>\n')


def farbig_svg():
    """Buntes 48er-Symbol fuer die Applet-Liste (icon.png wird daraus gerendert)."""
    def gruppe(pfade, tx, ty, s):
        inner = "".join(f'<path fill-rule="evenodd" d="{d}"/>' for d in pfade)
        return f'<g fill="#ffffff" transform="translate({tx},{ty}) scale({s})">{inner}</g>'
    pfeile = (
        '<g fill="#ffffff">'
        # Pfeil nach rechts
        '<path d="M30,8.6 h9 v-2.6 l5,4 l-5,4 v-2.6 h-9 Z"/>'
        # Pfeil nach links
        '<path d="M44,18.6 h-9 v-2.6 l-5,4 l5,4 v-2.6 h9 Z"/>'
        '</g>'
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">\n'
        '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="#4a9bf0"/><stop offset="1" stop-color="#1c63c4"/>'
        '</linearGradient></defs>\n'
        '<rect x="1" y="1" width="46" height="46" rx="10" fill="url(#g)"/>\n'
        + gruppe(HEADSET, 3, 4, 1.55) + "\n"
        + gruppe(LAUTSPRECHER, 25, 23, 1.3) + "\n"
        + pfeile + "\n</svg>\n"
    )


def main():
    ICONS.mkdir(parents=True, exist_ok=True)
    for name, pfade in SYMBOLISCH.items():
        ziel = ICONS / f"audio-umschalter-{name}-symbolic.svg"
        ziel.write_text(symbolisch_svg(pfade), encoding="utf-8", newline="\n")
        print("geschrieben:", ziel.relative_to(WURZEL))
    ziel = WURZEL / "werkzeuge" / "icon.svg"
    ziel.write_text(farbig_svg(), encoding="utf-8", newline="\n")
    print("geschrieben:", ziel.relative_to(WURZEL))


if __name__ == "__main__":
    main()
