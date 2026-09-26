# Apex Color +

Calibração de display (Electron + Angular).

## Desenvolvimento

```bash
npm install
npm run electron:dev
```

## Build local (instalador Windows)

```bash
npm run dist:win
```

O instalador NSIS sai em `release/ApexColorPlus-Setup-<versão>.exe`.

## Release no GitHub Actions

1. Atualize a versão em `package.json` (ex.: `0.1.1`)
2. Commit e push para `main`
3. Crie e envie a tag correspondente:

```bash
git tag v0.1.1
git push origin v0.1.1
```

O workflow `.github/workflows/release.yml` sobe o `.exe`, `.blockmap` e `latest.yml` no GitHub Release. O app verifica updates via `electron-updater`.
