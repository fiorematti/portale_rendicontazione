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

## Sezione tesi 2.2 – Gestione collaborativa con GitHub: Branching strategy, flussi di commit e documentazione tecnica

Per la tesi ho scelto GitHub perché è il posto più comodo per lavorare in squadra (anche quando la “squadra” sono solo io e il mio futuro me stesso). È un servizio di hosting di repository Git con un’interfaccia web piena di strumenti: issue, pull request, wiki, action, protezioni di branch. Mi permette di salvare il codice nel cloud, avere versioni sempre recuperabili e condividere facilmente il lavoro con chi deve rivederlo.

La strategia di branching che ho adottato è semplice e sostenibile. Main resta sempre stabile e deployabile; non ci commetto direttamente. Quando devo aggiungere una feature apro un branch `feature/<nome-breve>` partendo da main, lavoro lì e poi faccio una pull request. Se c’è un bug urgente, uso `hotfix/<descrizione>`, lo correggo e lo porto su main con una PR veloce. In questo modo ogni modifica vive in un contesto isolato e posso eliminarla se qualcosa va storto. Le protezioni di branch evitano push diretti e mi obbligano a passare da una revisione.

Sul flusso di commit mi tengo leggero ma ordinato: tante PR piccole, titoli chiari, descrizioni che spiegano cosa cambia e perché. I messaggi di commit seguono uno schema descrittivo (es. `fix: gestisce errori 401 in login`) per rendere il log leggibile. Prima di aprire una PR faccio un rebase o un merge da main per ridurre conflitti, e lascio che la pipeline (anche solo i test locali) giri per avere un minimo di qualità automatica.

La documentazione tecnica vive nello stesso repository perché deve viaggiare con il codice. Aggiorno il README quando cambia qualcosa di visibile e tengo note più dettagliate in file markdown dedicati (ad esempio per decisioni architetturali o procedure di deploy). Ogni PR che tocca funzionalità o processi deve includere anche l’aggiornamento della doc: è l’unico modo per evitare wiki staccate dalla realtà. In pratica GitHub diventa sia “codice sorgente” sia “sorgente di verità” per come lavoriamo.
