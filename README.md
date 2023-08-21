# dp-rapportering-frontend - Rapporteringsløsning for Dagpenger

## Komme i gang

Appen er basert på [Remix](https://remix.run/docs)

```
npm install
npm run dev
```

Kopier `.env.example` og rename til `.env`.

Sett `USE_MSW="true"` dersom du ønsker å kjøre applikasjonen med `msw mock data`.

Sett `USE_MSW="false"` dersom du ønsker å kjøre applikasjonen med `DEV API`.

---

## Kjøre mot dev-APIer i localhost

For å kjøre requester mot dp-rapportering må vi ha et token, generert med [wonderwalled-idporten](https://wonderwalled-idporten.intern.dev.nav.no/api/obo?aud=dev-gcp:teamdagpenger:dp-rapportering). Logg på med testid. Hent ut verdien fra `access_token`, rediger `.env` og endre `DP_RAPPORTERING_TOKEN` til det nylig genererte tokenet. Env-variabelen `IS_LOCALHOST="true"` må også være satt.

Dette tokenet vil vare i en time før du må generere et nytt token.

Eksempel på riktig config:

```
USE_MSW="false"
IS_LOCALHOST="true"
DP_RAPPORTERING_TOKEN="langStrengHerFraAccess_token"
```
