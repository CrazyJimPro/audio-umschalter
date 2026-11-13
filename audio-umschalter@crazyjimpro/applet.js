// Audio-Umschalter – Cinnamon-Applet
// Linksklick: zwischen zwei Audioausgängen umschalten (z. B. Monitor-Lautsprecher <-> Headset)
// Mittelklick: Klangeinstellungen öffnen
// Rechtsklick: Ausgang direkt wählen, Klick-Ziele festlegen, Einstellungen
//
// Benutzt dieselbe Bibliothek (Cvc) wie Cinnamons eigenes Lautstärke-Applet und die
// Klangeinstellungen, daher erscheinen hier genau die Ausgänge, die man auch dort sieht.

const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Settings = imports.ui.settings;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Mainloop = imports.mainloop;
const Cvc = imports.gi.Cvc;
const St = imports.gi.St;

const UUID = "audio-umschalter@crazyjimpro";

// Verschiebt alle laufenden Wiedergaben auf den (neuen) Standard-Ausgang.
// Fehlt pactl, passiert einfach nichts.
const STREAMS_MITNEHMEN =
    "command -v pactl >/dev/null 2>&1 || exit 0; " +
    "for i in $(pactl list short sink-inputs | cut -f1); do " +
    "pactl move-sink-input \"$i\" @DEFAULT_SINK@; done";

class AudioUmschalter extends Applet.TextIconApplet {
    constructor(metadata, orientation, panelHeight, instanceId) {
        super(orientation, panelHeight, instanceId);
        this.setAllowedLayout(Applet.AllowedLayout.BOTH);

        this._ausgaenge = new Map(); // Cvc-ID -> MixerUIDevice
        this._aktivId = null;
        this._timeoutId = 0;

        this.settings = new Settings.AppletSettings(this, UUID, instanceId);
        const neu = () => this._aktualisieren();
        this.settings.bind("ziel1", "ziel1", neu);
        this.settings.bind("ziel2", "ziel2", neu);
        this.settings.bind("name1", "name1", neu);
        this.settings.bind("name2", "name2", neu);
        this.settings.bind("meldung", "meldung", null);
        this.settings.bind("streams-mitnehmen", "streamsMitnehmen", null);
        this.settings.bind("zeige-name", "zeigeName", neu);

        // Eigener Bereich oben im Rechtsklick-Menü (Cinnamon hängt danach
        // seine Standardeinträge "Info", "Konfigurieren", "Entfernen" an).
        this._menuBereich = new PopupMenu.PopupMenuSection();
        this._applet_context_menu.addMenuItem(this._menuBereich);

        this._control = new Cvc.MixerControl({ name: "Audio-Umschalter" });
        this._signale = [
            this._control.connect("state-changed", () => this._zustandGeaendert()),
            this._control.connect("output-added", (c, id) => this._ausgangHinzu(id)),
            this._control.connect("output-removed", (c, id) => this._ausgangWeg(id)),
            this._control.connect("active-output-update", (c, id) => {
                this._aktivId = id;
                this._aktualisieren();
            }),
        ];
        this._control.open();

        this._aktualisieren();
    }

    // ---------- Klicks ----------

    on_applet_clicked(event) {
        this._umschalten();
    }

    on_applet_middle_clicked(event) {
        Util.spawnCommandLine("cinnamon-settings sound");
    }

    on_applet_removed_from_panel() {
        if (this._timeoutId) {
            Mainloop.source_remove(this._timeoutId);
            this._timeoutId = 0;
        }
        for (const id of this._signale) this._control.disconnect(id);
        this._control.close();
        this.settings.finalize();
    }

    // ---------- Cvc-Ereignisse ----------

    _zustandGeaendert() {
        if (this._control.get_state() !== Cvc.MixerControlState.READY) return;
        const sink = this._control.get_default_sink();
        if (sink) {
            const dev = this._control.lookup_device_from_stream(sink);
            if (dev) this._aktivId = dev.get_id();
        }
        this._aktualisieren();
    }

    _ausgangHinzu(id) {
        const dev = this._control.lookup_output_id(id);
        if (!dev) return;
        this._ausgaenge.set(id, dev);
        this._aktualisieren();
    }

