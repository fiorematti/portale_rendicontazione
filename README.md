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

## 3.3 Organizzazione del Workspace in VS Code: cartelle dei progetti

Aprendo il progetto in VS Code si vede subito la classica struttura Angular, ma vale la pena fare un giro guidato per orientarsi.

Nella root ci sono i file di configurazione principali: `angular.json` governa i target di build e le impostazioni CLI, mentre `package.json` e `package-lock.json` elencano le dipendenze e gli script (`ng serve`, `ng test`, ecc.).

I vari `tsconfig*.json` gestiscono la compilazione TypeScript per app e test. La cartella `public/` contiene asset statici condivisi (favicon e logo), così da essere serviti direttamente senza passare dal bundler.

Il cuore sta in `src/`. Qui `main.ts` bootstrappa l’app con `bootstrapApplication(AppComponent, appConfig)`.

La configurazione vive in `src/app/app.config.ts`, dove si vede l’iniezione del router, dell’`HttpClient` e dell’MSAL per l’autenticazione. Subito accanto c’è `app.routes.ts`, la mappa delle rotte: login pubblico e tutte le schermate protette con l’`authGuard`. Il componente root è definito in `app.ts` con il template `app.html` e gli stili `app.css`.

Dentro `src/app/` le cartelle sono ordinate per responsabilità. `components/` raccoglie le pagine principali, ognuna composta da tre file (`*.ts`, `*.html`, `*.css`): 
- `attivita/` gestisce la creazione e modifica delle attività (service dedicato `attivitaservice.ts`).
- `note-spese/` per inserire e validare le note spese, con relativo `note-spese.service.ts`.
- `registro-attivita/` e `registro-note/` mostrano i registri, entrambi con servizi per le chiamate API.
- `tariffa-km/`, `ordini/`, `clienti/`, `utenti/` completano le viste amministrative.
Ogni cartella è autocontenuta: logica nel file TypeScript, markup nel template e stile modulare nel CSS, così da mantenere chiaro il perimetro di ciascuna feature.

La cartella `auth/` contiene tutto ciò che riguarda accesso e protezione: `auth.service.ts` incapsula la logica MSAL, `auth.interceptor.ts` aggancia il token alle richieste, `auth.guard.ts` blocca le rotte non autorizzate e `login.ts/html/css` gestisce la pagina di login. I DTO scambiati con le API sono in `dto/` (ad esempio i modelli per clienti, ordini, automobili, luoghi e la risposta di autenticazione), mentre `mappers/` ospita la logica di trasformazione (`authmapper.ts`). Le configurazioni di ambiente vivono in `config/env.ts`, con base URL e parametri MSAL centralizzati.

La cartella `shared/` è la cassetta degli attrezzi riusabili: 
- `shared/navbar/` contiene il componente di navigazione comune.
- `shared/services/` espone servizi trasversali come `clienti-ordini.service.ts`.
- `shared/models/` definisce modelli tipizzati (`attachment.model.ts`, `export.model.ts`).
- `shared/utils/` raccoglie utility per date, input, download file, gestione del DOM e attachment.
Questa separazione permette di importare pezzi condivisi senza duplicare codice nelle singole feature.

Completano il quadro `src/styles.css` per gli stili globali e `src/index.html` come host page.

In VS Code ha senso tenere l’esplora risorse aperto e pinnare le cartelle `components` e `shared` per saltare rapidamente tra le viste e le utility. Anche la search di VS Code torna utile per seguire le chiamate API: i servizi sono quasi sempre nello stesso folder del componente oppure in `shared/services` se condivisi.

Infine, ricordarsi che il routing è definito in un unico punto (`app.routes.ts`), quindi aggiungere una pagina nuova significa creare il componente sotto `components/` e registrarlo lì. Con questa mappa mentale diventa più semplice muoversi nel workspace senza perdersi tra i file.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
