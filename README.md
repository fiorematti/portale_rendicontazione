# PortaleRendicontazione

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.13.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## 5.3 Processo di Build e Deployment

Si parte sempre da `angular.json`: qui sono dichiarati ingresso (`src/main.ts`), polyfill e asset pubblici, più gli stili e gli script di Bootstrap che vengono inclusi automaticamente. La configurazione di produzione attiva i budget (1 MB sul bundle iniziale e 4 kB per i CSS dei componenti) e l’`outputHashing: all` per avere nomi di file cache-busted, mentre la configurazione di sviluppo lascia attivi mappe e disattiva le ottimizzazioni per debuggare in tranquillità. Se servono asset extra o si vogliono ammorbidire i budget, è proprio qui che si tocca.

Quando bisogna compilare, basta un `npm run build` (alias `npx ng build`): parte di default la configurazione di produzione e gli artefatti finiscono in `dist/portale-rendicontazione`, già con gli hash nei nomi. Per prove rapide si può lanciare `ng build --configuration development`, così si ottiene un build più veloce e facilmente ispezionabile.

Il rilascio su GitHub resta lineare: la cartella `dist/` è già ignorata, quindi si committano solo le sorgenti (`git add . && git commit -m "build: aggiorna app"`) e si spinge il branch (`git push origin <branch>`). Da lì si apre la pull request o si crea un tag/release, e un eventuale workflow GitHub Actions può prendere la cartella `dist/` generata in CI per pubblicare su GitHub Pages o su un server esterno.