    _ausgangWeg(id) {
        this._ausgaenge.delete(id);
        if (this._aktivId === id) this._aktivId = null;
        this._aktualisieren();
    }

    // ---------- Hilfsfunktionen ----------

    // Stabiler Schlüssel über Neustarts hinweg (die Cvc-IDs ändern sich).
    _schluessel(dev) {
        return (dev.get_origin() || "") + "|" + (dev.get_description() || "");
    }

    _finde(schluessel) {
        if (!schluessel) return null;
        for (const dev of this._ausgaenge.values()) {
            if (this._schluessel(dev) === schluessel) return dev;
        }
        return null;
    }

    _aktiv() {
        return this._aktivId !== null ? (this._ausgaenge.get(this._aktivId) || null) : null;
    }

    // Name für Leiste/Meldungen: eigener Name, sonst Beschreibung des Ausgangs.
    _nameFuerSchluessel(schluessel) {
        if (schluessel && schluessel === this.ziel1 && this.name1) return this.name1;
        if (schluessel && schluessel === this.ziel2 && this.name2) return this.name2;
        const teile = (schluessel || "").split("|");
        return teile.length > 1 ? teile.slice(1).join("|") : (schluessel || "?");
    }

    _kurzName(dev) {
        return this._nameFuerSchluessel(this._schluessel(dev));
    }

    // Voller Name fürs Menü: "Kopfhörer – USB Audio Headset"
    _langName(dev) {
        const desc = dev.get_description() || "?";
        const origin = dev.get_origin();
        return origin ? `${desc} – ${origin}` : desc;
    }

    _symbol(dev) {
        if (!dev) return "audio-speakers-symbolic";
        const text = [
            dev.get_description(), dev.get_origin(), dev.get_icon_name(), dev.get_port(),
        ].join(" ").toLowerCase();
        if (/headset|headphone|kopfh|hörer|hoerer|earphone|earbud|buds/.test(text))
            return "audio-headphones-symbolic";
        if (/hdmi|displayport|monitor|bildschirm|display/.test(text))
            return "video-display-symbolic";
        return "audio-speakers-symbolic";
    }

    _melden(text) {
        if (this.meldung) Main.notify(text);
    }

    // ---------- Umschalten ----------

    _umschalten() {
        if (this._ausgaenge.size === 0) {
            Main.notify("Audio-Umschalter", "Keine Audioausgänge gefunden.");
            return;
        }

        const aktiv = this._aktiv();
        let ziel = null;

        if (this.ziel1 && this.ziel2) {
            const a = this._finde(this.ziel1);
            const b = this._finde(this.ziel2);
            if (a && b) {
                ziel = (aktiv === a) ? b : a;
            } else {
                // Eins der beiden Ziele fehlt gerade (z. B. Headset ausgesteckt).
                const vorhanden = a || b;
                const fehlt = a ? this.ziel2 : this.ziel1;
                if (vorhanden && vorhanden !== aktiv) {
                    ziel = vorhanden;
                } else {
                    Main.notify("Audio-Umschalter",
                        `„${this._nameFuerSchluessel(fehlt)}“ ist gerade nicht verfügbar.`);
                    return;
                }
            }
        } else {
            // Keine zwei Klick-Ziele festgelegt: alle Ausgänge reihum.
            const liste = [...this._ausgaenge.values()];
            const i = liste.indexOf(aktiv);
            ziel = liste[(i + 1) % liste.length];
        }

        this._wechseln(ziel);
    }

    _wechseln(dev) {
        if (!dev) return;
        this._control.change_output(dev);
        this._aktivId = dev.get_id();
        this._aktualisieren();
        this._melden(`Ton über: ${this._kurzName(dev)}`);

        if (this.streamsMitnehmen) {
            if (this._timeoutId) Mainloop.source_remove(this._timeoutId);
            // Kurz warten, bis der Tonserver den neuen Standard-Ausgang übernommen hat.
            this._timeoutId = Mainloop.timeout_add(700, () => {
                this._timeoutId = 0;
                Util.spawn(["sh", "-c", STREAMS_MITNEHMEN]);
                return false;
            });
        }
    }

