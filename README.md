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

La regia sta in `angular.json`: definisce l’entrypoint (`src/main.ts`), polyfill e asset pubblici, e include automaticamente stili/script di Bootstrap. La build di produzione applica i budget (1 MB per il bundle iniziale, 4 kB per i CSS dei componenti) e usa `outputHashing: all` per nomi già cache-busted; quella di sviluppo mantiene le source map e disattiva le ottimizzazioni per un debug comodo. Se servono asset extra o budget più permissivi, è lì che si interviene.

Per compilare: `npm run build` (alias `npx ng build`). Di default usa la produzione e deposita tutto in `dist/portale-rendicontazione` con hash nel nome. Per un giro rapido e leggibile: `ng build --configuration development`, con output meno ottimizzato ma più semplice da ispezionare.

Il rilascio su GitHub resta lineare: `dist/` è già in `.gitignore`, quindi si versionano solo le sorgenti (`git add . && git commit -m "build: aggiorna app"`) e si fa push del branch (`git push origin <branch>`). Poi si apre una pull request o si tagga una release; un workflow GitHub Actions può costruire in CI e pubblicare l’output su GitHub Pages o su un host esterno.
