# WordPress-testpaket

Tillägget visar den fristående kartprototypen i WordPress med shortcoden:

```text
[akupunktor_karta]
```

## Skapa ZIP-paket

GitHub Actions bygger paketet automatiskt när ändringarna skickas till GitHub. Under **Actions → Bygg WordPress-paket** finns artefakten **akupunkturforbundet-karta-wordpress** att ladda ner.

För att skapa samma paket lokalt, kör från repositoryts rot:

```bash
mkdir -p release
cd wordpress-plugin
zip -r ../release/akupunkturforbundet-karta-0.3.2.zip akupunkturforbundet-karta
```

Installera ZIP-filen endast på den lösenordsskyddade testmiljön.

## Befintliga medlemsuppgifter

Tillägget läser automatiskt alla publicerade poster av innehållstypen `medlemmar` och återanvänder de befintliga ACF-fälten `namn`, `ort`, `adress`, `telefonnummer`, `e-postadress` och `hemsida`. Ingen separat medlemsfil ska skapas eller underhållas.

Kartpositionerna tas fram stegvis från de publicerade mottagningsadresserna via OpenStreetMaps geokodningstjänst Nominatim och sparas som tekniska metadata på medlemsposten. Endast en adress behandlas per körning för att inte belasta tjänsten. Efter installationen kan det därför ta några timmar innan samtliga medlemmar syns på kartan. När en adress ändras uppdateras dess kartposition automatiskt.

## Begränsningar i testversionen

- Leaflet hämtas från unpkg och kartbilder från OpenStreetMap. Produktionsleverantörer ska beslutas före lansering.
- Endast medlemmar som har en fullständig adress och har fått en kartposition visas. Kontrollera poster som saknas från kartan under **Medlemmar** i WordPress.
- Installera inte tillägget på den publika webbplatsen i detta skede.