    _zielSetzen(nummer, schluessel) {
        this.settings.setValue("ziel" + nummer, schluessel);
        this["ziel" + nummer] = schluessel;
        this._aktualisieren();
    }

    // ---------- Anzeige ----------

    _aktualisieren() {
        const aktiv = this._aktiv();
        this.set_applet_icon_symbolic_name(this._symbol(aktiv));

        if (this.zeigeName && aktiv) this.set_applet_label(this._kurzName(aktiv));
        else this.set_applet_label("");

        let tipp = aktiv ? `Ton über: ${this._kurzName(aktiv)}` : "Audio-Umschalter";
        if (this.ziel1 && this.ziel2) {
            const naechstes = (aktiv && this._schluessel(aktiv) === this.ziel1) ? this.ziel2 : this.ziel1;
            tipp += `\nKlick: auf „${this._nameFuerSchluessel(naechstes)}“ umschalten`;
        } else {
            tipp += "\nKlick: nächster Ausgang (Klick-Ziele per Rechtsklick festlegen)";
        }
        tipp += "\nRechtsklick: Auswahl  ·  Mittelklick: Klangeinstellungen";
        this.set_applet_tooltip(tipp);

        this._menuNeuAufbauen(aktiv);
    }

    _menuNeuAufbauen(aktiv) {
        this._menuBereich.removeAll();

        const titel = new PopupMenu.PopupMenuItem("Ausgabe wählen", { reactive: false });
        this._menuBereich.addMenuItem(titel);

        if (this._ausgaenge.size === 0) {
            this._menuBereich.addMenuItem(
                new PopupMenu.PopupMenuItem("  (keine Ausgänge gefunden)", { reactive: false }));
        }

        for (const dev of this._ausgaenge.values()) {
            const s = this._schluessel(dev);
            let text = this._langName(dev);
            if (s === this.ziel1) text += "   [Ziel 1]";
            else if (s === this.ziel2) text += "   [Ziel 2]";
            const item = new PopupMenu.PopupIconMenuItem(text, this._symbol(dev), St.IconType.SYMBOLIC);
            item.setShowDot(dev === aktiv);
            item.connect("activate", () => this._wechseln(dev));
            this._menuBereich.addMenuItem(item);
        }

        this._menuBereich.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this._menuBereich.addMenuItem(this._zielMenue(1));
        this._menuBereich.addMenuItem(this._zielMenue(2));

        const klang = new PopupMenu.PopupIconMenuItem("Klangeinstellungen öffnen",
            "preferences-desktop-sound-symbolic", St.IconType.SYMBOLIC);
        klang.connect("activate", () => Util.spawnCommandLine("cinnamon-settings sound"));
        this._menuBereich.addMenuItem(klang);
    }

    _zielMenue(nummer) {
        const aktuell = this["ziel" + nummer];
        const anzeige = aktuell ? this._nameFuerSchluessel(aktuell) : "nicht festgelegt";
        const sub = new PopupMenu.PopupSubMenuMenuItem(`Klick-Ziel ${nummer}: ${anzeige}`);

        const keins = new PopupMenu.PopupMenuItem("Nicht festlegen (Klick schaltet reihum)");
        keins.setShowDot(!aktuell);
        keins.connect("activate", () => this._zielSetzen(nummer, ""));
        sub.menu.addMenuItem(keins);

        let gefunden = !aktuell;
        for (const dev of this._ausgaenge.values()) {
            const s = this._schluessel(dev);
            const item = new PopupMenu.PopupMenuItem(this._langName(dev));
            item.setShowDot(s === aktuell);
            if (s === aktuell) gefunden = true;
            item.connect("activate", () => this._zielSetzen(nummer, s));
            sub.menu.addMenuItem(item);
        }

        // Gespeichertes Ziel, das gerade nicht angeschlossen ist, trotzdem anzeigen.
        if (!gefunden) {
            const weg = new PopupMenu.PopupMenuItem(
                `${this._nameFuerSchluessel(aktuell)} (gerade nicht verfügbar)`, { reactive: false });
            weg.setShowDot(true);
            sub.menu.addMenuItem(weg);
        }
        return sub;
    }
}

function main(metadata, orientation, panelHeight, instanceId) {
    return new AudioUmschalter(metadata, orientation, panelHeight, instanceId);
}
