# <img src="audio-umschalter@crazyjimpro/icon.png" width="48" align="center" alt=""> Audio-Umschalter

Ein Applet für die Leiste von **Linux Mint Cinnamon**. Ein Klick darauf schaltet den Ton um,
zum Beispiel zwischen den **Lautsprechern am Monitor** und dem **Headset**. Du musst dafür nicht
mehr in die Klangeinstellungen.

- **Linksklick:** zwischen deinen zwei Klick-Zielen umschalten
- **Rechtsklick:** alle Ausgänge sehen und direkt einen wählen, Klick-Ziele festlegen
- **Mittelklick:** Klangeinstellungen öffnen
- Das Applet hat eigene Symbole: Headset, Monitor mit Ton oder Lautsprecherbox, je nachdem,
  was gerade aktiv ist. Sie passen sich wie alle Leisten-Symbole automatisch der Farbe des Themes an
- Musik, Videos oder Anrufe, die gerade laufen, wandern sofort mit auf den neuen Ausgang

Das Applet benutzt dieselbe Technik wie Cinnamons eigenes Lautstärke-Symbol. Darum findest du
hier genau die Ausgänge wieder, die auch in den Klangeinstellungen stehen.

### Die Symbole in der Leiste

| Symbol | Bedeutung |
|:---:|---|
| <img src="audio-umschalter@crazyjimpro/icons/audio-umschalter-headset-symbolic.svg" width="32" alt="Headset"> | Ton läuft über **Headset oder Kopfhörer** |
| <img src="audio-umschalter@crazyjimpro/icons/audio-umschalter-monitor-symbolic.svg" width="32" alt="Monitor"> | Ton läuft über die **Lautsprecher im Monitor** (HDMI/DisplayPort) |
| <img src="audio-umschalter@crazyjimpro/icons/audio-umschalter-lautsprecher-symbolic.svg" width="32" alt="Lautsprecher"> | Ton läuft über **Lautsprecher** (z. B. Boxen am Klinkenausgang) |

