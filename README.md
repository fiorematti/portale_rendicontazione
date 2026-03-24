# PortaleRendicontazione

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.13.

## Pagina Ordini: cosa fa e come si usa

La pagina Ordini è la bacheca dove tenere sotto controllo i lavori: in alto c’è la barra di filtro, con la ricerca libera (codice o cliente) e il selettore di stato per passare da “Tutti” a “Ricevuto” o “Fatto”. A destra spicca il bottone scuro “Aggiungi Ordine” con l’icona “+”: cliccandolo si apre la modale per inserire un nuovo ordine, completa di campi per codice ordine, cliente, data di inizio, stato e codice offerta. Per la data c’è l’input formattato con l’icona calendario: toccando l’icona appare il mini calendario, navigabile con le frecce sinistra/destra del mese e selezione del giorno con un click (l’ultimo giorno scelto si evidenzia). Nella modale i bottoni in fondo cambiano etichetta a seconda del contesto: “Conferma” quando si aggiunge un ordine nuovo, “Salva modifiche” quando si modifica, “Annulla” per chiudere senza salvare; se manca qualche campo compare un alert rosso che invita a compilare tutto. Quando si apre un ordine in sola lettura, la modale mostra i dati formattati e i due bottoni “Chiudi” e “Modifica” (quest’ultimo passa direttamente alla modalità di editing).

La tabella centrale elenca gli ordini con colonne per codice, cliente, data inizio, codice offerta e stato; lo stato è visualizzato con un badge che cambia colore tra “Ricevuto” e “Fatto”. Nella colonna Azioni ci sono tre icone: l’occhio apre la modale in sola lettura per vedere i dettagli, la matita apre la stessa modale già in modalità modifica (campi editabili e pulsante “Salva modifiche”), il cestino chiede conferma e poi rimuove l’ordine dalla lista. Filtri e tabella lavorano insieme: la lista si aggiorna al volo mentre si digita o si cambia lo stato selezionato.

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
