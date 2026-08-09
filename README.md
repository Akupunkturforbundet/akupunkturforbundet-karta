# Hitta akupunktör – kartprototyp

En fristående prototyp för Svenska Akupunkturförbundets kommande kartfunktion. Besökaren kan söka efter en ansluten akupunktör på namn, ort eller postnummer och se träffarna direkt i en resultatlista och på kartan. Varje träff kan visa namn, mottagning, adress, telefon, e-post och webbplats.

Den fristående Vite-prototypen använder fiktiva testuppgifter. WordPress-testpaketet återanvänder i stället webbplatsens redan publicerade poster under **Medlemmar**.

## Kom igång

```bash
npm install
npm run dev
```

Vite visar vilken lokal adress som ska öppnas i webbläsaren.

## Kontroller

```bash
npm test
npm run build
```

## Avgränsning

- Uppgifterna i `src/data/practitioners.ts` är fiktiva och används endast i den fristående prototypen. WordPress-tillägget läser publicerade medlemsuppgifter direkt från WordPress.
- Sökningen matchar hela eller delar av namnet samt angiven ort eller postnummer. Den söker inte automatiskt i närliggande områden.
- Besökarens aktuella position ingår inte i den här första versionen.
- Kartan använder OpenStreetMaps publika kartlager under prototyparbetet. Kartleverantör ska beslutas innan produktionssättning.

## Test i WordPress

GitHub Actions skapar det nedladdningsbara testpaketet `akupunkturforbundet-karta-0.3.2.zip` automatiskt. Hämta artefakten **akupunkturforbundet-karta-wordpress** från den senaste körningen av arbetsflödet **Bygg WordPress-paket**. Installera paketet endast på förbundets privata testmiljö och placera shortcoden `[akupunktor_karta]` på en testsida.
