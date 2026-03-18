# Portale di Rendicontazione Syncpoint S.r.l. – Relazione Tecnica

## Introduzione
Lo sviluppo del portale di rendicontazione è stato concepito per automatizzare il monitoraggio delle attività operative e la gestione delle note spese in Syncpoint S.r.l. L’obiettivo è la centralizzazione dei processi di rendicontazione, riducendo errori manuali e fornendo visibilità puntuale ai profili utente e amministratore. Il progetto ha rappresentato un percorso formativo orientato alla transizione dalle logiche accademiche a quelle di produzione, con attenzione a requisiti reali, responsabilità verso il team e qualità del software.

## Capitolo 1: Il contesto aziendale e l’avvio dell’esperienza
### 1.1 Descrizione Syncpoint S.r.l.
Syncpoint S.r.l. opera nella consulenza IT con particolare focalizzazione sulla progettazione e governo di sistemi informativi complessi. L’offerta si distingue per competenze in sicurezza informatica, automazione di datacenter e sviluppo di soluzioni applicative modulari. La missione è garantire resilienza, integrazione nei contesti enterprise e conformità normativa, sostenuta da alleanze tecnologiche e da un modello operativo fondato su protocolli interni certificati.

### 1.2 Inserimento nel team
L’inserimento è avvenuto nell’area sviluppo, caratterizzata da referenti tecnici per front-end, back-end e sicurezza. Il flusso di lavoro prevede pianificazione settimanale, revisioni frequenti e confronto continuo con i referenti di prodotto. L’integrazione ha richiesto allineamento alle pratiche di versione, alle checklist di revisione e alla documentazione condivisa.

### 1.3 Onboarding e setup dell’ambiente
È stata configurata una postazione basata su Visual Studio Code con estensioni per Angular, linting TypeScript, formattazione automatica e supporto Git. Sono stati applicati gli standard di codifica aziendali, incluse regole di naming, organizzazione dei moduli e convenzioni per i servizi. L’ambiente integra inoltre strumenti di debugging per browser e DevTools per l’analisi delle performance.

### 1.4 Formazione specialistica
È stato seguito un percorso formativo (Udemy) su Angular v20, focalizzato su Signals, Standalone Components e best practice per la gestione dello stato. La formazione ha definito gli obiettivi tecnici del portale: modularità, riuso dei componenti e aderenza a un flusso SSO aziendale basato su OAuth2.

## Capitolo 2: Metodologie di sviluppo e gestione del lavoro
### 2.1 Organizzazione del lavoro e monitoraggio
Il monitoraggio è stato condotto tramite SAL settimanali, nei quali sono state verificate funzionalità consegnate, anomalie rilevate e priorità successive. I SAL hanno abilitato un debugging iterativo e una validazione continua con i referenti, riducendo il rischio di regressioni funzionali.

### 2.2 Gestione collaborativa con GitHub
La collaborazione ha utilizzato una branching strategy con rami feature, pull request con revisione obbligatoria e gestione della documentazione tecnica tramite README e note di rilascio. Ogni commit ha seguito criteri di atomicità e messaggistica descrittiva, favorendo la tracciabilità e l’analisi delle modifiche.

### 2.3 Dal mockup al codice
Il processo creativo è partito da mockup realizzati su Figma, validati con i referenti di prodotto. La traduzione in componenti Angular è avvenuta in modo iterativo: definizione delle strutture HTML/CSS, integrazione dei dati tramite servizi e affinamento UI/UX sulla base dei feedback raccolti durante i SAL.

## Capitolo 3: Analisi tecnica e architettura del progetto
### 3.1 Il framework Angular v20
Angular v20 è stato scelto per il supporto nativo a TypeScript, il sistema di dependency injection e le feature moderne quali Signals e Standalone Components. L’adozione di questi elementi ha consentito componenti autocontenuti, riduzione delle dipendenze tra moduli e gestione efficiente delle reattività dell’interfaccia.

### 3.2 Integrazione Microsoft 365
L’autenticazione è progettata con OAuth2 per abilitare Single Sign-On aziendale e centralizzare l’identità. Il flusso prevede redirect verso l’identity provider Microsoft 365, acquisizione del token e propagazione delle credenziali ai servizi applicativi tramite intercettori HTTP.

