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
zip -r ../release/akupunkturforbundet-karta-0.1.0.zip akupunkturforbundet-karta
```

Installera ZIP-filen endast på den lösenordsskyddade testmiljön. Tillägget innehåller enbart fiktiva personer.

## Begränsningar i testversionen

- Leaflet hämtas från unpkg och kartbilder från OpenStreetMap. Produktionsleverantörer ska beslutas före lansering.
- Medlemsuppgifterna redigeras i tilläggets PHP-fil. Någon administration eller import ingår ännu inte.
- Installera inte tillägget på den publika webbplatsen i detta skede.
