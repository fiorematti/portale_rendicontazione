# PortaleRendicontazione

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.13.

## Pagina Ordini - funzionalità e utilizzo

La pagina Ordini è la bacheca dove tenere sotto controllo i lavori. In alto c’è la barra di filtro con la ricerca libera (codice o cliente) e il selettore di stato per passare da “Tutti” a “Ricevuto” o “Fatto”.

A destra spicca il bottone scuro “Aggiungi Ordine” con l’icona “+”: cliccandolo si apre la modale per inserire un nuovo ordine, con i campi per codice ordine, cliente, data di inizio, stato e codice offerta.

Per la data c’è l’input con l’icona calendario: toccandola appare il mini calendario, navigabile con le frecce di mese e con la selezione del giorno (quello scelto si evidenzia).

Nella modale i bottoni in basso cambiano etichetta: “Conferma” quando si aggiunge, “Salva modifiche” quando si è in modifica, “Annulla” per chiudere senza salvare; se manca qualche campo compare un alert rosso. In sola lettura la modale mostra i dati e i bottoni “Chiudi” e “Modifica” (che porta subito all’editing).

La tabella elenca gli ordini con colonne per codice, cliente, data inizio, codice offerta e stato; il badge di stato cambia colore tra “Ricevuto” e “Fatto”. Nella colonna Azioni ci sono tre icone: occhio (apre il dettaglio), matita (apre la modale già in modifica), cestino (chiede conferma ed elimina). Filtri e tabella lavorano insieme: la lista si aggiorna mentre si digita o si cambia lo stato.

## Gestione Auto (admin) - funzionalità e pulsanti

La pagina Gestione Auto lato admin è il cruscotto per tenere allineate le auto associate agli utenti e le loro tariffe chilometriche. In alto c’è il campo “Cerca” con la lente per filtrare al volo per marca, modello o targa.

A destra il bottone arancione “Aggiungi Auto” con il “+” apre la modale di inserimento/modifica.

La tabella mostra Utente, Marca, Modello, Targa e Tariffa chilometrica (formattata a 4 decimali).

Nell’ultima colonna ci sono tre icone: l’occhio apre il dettaglio in sola lettura, il cestino chiede conferma ed elimina l’auto, la matita apre la modale già precompilata per modificare.

Nella modale di aggiunta/modifica si compilano utente, marca, modello, targa, tariffa chilometrica e cilindrata; i pulsanti sono “Annulla” per chiudere senza salvare e “Conferma” per creare o aggiornare. Se un campo è mancante o non numerico compare un alert rosso.

La modale dettaglio mostra i dati in tabella compatta e offre “Esci” per chiudere e “Modifica” per passare direttamente all’editing dello stesso record. Le modali bloccano lo scroll di sfondo finché non vengono chiuse.

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
