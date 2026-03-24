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

## Analisi dell'Usabilità (UX)

### Facilità di navigazione e accessibilità dell'interfaccia sviluppata

_Nota_: sezione redatta in italiano poiché costituisce un estratto della tesi. La sezione documenta sinteticamente l’analisi di usabilità svolta sul portale di rendicontazione, con focus su navigazione e accessibilità dell’interfaccia.

#### Obiettivi e metrica di riferimento
- **Facilità di navigazione**: ridurre il numero di click e il tempo necessari per raggiungere le aree chiave (Attività, Note spese, Registro attività, Registro note, Anagrafica Clienti/Utenti).
- **Accessibilità**: garantire che i principali flussi siano fruibili anche tramite tastiera e lettori di schermo, sfruttando semantica HTML e attributi ARIA di supporto.

#### Metodologia
- **Heuristic review** basata sulle 10 euristiche di Nielsen (coerenza, visibilità dello stato di sistema, prevenzione errori).
- **Walkthrough di compiti**: creazione/ricerca attività, inserimento nota spese, consultazione registri.
- **Verifica tecnica**: controllo della struttura semantica (header/nav/main), uso di Bootstrap 5 per layout responsive, presenza di etichette e aria-label.

#### Risultati sulla navigazione
- **Struttura chiara**: sidebar persistente con icone e testo (routerLink) per l’accesso diretto alle sezioni principali; header compatto con informazioni utente.
- **Coerenza visiva**: pulsanti e campi condividono la stessa resa grafica (classi Bootstrap e stili personalizzati), riducendo la curva di apprendimento.
- **Riduzione carico cognitivo**: filtri e azioni contestuali sono collocati vicino ai dati che manipolano (es. filtri elenco utenti, form di inserimento note).
- **Responsive design**: layout basato su grid Bootstrap, con adattamento fluido su dispositivi tablet e desktop; sidebar collassabile per scenari a minore ampiezza.

#### Risultati sull’accessibilità
- **Semantica di navigazione**: uso di `<nav>` con `aria-label` per la barra laterale e dell’attributo `aria-label` per l’area profilo utente, migliorando l’annuncio ai lettori di schermo.
- **Controlli standard HTML**: link e pulsanti nativi preservano gestione focus e attivazione via tastiera; i campi di input hanno etichette visibili o associate.
- **Contrasto e feedback**: palette con fondo chiaro e testo scuro, combinata con stati attivi/hover sugli elementi di navigazione, aiuta l’orientamento; i modali evidenziano il contenuto attivo.

#### Punti di attenzione e miglioramento continuo
- Introdurre **test di usabilità quantitativi** (time-on-task e System Usability Scale - SUS, metrica standardizzata della facilità d’uso percepita) su un campione di utenti interni.
- Estendere gli **aria-label** ai pulsanti iconici e assicurare descrizioni alternative per loghi/immagini decorative.
- Validare i livelli di **contrasto** con strumenti automatici (es. axe, Lighthouse) e aggiungere indicatori di focus più marcati per l’uso da tastiera.
