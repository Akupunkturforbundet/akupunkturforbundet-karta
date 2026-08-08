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

Installera ZIP-filen endast på den lösenordsskyddade testmiljön. Tillägget använder fiktiva personer så länge ingen lokal medlemsfil har lagts till.

## Testa med verkliga medlemmar

1. Kopiera `akupunkturforbundet-karta/medlemmar.local.php.example` till `akupunkturforbundet-karta/medlemmar.local.php`.
2. Ersätt exempelposten med endast de kontakt- och mottagningsuppgifter som respektive medlem har godkänt för publicering. Kopiera arrayblocket för att lägga till fler personer.
3. Ange en unik `id` för varje medlem samt korrekta koordinater i `latitude` och `longitude`. Webbplatser ska anges med `https://`.
4. Skapa ZIP-paketet först efter att den lokala medlemsfilen har lagts till. Kontrollera kartan enbart i förbundets lösenordsskyddade testmiljö.

`medlemmar.local.php` är Git-ignorerad så att verkliga medlemsuppgifter inte av misstag hamnar i repositoryt. Mallen innehåller inga verkliga personuppgifter. Skicka inte medlemsfilen via GitHub eller andra publika kanaler.

## Begränsningar i testversionen

- Leaflet hämtas från unpkg och kartbilder från OpenStreetMap. Produktionsleverantörer ska beslutas före lansering.
- Medlemsuppgifterna läses från den lokala filen `medlemmar.local.php`. Någon administration eller automatisk import ingår ännu inte.
- Installera inte tillägget på den publika webbplatsen i detta skede.
