# Audio-Umschalter

Ein Applet für die Leiste von **Linux Mint Cinnamon**. Ein Klick darauf schaltet den Ton um,
zum Beispiel zwischen den **Lautsprechern am Monitor** und dem **Headset**. Du musst dafür nicht
mehr in die Klangeinstellungen.

- **Linksklick:** zwischen deinen zwei Klick-Zielen umschalten
- **Rechtsklick:** alle Ausgänge sehen und direkt einen wählen, Klick-Ziele festlegen
- **Mittelklick:** Klangeinstellungen öffnen
- Das Symbol zeigt, was gerade aktiv ist: 🎧 Headset/Kopfhörer, 🖥 Monitor (HDMI/DisplayPort), 🔈 Lautsprecher
- Musik, Videos oder Anrufe, die gerade laufen, wandern sofort mit auf den neuen Ausgang

Das Applet benutzt dieselbe Technik wie Cinnamons eigenes Lautstärke-Symbol. Darum findest du
hier genau die Ausgänge wieder, die auch in den Klangeinstellungen stehen.

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

Version 1.0.0 · Lizenz: MIT