### 3.3 Organizzazione del workspace in VS Code
L’architettura segue un modello feature-based:
- **Core**: logica centrale, autenticazione, intercettori API e configurazioni comuni.
- **Shared**: componenti riutilizzabili (es. navbar, sidebar) e modelli di dati tipizzati.
- **Features**: moduli verticali per aree utente (Activity Form, Note Spese) e aree amministrative (Clienti, Ordini, Fleet Management).

### 3.4 Gestione dello stato e pattern dei servizi
La comunicazione con il backend è strutturata tramite servizi Angular che gestiscono chiamate asincrone, mappatura dei DTO e validazione dei payload. Signals e store locali vengono impiegati per propagare aggiornamenti dell’interfaccia, minimizzando side effect e favorendo la prevedibilità dello stato.

## Capitolo 4: Sviluppo del portale rendicontazione Syncpoint
### 4.1 UI/UX design e layout
È stata realizzata una dashboard responsive con sidebar dinamica, aderente ai mockup Figma. La composizione prevede griglie adattive, palette coerente con il brand e focus sulla leggibilità dei dati di attività e spese. Le figure adottano numerazione progressiva (es. Fig. 1 – Architettura logica del portale).

### 4.2 Logica di accesso e gestione dei ruoli
L’accesso distingue il profilo utente operativo e il profilo amministratore. L’utente visualizza solo inserimento attività e note spese, con percorsi guidati e riduzione delle distrazioni. L’amministratore dispone di viste executive per registri attività e note, gestione clienti, ordini, flotta auto e anagrafiche utenti.

### 4.3 Implementazione delle funzionalità core
- **4.3.1 Gestione attività e note spese**: form dinamici con validazioni sui campi, normalizzazione degli importi e supporto a controlli di coerenza temporale.
- **4.3.2 Moduli CRUD Admin**: gestione anagrafiche di Clienti, Ordini e Utenti con operazioni di creazione, lettura, aggiornamento e cancellazione, corredate da messaggistica di conferma.
- **4.3.3 Logistica**: configurazione delle tariffe chilometriche e gestione del parco auto con tracciamento di targa, modello e parametri di costo.

### 4.4 Sicurezza e protezione delle rotte
Le aree riservate sono protette tramite AuthGuard che verifica ruolo e validità del token. In caso di accesso non autorizzato è previsto il reindirizzamento verso schermata di login o pagina informativa di permesso negato.

## Capitolo 5: Qualità, testing e deployment
### 5.1 Validazione e debugging
Le funzionalità sono state verificate durante i SAL con sessioni di test mirate; le anomalie rilevate sono state classificate, riprodotte e risolte tramite fix incrementali. Il debugging è stato supportato da log strutturati e strumenti di profilazione del browser.

### 5.2 Analisi dell’usabilità (UX)
L’usabilità è stata valutata in termini di facilità di navigazione, chiarezza dei flussi e accessibilità. Sono state privilegiate etichette esplicite, gerarchie tipografiche costanti e messaggi di errore orientati all’azione correttiva.

### 5.3 Processo di build e deployment
Il processo di build è configurato tramite `angular.json` con target di produzione e budget di bundle monitorati. Il deployment prevede compilazione ottimizzata, verifica degli artifact e pubblicazione nel repository GitHub, con pipeline incentrata su coerenza tra branch e tag di rilascio.

## Conclusioni
Il progetto ha permesso di consolidare competenze di sviluppo front-end professionale, integrazione SSO, gestione dello stato e collaborazione strutturata con GitHub. L’esperienza ha evidenziato la centralità della comunicazione con i referenti, della qualità del codice e della cura per l’utente finale. Evoluzioni future includono reportistica avanzata e funzionalità di esportazione dati in Excel/PDF, estendendo il perimetro di analisi dei costi e la fruibilità delle informazioni.

## Bibliografia e sitografia
- Documentazione ufficiale Angular: https://angular.dev
- Documentazione Microsoft Graph API: https://learn.microsoft.com/graph
- Repository del progetto: https://github.com/fiorematti/portale_rendicontazione
- Convenzioni per figure, tabelle e grafici: numerazione progressiva distinta (Fig. X, Tabella Y, Grafico Z) con titolo obbligatorio anche se non richiamati nel testo.
