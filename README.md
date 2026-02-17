# dp-rapportering-frontend - Rapporteringsløsning for Dagpenger

## Komme i gang

Appen er basert på [React Router v7](https://reactrouter.com/)

```
pnpm install
pnpm run dev
```

1. Kopier `.env.example` og rename til `.env`. 
2. Sett `IS_LOCALHOST="true"`. 
3. Sett `USE_MSW="true"` dersom du ønsker å kjøre applikasjonen med `msw mock data`. 
4. Sett `USE_MSW="false"` dersom du ønsker å kjøre applikasjonen med `DEV API`.

---

## Kjøre mot dev-APIer i localhost

For å kjøre requester mot dp-rapportering må vi ha et token, dette kan genereres med `pnpm run token`. Det genererte 
tokenet legges automagisk inn i `.env`-filen.

Tokenet kan også genereres med [tokenx-token-generator](https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp:teamdagpenger:dp-rapportering).
Logg på med testid. Hent ut verdien fra `access_token`, rediger `.env` og endre `DP_RAPPORTERING_TOKEN` til det 
nylig genererte tokenet.

Det genererte tokenet vil vare i en time (uavhengig av hvordan det ble generert) før du må generere et nytt token.

Eksempel på riktig config:

```
USE_MSW="false"
IS_LOCALHOST="true"
DP_RAPPORTERING_TOKEN="langStrengHerFraAccess_token"
```

## Potensielle errorer

### Feil node versjon

Kjør `$ nvm use` og det burde løse problemet.

### Manglende autentisering ved installasjon av @navikt npm pakker

Github token er utdatert.

1. Gå til Github
2. Trykk Profil ikon
3. Trykk `Settings`
4. Trykk `Developer settings`
5. Trykk `Personal access token`
6. Trykk `Tokens (classic)`
7. Trykk `Generate new token` --> `Generate new token (classic)`
8. Skriv noe som `NAV IT` under `Note`
9. Velg hvor lenge du vil at det skal vare under `Expiration`
10. Under `Select scope` velg `repo` og `read:packages`
11. Trykk `Generate token`
12. Kopier `ghp_x...` tokenet og putt det i `.npmrc` filen på maskinen din
13. Trykk `Configure SSO`
14. Trykk `Authorize` på `navikt`
15. Ferdig!
