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

## 3 Motivazioni tecniche del portale

### 3.1 Il Framework Angular v20: Motivazioni tecniche della scelta, vantaggi di TypeScript e utilizzo di feature moderne (Signals, Standalone Components)

Per questo progetto si è puntato su Angular 20 perché offre un mix bilanciato tra maturità e innovazione. La versione 20 è già rodata, supportata a lungo termine e accompagnata da una toolchain (CLI, build system, schematics) che fa risparmiare tempo in tutte le fasi: scaffolding, linting, ottimizzazioni di bundle e configurazioni di test. In un contesto dove il team deve consegnare feature velocemente ma mantenere coerenza e qualità, Angular 20 permette di avere convenzioni chiare, aggiornamenti prevedibili e un ecosistema di librerie compatibili senza rincorrere patch manuali. Inoltre, le novità del ciclo v17+ (come il nuovo rendering pipeline più leggero, hydration migliorata e deferrable views) sono ormai stabili in v20 e aiutano a tenere le performance sotto controllo anche su dispositivi meno performanti.

La scelta di TypeScript è quasi naturale in questo scenario. Tipi espliciti, interfacce e classi rendono il codice auto-documentante e permettono di intercettare errori prima ancora che arrivino al browser. Sugli oggetti di dominio (ordini, utenti, spese, attività) i tipi evitano accessi sbagliati ai campi e facilitano l’autocomplete negli editor, riducendo il tempo di onboarding per chi entra sul progetto. Il controllo statico aiuta anche quando si cambiano API o si refactorizza: se un payload cambia, il compilatore segnala tutti i punti interessati, evitando bug silenziosi. Il risultato è un flusso di sviluppo più rilassato e prevedibile, con meno sorprese in fase di test.

Tra le feature moderne che si stanno sfruttando, i Signals sono probabilmente la più interessante. Offrono un modello reattivo più intuitivo rispetto al classico change detection a zone: ogni Signal notifica in modo puntuale chi lo osserva, evitando ricalcoli inutili. Per liste di dati, filtri o stati di loading è più facile ragionare su dove nasce il dato e chi lo consuma, senza dover orchestrare Subject/Subscription manuali. I computed e gli effect permettono di derivare valori (per esempio la somma di un totale o il messaggio da mostrare) in modo dichiarativo, mantenendo il componente snello. Questo approccio migliora anche i test: basta impostare il Signal di input e verificare l’output calcolato senza mockare il change detection.

I Standalone Components, introdotti per liberarsi dalla complessità dei moduli, sono l’altra chiave per tenere il codice modulare e facilmente componibile. Ogni componente dichiara da sé le proprie dipendenze e può essere importato direttamente nelle route o in altri componenti, senza passare da NgModule centrali difficili da mantenere. Questo riduce il rischio di import circolari, migliora il tree-shaking e rende più semplice dividere il lavoro tra squadre: si può sviluppare una pagina o un widget in autonomia, sapendo che l’integrazione richiederà poche righe di configurazione. Per il progetto significa tempi di review più brevi e deploy più sicuri, perché il perimetro di ogni modifica è più chiaro.

In sintesi, Angular 20 + TypeScript danno una base solida, mentre Signals e Standalone Components sbloccano uno stile di sviluppo più moderno, leggibile e facile da testare. Il risultato pratico è un portale che resta veloce da evolvere, stabile nel tempo e capace di accogliere nuove funzionalità senza aumentare il debito tecnico.