In der Leiste erscheinen sie in der Farbe deines Themes. Welches Symbol zu welchem Klick-Ziel
gehört, erkennt das Applet selbst. Du kannst es aber auch fest einstellen (siehe
[Einstellungen](#einstellungen)).

---

## Installieren

1. Terminal öffnen (`Strg` + `Alt` + `T`).
2. Diesen Befehl einfügen und mit `Enter` starten:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/CrazyJimPro/audio-umschalter/main/install.sh | bash
   ```

   Hast du den Ordner schon heruntergeladen oder geklont, geht auch:

   ```bash
   bash install.sh
   ```

3. Fertig. Neben dem Lautstärke-Symbol erscheint jetzt ein neues Symbol.
   Ein Neustart oder Abmelden ist nicht nötig.

Bitte **nicht** mit `sudo` starten. Das Applet wird nur für deinen Benutzer installiert.

---

## Einrichten: Monitor-Lautsprecher und Headset festlegen

1. **Rechtsklick** auf das neue Symbol.
2. **Klick-Ziel 1** öffnen und die Monitor-Lautsprecher wählen
   (meist etwas mit „HDMI“ oder „DisplayPort“ im Namen).
3. **Klick-Ziel 2** öffnen und das Headset wählen.
4. Ab jetzt schaltet ein **Linksklick** zwischen beiden hin und her.

Solange du keine zwei Klick-Ziele festgelegt hast, schaltet der Linksklick der Reihe nach durch
alle Ausgänge.

Wenn ein Klick-Ziel gerade nicht angeschlossen ist (z. B. Headset ausgesteckt), meldet das Applet
das kurz und lässt den Ton, wo er ist.

---

## Einstellungen

Rechtsklick auf das Symbol → **Konfigurieren …**

| Einstellung | Bedeutung |
|---|---|
| Eigener Name für Klick-Ziel 1/2 | z. B. „Monitor“ und „Headset“ statt der langen Gerätenamen |
| Symbol für Klick-Ziel 1/2 | Headset, Monitor oder Lautsprecher fest vorgeben, falls die automatische Erkennung danebenliegt |
| Beim Umschalten kurz anzeigen … | kleine Meldung oben rechts nach jedem Klick (Standard: an) |
| Laufende Wiedergabe sofort mit umschalten | Musik/Videos wechseln sofort mit (Standard: an) |
| Namen neben dem Symbol anzeigen | zeigt den aktiven Ausgang als Text in der Leiste (Standard: aus) |

---

## Aktualisieren

Den Installationsbefehl einfach noch einmal ausführen. Deine Klick-Ziele und Einstellungen bleiben
erhalten.

---

## Deinstallieren

Im heruntergeladenen Ordner:

```bash
bash uninstall.sh
```

Oder ohne Ordner: Rechtsklick auf das Symbol → **„Audio-Umschalter“ entfernen**. Danach liegen
nur noch die Dateien in `~/.local/share/cinnamon/applets/audio-umschalter@crazyjimpro`. Die
kannst du löschen.

---

## Wenn etwas nicht klappt

**Das Symbol erscheint nicht in der Leiste**
Rechtsklick auf die Leiste → **Applets** → „Audio-Umschalter“ suchen → **Hinzufügen** (`+`).

**Das Symbol zeigt ein Warndreieck oder reagiert nicht**
1. `Alt` + `F2` drücken, `lg` eingeben, `Enter`. Das öffnet „Looking Glass“.
2. Oben auf **Log** klicken und nach Zeilen mit `audio-umschalter` suchen.
3. Alternativ im Terminal:

   ```bash
   grep -i audio-umschalter ~/.xsession-errors
   ```

   Diese Zeilen mitschicken, dann lässt sich der Fehler finden.

**Mein Headset taucht nicht in der Liste auf**
Das Applet zeigt dieselben Ausgänge wie die Klangeinstellungen. Steht das Headset dort auch nicht,
wird es vom System nicht erkannt (Kabel/USB/Bluetooth prüfen). Bluetooth-Headsets erscheinen erst,
wenn sie verbunden sind.

**Der Ton wechselt, aber ein Video läuft weiter auf dem alten Ausgang**
Das Mitnehmen laufender Wiedergaben braucht das Programm `pactl`. Nachinstallieren:

```bash
sudo apt install pulseaudio-utils
```

**Applet neu laden, ohne dich abzumelden**
Rechtsklick auf die Leiste → **Fehlerbehebung** → **Cinnamon neu starten**
(oder `Strg` + `Alt` + `Esc`). Offene Fenster bleiben dabei erhalten.

---

**Das Symbol zeigt das falsche Gerät (z. B. Lautsprecher statt Monitor)**
Rechtsklick auf das Symbol → **Konfigurieren …** → bei **Symbol für Klick-Ziel 1/2** das richtige
Symbol fest auswählen.

---

## Für Entwickler: Symbole ändern

Die Symbole werden aus `werkzeuge/symbole_erzeugen.py` erzeugt (nur gefüllte Flächen, damit
Cinnamon sie einfärben kann). Nach einer Änderung:

```bash
python3 werkzeuge/symbole_erzeugen.py
```

`icon.png` (Bild in der Applet-Liste) wird aus `werkzeuge/icon.svg` mit 64 × 64 Pixeln gerendert.

---

## Versionen

**1.1.0** (13.11.2026)
- Eigene Symbole für Headset, Monitor und Lautsprecher statt der Theme-Symbole
  (die sahen teils aus wie Netzwerk oder Lautstärke)
- Buntes Bild für die Applet-Liste
- Neue Einstellung „Symbol für Klick-Ziel 1/2“, um das Symbol fest vorzugeben
- Installer kopiert jetzt auch Unterordner mit

**1.0.0** (13.11.2026)
- Erste Version: Linksklick schaltet zwischen zwei Klick-Zielen um, Rechtsklick-Menü mit allen
  Ausgängen, laufende Wiedergabe wechselt mit, Installer setzt das Applet automatisch in die Leiste

---

Lizenz: MIT
