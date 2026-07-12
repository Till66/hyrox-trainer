# HYROX Trainer

Eine kleine Web-App, um dein HYROX-Training zu tracken: Profil anlegen, den
Pfad mit 8 Läufen (je 1 km) und 8 Stationen ausfüllen, Training speichern und
deinen Fortschritt über die Zeit im Graphen sehen.

Reines HTML/CSS/JavaScript, kein Build-Schritt nötig – die App läuft direkt
im Browser über GitHub Pages.

**Live:** https://till66.github.io/hyrox-trainer/

## Wichtig: wie Daten gespeichert werden

Die App speichert alle Daten **lokal im Browser** des jeweiligen Geräts
(`localStorage`). Das bedeutet:

- Kein Login mit Passwort nötig – nur ein Benutzername pro Profil.
- Mehrere Personen können dieselbe App-URL nutzen, aber jede Person hat ihre
  eigenen Daten nur auf ihrem eigenen Handy/Browser (dein Handy und dein
                                                       Laptop synchronisieren sich **nicht** automatisch, und du siehst nicht die
                                                       Trainings deiner Freunde).
- Wenn du den Browser-Cache/-Daten löschst, sind auch die Trainingsdaten weg.

Das war die bewusst gewählte einfache Variante für den Start. Falls ihr
später echte Accounts mit Sync über alle Geräte wollt (z. B. damit du und
                                                       deine Freunde eure Trainings gegenseitig sehen könnt), lässt sich das
nachrüsten – am einfachsten mit einem kostenlosen Backend wie Supabase.

## Freunde einladen

Schick den Link einfach an deine Freunde. Jede Person öffnet ihn, legt beim
ersten Öffnen ihr eigenes Profil (Benutzername, Gewicht, Größe,
                                  Sportlichkeit) an und trackt ab dann ihr eigenes Training – alles läuft in
derselben App, aber lokal getrennt pro Gerät. Über "Zum Home-Bildschirm
hinzufügen" landet die App als eigenes Icon auf dem Handy.

## Struktur

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst, lädt Chart.js (für den Fortschritts-Graphen), Icons sind inline eingebettet |
| `stations.js` | Die 8 HYROX-Stationen in offizieller Reihenfolge inkl. Richtwerten |
| `app.js` | Gesamte App-Logik: Profile, Pfad, Speichern, Graph, Historie |
| `styles.css` | Dunkles HYROX-Design (Schwarz/Rot), mobil-optimiert |
| `manifest.json` | Für "Zum Home-Bildschirm hinzufügen" (Icons als data-URI eingebettet) |
