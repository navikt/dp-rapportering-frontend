# dp-rapportering-frontend - Rapporteringsløsning for Dagpenger

## Komme i gang

Appen er basert på [Remix](https://remix.run/docs)

```
npm install
npm run dev
```

Kopier `.env.example` og rename til `.env`.

Sett `IS_LOCALHOST="true"`.

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

## Potensielle errorer

### Feil node versjon

```npm ERR! code EBADENGINE
npm ERR! engine Unsupported engine
npm ERR! engine Not compatible with your version of node/npm: execa@7.1.1
npm ERR! notsup Not compatible with your version of node/npm: execa@7.1.1
npm ERR! notsup Required: {"node":"^14.18.0 || ^16.14.0 || >=18.0.0"}
npm ERR! notsup Actual: {"npm":"9.6.3","node":"v16.13.0"}

npm ERR! A complete log of this run can be found in: /Use
```

Kjør `$ nvm use` og det burde løse problemet.

### Manglende autentisering ved installasjon av @navikt npm pakker

```
npm ERR! code E401
npm ERR! 401 Unauthorized - GET https://npm.pkg.github.com/download/@navikt/dp-auth/0.3.7/5c5965d82448aa24ef9c53430a745429555e153f - unauthenticated: User cannot be authenticated with the token provided.

npm ERR! A complete log of this run can be found in: /Users/<user>/.npm/\_logs/2023-09-05T08_44_38_897Z-debug-0.log
```

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
