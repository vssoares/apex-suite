# Apex Suite

App Electron + Angular 22 (TypeScript) baseado nos protótipos em `prototype/`.  
Por enquanto apenas o **layout** (sem lógica de funcionalidades).

## Requisitos

- Node.js 22+

## Scripts

```bash
# UI no browser (http://localhost:4444)
npm start

# App Electron (dev) — Angular na porta 4444
npm run electron:dev

# Build Angular
npm run build

# Compilar processo Electron
npm run build:electron
```

## Ícones

Todos os Material Icons (outline) são registrados uma vez em `app.config.ts` via `@ng-icons`.  
O wrapper `<app-icon name="rocket_launch" />` continua sendo a API usada nos templates.

## Estilos

- Tailwind CSS v4 (`src/styles.css` + `.postcssrc.json`)
- Tema Apex em `@theme` (cores do protótipo: `surface`, `primary`, `outline-variant`…)
- Bridge `:root` mantém `var(--surface)` etc. para SCSS dos componentes

Exemplos: `bg-surface`, `text-on-surface-variant`, `border-outline-variant`, `text-primary`

## Rotas

- `#/game-booster`
- `#/display-cores`
- `#/perfis-de-jogos` (placeholder)
- `#/configuracoes` (placeholder)
