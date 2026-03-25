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

Il giro inizia sempre da `angular.json`: lì sono indicati l’entrypoint (`src/main.ts`), i polyfill e gli asset pubblici, insieme agli stili/script di Bootstrap caricati in automatico. La build di produzione accende i budget (1 MB sul bundle iniziale e 4 kB sui CSS dei componenti) e l’`outputHashing: all` per generare file già cache-busted; la build di sviluppo, invece, tiene attive le source map e spegne le ottimizzazioni per rendere il debug più comodo. Se servono asset extra o budget più larghi, è quello il file da toccare.

Per compilare basta `npm run build` (alias `npx ng build`): parte di default la produzione e gli artefatti finiscono in `dist/portale-rendicontazione`, già con gli hash nel nome. Se serve un giro veloce e leggibile, `ng build --configuration development` produce un output meno ottimizzato ma più immediato da ispezionare.

Il deploy su GitHub è altrettanto diretto: `dist/` è già in `.gitignore`, quindi si versionano solo le sorgenti (`git add . && git commit -m "build: aggiorna app"`) e si fa push del branch (`git push origin <branch>`). Da lì si apre la pull request o si tagga una release; un eventuale workflow GitHub Actions può eseguire la build in CI e pubblicare l’output su GitHub Pages o su un host esterno.
