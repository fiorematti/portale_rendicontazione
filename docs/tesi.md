# Portale di Rendicontazione Syncpoint – Racconto di progetto

## Introduzione
Questa storia nasce da una necessità molto concreta: togliere di mezzo fogli sparsi, file Excel dalle versioni improbabili e chat infinite per capire chi ha fatto cosa e quanto ha speso. In Syncpoint S.r.l. si è deciso di creare un portale unico che tenesse insieme il monitoraggio delle attività e la gestione delle note spese, così da evitare errori e perdite di tempo. Il progetto è stato anche il mio ponte tra il mondo accademico e la vita reale di sviluppo: meno teoria e più scelte pratiche, con responsabilità vere e feedback continui.

Appena è partito il lavoro è diventato chiaro che non bastava scrivere “un’app”: serviva capire come le persone avrebbero davvero usato lo strumento, quando avrebbero inserito le ore, come avrebbero caricato gli scontrini, quali filtri avrebbero cercato per ricostruire un rimborso a fine mese. È emersa subito la regola base: se l’interfaccia rallenta, viene abbandonata. Per questo la narrazione che segue è un racconto di compromessi, piccoli aggiustamenti e conversazioni quotidiane con chi aspettava il portale per smettere di rincorrere allegati e mail.

## Capitolo 1: Il contesto aziendale e l’avvio dell’esperienza
### 1.1 Descrizione Syncpoint S.r.l.
Syncpoint è una società di consulenza IT che lavora su sistemi informativi complessi. Dentro c’è tanta sicurezza informatica, automazione di datacenter e sviluppo di soluzioni su misura. L’idea guida è rendere le infrastrutture robuste, integrabili e pronte a crescere, mantenendo allineamento con le normative e con le esigenze di business. In pratica: tante competenze messe in sinergia, alleanze tecnologiche e processi interni molto strutturati.

Guardando da vicino, Syncpoint è fatta di persone che parlano di resilienza e standard, ma che in pausa caffè raccontano i problemi di produzione come se fossero avventure. C’è chi gestisce firewall e chi disegna architetture applicative, chi scrive script di automazione per i batch notturni e chi prepara le checklist per gli audit di sicurezza. Questo mix ha creato un terreno fertile: un portale di rendicontazione non è solo UI, ma un pezzo di governance IT, perché tocca dati sensibili (ore lavorate, spese, clienti) e deve inserirsi in un flusso già regolato.

### 1.2 Inserimento nel team
L’ingresso nel team sviluppo è stato guidato da referenti tecnici per front-end, back-end e sicurezza. La routine prevedeva pianificazione settimanale, confronti frequenti e canali aperti per dubbi e proposte. Ho imparato subito che le decisioni non si prendono in solitaria: si condividono ipotesi, si prova, si fallisce e si corregge con gli altri. Ogni commit aveva un senso per qualcuno a valle.

All’inizio ho passato più tempo ad ascoltare che a scrivere codice. I senior chiedevano sempre “perché” prima di “come”. Se proponevo un componente, dovevo spiegare chi lo avrebbe usato, con quali dati e con che frequenza. Questa abitudine ha dato ritmo al lavoro: meno funzionalità buttate dentro, più attenzione a ciò che serviva davvero. Anche le retrospettive informali, fatte spesso davanti a una lavagna, hanno aiutato a capire le priorità e a non perdere pezzi lungo la strada.

### 1.3 Onboarding e setup dell’ambiente
La postazione è stata preparata con Visual Studio Code, estensioni dedicate ad Angular, linting TypeScript, formattazione automatica e integrazione Git. Sono entrate subito in gioco le convenzioni interne su naming, struttura dei file e modo di scrivere i servizi. Gli strumenti di debugging del browser e le DevTools hanno aiutato a capire cosa succedeva sotto il cofano mentre l’interfaccia prendeva forma.

Il setup non è stato solo tecnico. C’erano checklist su come tenere ordinato il progetto, quali branch aprire, come nominare le PR. Ogni volta che il lint segnalava qualcosa, la regola era capirne il motivo, non forzare l’esclusione. Questo ha tenuto lo stile di codice uniforme e ha evitato i classici “funziona solo sulla mia macchina”. Anche la configurazione dei launch profile per il debug ha accorciato i tempi di prova, permettendo di vedere subito come le chiamate API reagivano a dati reali.

### 1.4 Formazione specialistica
Prima di mettere mano al portale mi sono fatto un giro su un corso Udemy di Angular v20. Ho puntato su Signals, Standalone Components e gestione dello stato, perché erano i mattoni scelti per questo progetto. L’obiettivo era costruire componenti riutilizzabili, modulari e pronti a parlare con un flusso di autenticazione SSO basato su OAuth2.

La parte più utile della formazione è stata la pratica su esempi piccoli ma completi: componenti standalone che parlavano con servizi fittizi, segnali per gestire cambi di stato senza troppi giri di subscription e unsubscribe, routing protetto da guard. Questi esercizi, ripetuti più volte, hanno reso naturale passare dal mockup alla funzionalità vera sul portale.

## Capitolo 2: Metodologie di sviluppo e gestione del lavoro
### 2.1 Organizzazione del lavoro e monitoraggio
Il ritmo lo hanno dettato i SAL settimanali: momenti in cui si mostrava cosa era stato fatto, si raccoglievano anomalie, si decidevano le priorità successive. Era il posto giusto per dire “questo funziona”, “questo rompe” e “qui serve un altro giro di test”. Grazie a quei checkpoint, il debugging è diventato iterativo e meno stressante.

Durante i SAL si portavano demo rapide: cinque minuti di navigazione sull’ultima build, due grafici per mostrare numeri chiave (quante note inserite, quanti errori 4xx/5xx registrati) e un elenco breve di blocchi ancora aperti. Ogni feedback veniva segnato in una board condivisa con tag chiari: bug, miglioramento UI, dubbio funzionale. Questa disciplina ha evitato discussioni infinite e ha trasformato i SAL in momenti molto concreti.

### 2.2 Gestione collaborativa con GitHub
Per il codice si è adottata una branching strategy semplice: rami feature, pull request con review obbligatoria e documentazione minima ma chiara. Ogni commit doveva essere piccolo e descrittivo, così da poter risalire facilmente alle scelte fatte. Le PR erano il luogo di confronto, non un mero passaggio formale.

Un aspetto che ha fatto la differenza è stato il template delle PR: cosa è stato fatto, come testato, screenshot se c’era UI. Questa griglia costringeva a non saltare passaggi e dava ai revisori tutti gli elementi per capire velocemente. I conflitti di merge erano rari perché i branch restavano piccoli e venivano rebase-ati di frequente.

### 2.3 Dal mockup al codice
Tutto è partito da mockup in Figma. Prima si è discusso con i referenti di prodotto, poi si è passati a HTML/CSS, infine si sono cablati i dati con i servizi Angular. L’approccio è stato iterativo: mettere giù una prima versione, farla provare, raccogliere feedback e ripulire. Ogni ciclo aggiungeva un pezzo di concretezza ai disegni iniziali.

Quando un mockup sembrava troppo “perfetto”, lo si metteva subito alla prova con dati reali: codici ordine lunghi, nomi clienti con accenti, importi con più di due decimali, immagini di ricevute pesanti. Questi stress test UI hanno evitato di scoprire tardi problemi di layout o prestazioni. Il passaggio da Figma ad Angular è stato accompagnato da un foglio di stile condiviso per colori, spazi e tipografie, così da non reinventare ogni componente.

## Capitolo 3: Analisi tecnica e architettura del progetto
### 3.1 Il framework Angular v20
Angular v20 è stato scelto per TypeScript nativo, dependency injection solida e feature moderne come Signals e Standalone Components. Con questi ingredienti i componenti sono diventati autocontenuti e facili da comporre, riducendo dipendenze pesanti e migliorando la reattività dell’interfaccia.

In pratica, usare componenti standalone ha evitato la proliferazione di moduli e ha reso più semplice capire cosa importare dove. Signals ha aiutato a gestire stati locali (caricamento, errori, lista delle spese filtrate) senza creare catene complesse di observable. Anche il router è rimasto più pulito, con guard e resolver concentrati nel layer core.

### 3.2 Integrazione Microsoft 365
L’autenticazione passa da OAuth2 per abilitare Single Sign-On con l’ecosistema Microsoft 365. L’utente viene portato all’identity provider, ottiene il token e poi l’applicazione propaga le credenziali tramite intercettori HTTP. Meno login ripetuti, più coerenza nell’identità.

Un punto delicato è stato gestire l’expiration dei token. L’intercettore controlla la validità, prova un silent refresh quando possibile e, se fallisce, reindirizza alla pagina di login. Questo ha impedito situazioni in cui l’utente vedeva errori generici perché il token era scaduto senza essere rinnovato.

### 3.3 Organizzazione del workspace in VS Code
La struttura è feature-based:
- **Core**: logica centrale, autenticazione, intercettori API, configurazioni comuni.
- **Shared**: componenti riutilizzabili come navbar e sidebar, più i modelli di dati tipizzati.
- **Features**: moduli verticali per l’area utente (Activity Form, Note Spese) e per l’area admin (Clienti, Ordini, Fleet Management).

Questa organizzazione ha reso chiaro dove mettere le cose: una funzionalità nuova finiva in una cartella feature; se qualcosa era riusabile, andava in shared; se toccava autenticazione o configurazione globale, finiva in core. Meno tempo speso a cercare file, più tempo a scrivere logica.

### 3.4 Gestione dello stato e pattern dei servizi
I servizi Angular gestiscono le chiamate asincrone, la mappatura dei DTO e la validazione dei payload. Signals e store locali tengono allineata l’interfaccia senza effetti collaterali sparsi. Ogni aggiornamento di stato viene propagato in modo prevedibile.

Per esempio, la lista delle note spese viene caricata una sola volta e poi filtrata lato client quando l’utente applica ricerche rapide. I totali vengono ricalcolati in base ai filtri attivi, evitando round trip inutili. Gli errori vengono mostrati con messaggi espliciti (“servizio non raggiungibile”, “token scaduto”) così l’utente capisce cosa sta succedendo.

## Capitolo 4: Sviluppo del portale rendicontazione Syncpoint
### 4.1 UI/UX design e layout
La dashboard è stata pensata responsive, con una sidebar che guida l’utente tra le sezioni. I mockup di Figma hanno fornito colori, spaziature e ritmo delle schermate. L’obiettivo era avere tabelle leggibili, pulsanti chiari e un flusso di inserimento dati che non facesse perdere tempo.

In pratica, le tabelle hanno colonne con larghezza controllata, righe dense ma leggibili e indicatori visuali per lo stato (pagato, validato, annullato). Nei form sono stati messi placeholder e help testuale dove serviva, così l’utente non doveva indovinare il formato di un importo o di una data. Su mobile, la sidebar collassa e le azioni principali restano a portata di pollice.

### 4.2 Logica di accesso e gestione dei ruoli
Ci sono due binari. L’utente operativo vede solo ciò che gli serve: inserire attività e note spese al volo. L’amministratore, invece, ha una vista più ampia: controlla registri di attività e note, gestisce clienti e ordini, tiene d’occhio la flotta auto e l’anagrafica utenti. Così ognuno ha il proprio cruscotto senza rumore inutile.

Per evitare confusioni, le voci di menu cambiano in base al ruolo già al login. L’utente semplice non vede nemmeno i link amministrativi. L’admin, invece, ha viste aggregate con totali e grafici sintetici per capire l’andamento mensile di spese e attività.

### 4.3 Implementazione delle funzionalità core
- **4.3.1 Gestione attività e note spese**: form dinamici con controlli sui campi, importi normalizzati, gestione delle date e feedback immediati su errori di compilazione.
- **4.3.2 Moduli CRUD Admin**: anagrafiche di Clienti, Ordini e Utenti con creazione, lettura, aggiornamento e cancellazione. Ogni operazione restituisce messaggi chiari, così l’admin sa subito se l’azione è andata a buon fine.
- **4.3.3 Logistica**: configurazione delle tariffe chilometriche e gestione del parco auto. Per ogni veicolo si tracciano dati come targa, modello e parametri di costo, utili ai rimborsi.

Per le attività è stata aggiunta la validazione sul monte ore giornaliero: se si supera il limite, l’app lo segnala e suggerisce di riassegnare le ore. Per le note spese, gli importi sono formattati in modo coerente (separatore decimale, simbolo euro) e le categorie (vitto, hotel, trasporti, auto) sono state rese chiare con icone. Nei moduli CRUD admin è stata curata la paginazione e la ricerca per evitare liste infinite da scorrere.

### 4.4 Sicurezza e protezione delle rotte
Le rotte riservate sono protette da AuthGuard: se il token non è valido o il ruolo non è quello giusto, scatta il reindirizzamento al login o a una pagina di permesso negato. Niente scorciatoie per chi non ha i diritti.

Oltre al guard, alcune chiamate API controllano lato server il ruolo, così anche se qualcuno prova a forzare l’URL non ottiene dati. Le risposte di errore vengono gestite in modo esplicito nell’interfaccia, evitando schermate bianche o messaggi generici.

## Capitolo 5: Qualità, testing e deployment
### 5.1 Validazione e debugging
Ogni settimana i SAL hanno fatto da momento di verifica: si provava l’app, si raccoglievano bug, si riproducevano e si risolvevano con fix mirati. I log strutturati e gli strumenti di profilazione hanno aiutato a capire dove intervenire senza andare a tentoni.

Alcuni problemi tipici sono emersi presto: form che perdevano lo stato al refresh, filtri che non resettavano i totali, errori di formattazione valuta. Ogni bug veniva documentato con passaggi per la riproduzione, così chi lo prendeva in carico sapeva esattamente da dove partire. Anche piccoli script di mock API hanno aiutato a testare i flussi quando i servizi reali non erano disponibili.

### 5.2 Analisi dell’usabilità (UX)
L’usabilità è stata misurata guardando quanto facilmente le persone navigavano, se trovavano subito i pulsanti giusti e se i messaggi di errore erano comprensibili. Si è puntato su etichette chiare, gerarchie tipografiche costanti e percorsi guidati per evitare confusione.

Sono stati organizzati mini test interni: tre utenti con ruoli diversi provavano a completare task reali (inserire una nota spesa con ricevuta, chiudere un’attività, modificare un ordine). Si misurava il tempo e si annotavano i punti in cui si fermavano. Da lì sono nate micro-modifiche: testi più semplici, pulsanti spostati, campi precompilati quando i dati erano già noti.

### 5.3 Processo di build e deployment
Il build passa da `angular.json` con target di produzione e monitoraggio dei budget di bundle. Una volta compilato, l’artifact viene validato e pubblicato nel repository GitHub, seguendo coerenza tra branch e tag. Meno sorprese al momento del rilascio, più tracciabilità.

Durante i rilasci è stata tenuta una checklist: aggiornare le dipendenze, lanciare il build, verificare i warning sui budget, preparare la nota di rilascio con le feature incluse e i bug fixati. Questo ha permesso di avere versioni etichettate e di tornare indietro se necessario senza confusione.

## Conclusioni
Questo progetto ha fatto da palestra per passare da “lo faccio per l’esame” a “lo uso in azienda”. Ha reso più solide le competenze su Angular, sull’SSO basato su OAuth2 e sulla collaborazione quotidiana con GitHub. Il contatto costante con i referenti ha mostrato quanto conti la comunicazione: spiegare cosa si è fatto, ascoltare i feedback e adattarsi. I prossimi passi? Aggiungere reportistica più avanzata e funzioni di export in Excel/PDF, così da dare ai responsabili una lettura ancora più rapida dei costi e delle attività.

Guardando indietro, la parte più formativa è stata la gestione dell’autonomia: non c’era un docente che verificava ogni riga di codice, ma colleghi che contavano sulle consegne per pianificare il lavoro successivo. L’empatia verso l’utente finale ha guidato molte scelte: ridurre click inutili, chiarire i messaggi, evitare termini tecnici dove non servivano. Ogni iterazione ha reso il portale un po’ più vicino a ciò che gli utenti chiedevano: meno attrito, più chiarezza.

## Appendice A: Diario di bordo settimanale (estratti discorsivi)
**Settimana 1 – Orientamento e ascolto**  
Ho passato i primi giorni a capire chi fa cosa: chi custodisce le API, chi decide le priorità, chi conosce bene i flussi di spesa. Ho chiesto spesso “perché si fa così?” per evitare di replicare abitudini inefficienti. Mi sono accorto che anche una cosa banale, come il formato data, può generare confusione se non è allineata con i sistemi esistenti.

**Settimana 2 – Mockup e reality check**  
Abbiamo messo su le prime schermate in Figma e subito le abbiamo fatte provare a chi inserisce le note spese ogni giorno. Domanda ricorrente: “Dove vedo subito quanto ho già richiesto questo mese?” Da lì è nata l’idea di un header con i totali aggiornati e di un badge colore per lo stato di pagamento.

**Settimana 3 – Standalone Components e Signals**  
Ho riscritto i componenti principali in modalità standalone, togliendo moduli superflui. Con Signals ho gestito loading, errori e liste filtrate senza rincorrere subscribe sparsi. È stato il primo momento in cui l’app ha iniziato a “respirare” senza glitch.

**Settimana 4 – Auth e guard**  
Si è lavorato sull’autenticazione via OAuth2. La sfida è stata gestire i token scaduti senza far rimbalzare l’utente su errori criptici. L’intercettore ora tenta un refresh silenzioso e, se fallisce, porta al login con un messaggio chiaro.

**Settimana 5 – CRUD Admin e performance**  
Le viste admin hanno bisogno di tabelle robuste. Ho introdotto paginazione lato client e filtri rapidi per evitare scroll infiniti. Abbiamo testato con dataset realistici: ordini con codici lunghi, clienti con nomi complessi, auto con tariffe particolari. Alcuni layout sono stati corretti dopo aver visto testi che andavano a capo in modo sgradevole.

**Settimana 6 – UX review e microcopia**  
Sono emerse richieste di testi più semplici: “Aggiungi attività” al posto di “Inserisci record”, “Totale richiesto” invece di “Totale importo lordo”. Piccole parole hanno tagliato via dubbi. Abbiamo anche spostato i pulsanti di conferma in posizioni più visibili, soprattutto su mobile.

**Settimana 7 – Debug su casi limite**  
Si sono trovati bug legati ai fusi orari e alle formattazioni valutarie. Alcuni utenti inserivano importi con spazi o simboli strani; i parser sono stati resi più tolleranti, normalizzando tutto prima di salvare. Per le date si è forzato un formato unico e si sono aggiunti esempi di compilazione.

**Settimana 8 – Preparazione al rilascio interno**  
Checklist di build, verifica dei warning, aggiornamento README e creazione di una breve guida per i tester interni. Abbiamo concordato un piccolo canale di feedback su chat aziendale per raccogliere segnalazioni nelle prime 48 ore.

## Appendice B: Focus tecnici raccontati in modo semplice
- **Intercettori HTTP**: servono a infilare il token in ogni richiesta senza doverlo ricordare a mano. Quando il token scade, provano a rinnovarlo; se non ci riescono, buttano fuori l’utente con un messaggio decente.
- **Signals per lo stato UI**: invece di rincorrere observable e unsubscribe, i segnali mantengono lo stato (loading, errori, liste filtrate) e aggiornano la UI appena qualcosa cambia. Meno boilerplate, più chiarezza.
- **Form dinamici**: certi campi compaiono o spariscono in base alla scelta dell’utente (es. voce auto per i rimborsi chilometrici). Questo evita form lunghissimi e fa sentire l’app “intelligente”.
- **Gestione valuta**: gli importi passano da stringhe a numeri normalizzati, poi tornano in stringhe formattate con virgola e simbolo euro. Così nessuno si ritrova “12.3.4€” o altre forme creative.
- **Paginazione e filtri**: le tabelle admin non caricano tutto insieme quando non serve. Si filtra e si paginano i risultati per tenere la UI reattiva anche su dataset grandi.
- **Guard delle rotte**: un cancello che controlla chi entra nelle pagine protette. Se il ruolo non è giusto, non c’è modo di arrivare a funzioni riservate, anche cambiando l’URL a mano.

## Appendice C: Esempi di scenari utente
1. **Dipendente di consulenza**  
   Entra con SSO, va su “Attività”, compila ore e cliente assegnato. In “Note spese” carica scontrini di viaggio, vede subito il totale richiesto e lo stato dei rimborsi. Se sbaglia formato, l’app lo avvisa prima di inviare.
2. **Amministratore**  
   Controlla i registri di attività e note, filtra per cliente e mese, esporta un report rapido. Aggiorna una tariffa chilometrica e crea un nuovo utente con ruolo limitato. Se un ordine è chiuso, lo marca e la UI smette di proporlo nei form utente.
3. **Responsabile flotta**  
   Aggiorna dati delle auto, controlla quante richieste di rimborso chilometrico sono arrivate, rivede le tariffe in base ai costi reali. Apre la scheda di un veicolo e vede subito quante note spese l’hanno usato nell’ultimo trimestre.

## Appendice D: Lezioni imparate lungo il percorso
- Non basta un bel mockup: servono dati sporchi per vedere cosa succede quando i campi si allungano o i valori non sono quelli ideali.
- I SAL settimanali sono più utili se si porta sempre qualcosa di mostrabile, anche se piccolo. Parlare di codice senza far vedere la UI porta fuori strada.
- I nomi dei campi contano: “Codice ordine” è più chiaro di “ID Ordine” per chi non vive di database.
- I messaggi di errore devono dire cosa fare dopo, non solo “errore”. Un “ricarica la pagina e riprova il login” salva tempo e frustrazione.
- Scrivere commit piccoli evita guerre di merge e rende più facile capire l’impatto di una scelta tecnica.

## Appendice E: Possibili estensioni future (in stile chiacchierata)
- **Reportistica avanzata**: grafici mensili su costi e ore, con filtri per cliente e progetto. Sarebbe comodo esportare tutto in PDF o Excel con un click.
- **Notifiche smart**: avvisi quando una nota spesa resta in attesa troppo a lungo o quando un ordine sta finendo il plafond previsto.
- **Modalità offline leggera**: permettere di inserire bozze di attività anche senza connessione e sincronizzarle appena possibile.
- **Integrazione con calendari**: suggerire automaticamente le ore da registrare leggendo gli eventi di calendario aziendale (previa autorizzazione).
- **Accessibilità migliorata**: scorciatoie da tastiera per chi inserisce molte note, contrasto alto per chi lavora in mobilità, testi ancora più sintetici.

## Appendice F: Strumenti e comandi usati di frequente
- `npm install` per mettere in piedi l’ambiente.
- `npm run build` per controllare che tutto compili (budget warning a parte).
- DevTools del browser per esaminare payload e prestazioni.
- PR su GitHub con screenshot e passi di test, così i reviewer non devono immaginare cosa sia cambiato.

## Appendice G: Piccoli aneddoti da tastiera
- Una volta un importo veniva salvato con il simbolo dell’euro nel mezzo della stringa. Il parser si è arrabbiato e ha restituito NaN. Da lì è nato il normalizzatore che ripulisce tutto prima di calcolare.
- Un link di logout nascosto troppo in basso ha causato più di una telefonata: è stato spostato in alto e reso visibile solo quando l’utente è autenticato.
- Un utente ha provato a inserire un ordine chiuso “per vedere se funzionava”: l’app ha evitato l’inserimento e ha suggerito di scegliere un ordine attivo. Test informali ma preziosi.

## Appendice H: Checkpoint di qualità (riassunto pratico)
- Prima di ogni rilascio: build, controllo warning, breve giro di UI su desktop e mobile.
- Per ogni bug: passi di riproduzione, screenshot, ipotesi di causa, fix e retest.
- Per ogni nuova feature: mockup rapido, prima versione cliccabile, feedback, rifinitura.

## Capitolo 6: Una giornata tipo dietro al portale
### 6.1 Mattina – Raccolta feedback
La giornata inizia spesso con un giro veloce sul canale di supporto interno. Se qualcuno ha lasciato un messaggio la sera prima, lo si prende in carico. A volte è un bug, altre volte è una richiesta di “potrei avere questo campo precompilato?”. Si decide cosa è urgente e cosa può aspettare. Intanto si dà un’occhiata ai log per vedere se ci sono errori notturni non segnalati.

### 6.2 Mezzogiorno – Coding e prove rapide
Le ore centrali sono dedicate a scrivere codice e provare subito le modifiche. Si lanciano build locali, si aprono due browser (uno come utente, uno come admin) e si verificano i flussi appena toccati. Se qualcosa non torna, si lascia un commento nel codice o si apre una nota per il SAL successivo. In questa fase si fanno anche piccole ottimizzazioni visive: padding, font, allineamenti.

### 6.3 Pomeriggio – Allineamenti e release interne
Nel pomeriggio ci sono spesso mini-riunioni per allinearsi su feature in arrivo. Se è giornata di rilascio, si segue la checklist: build, controllo warning, aggiornamento della versione, nota di rilascio e tag su GitHub. Poi si avvisa il team e si ascoltano i primi feedback “a caldo”.

### 6.4 Sera – Retro veloce
A fine giornata si annotano due cose: cosa ha funzionato bene, cosa ha fatto perdere tempo. Queste note diventano munizioni per i SAL: “abbiamo speso troppo a capire questo bug”, “questo flusso è stato testato con un caso reale e ha retto”. È un modo per non perdere il filo tra un ciclo di sviluppo e l’altro.

## Capitolo 7: Domande frequenti (in versione chiacchierata)
**Perché Angular e non un altro framework?**  
Perché in azienda c’è esperienza pregressa, TypeScript è ormai casa, e le feature come Signals e i componenti standalone hanno reso il flusso di lavoro più pulito. Inoltre, il router e il sistema di DI sono maturi e stabili.

**Come gestite gli errori di rete?**  
Se cade la rete, i messaggi avvisano l’utente e invitano a riprovare. Alcune richieste vengono ritentate automaticamente; se proprio non va, l’utente viene riportato su una pagina sicura senza perdere la sessione (se ancora valida).

**Cosa succede se l’utente chiude il browser mentre compila?**  
Per ora non c’è un salvataggio automatico delle bozze, ma è nella lista dei desideri. Si sta valutando una soluzione leggera che salvi in locale e proponga il recupero al riavvio.

**Quanto è complicato aggiungere un nuovo ruolo?**  
L’architettura a guard e ruoli consente di aggiungere permessi, ma serve anche l’allineamento lato backend e nelle policy di autenticazione. È possibile, ma richiede coordinamento.

**Come vengono gestiti i dati sensibili?**  
Solo le API autorizzate rispondono con i dati necessari. Lato front-end non si memorizzano token in chiaro se non per la sessione corrente. I log non includono dati personali; vengono usati per errori e performance.

**Quanto tempo serve per mettere in produzione una modifica piccola?**  
Se il test è rapido e la PR è chiara, in giornata può arrivare su un ambiente interno. Per la produzione si segue il ciclo di rilascio concordato, con finestre dedicate.

## Capitolo 8: Racconto esteso per area funzionale
### 8.1 Area Attività – Dietro le quinte
Inserire ore non è solo “campo data e numero”. C’è la scelta del cliente, del codice ordine, del luogo. Si è scoperto che molti utenti inserivano ore a fine settimana, non ogni giorno. Per questo è stato aggiunto un piccolo promemoria visivo con il totale della settimana, così da capire se si è in linea. Il controllo sulle ore giornaliere ha evitato inserimenti eccessivi per errore.

### 8.2 Area Note Spese – Il mondo delle ricevute
Le note spese hanno mille varianti: vitto, hotel, trasporti, auto con rimborso km. Ogni categoria ha le sue regole. Il portale aiuta con placeholder, formati e icone. Si è provato a caricare foto grandi per vedere se rompevano la UI; sono stati limitati i formati e messi messaggi chiari se qualcosa non andava.

### 8.3 Area Admin – Regia centrale
Qui l’amministratore vede tutto: registri, clienti, ordini, utenti, flotta auto. Le tabelle hanno filtri veloci perché nessuno vuole scrollare pagine intere. Un admin può chiudere un ordine: da quel momento l’utente non lo vede più nel form, evitando errori di rendicontazione. La vista flotta mostra anche dati sintetici sui rimborsi per auto.

### 8.4 Integrazione con i processi aziendali
Il portale non vive isolato: i dati di clienti e ordini arrivano da sistemi esterni. La sincronizzazione avviene tramite servizi dedicati; se manca un dato, viene mostrato un alert specifico. Gli utenti non vengono lasciati nel dubbio su perché un cliente non compaia nell’elenco.

## Capitolo 9: Idee per rendere l’esperienza ancora più leggera
- Aggiungere scorciatoie da tastiera per chi inserisce molte righe di attività.
- Introdurre suggerimenti basati sull’uso: se un utente seleziona spesso lo stesso cliente/ordine, proporlo in cima alla lista.
- Creare un mini-tour interattivo per chi entra la prima volta, così non deve leggere guide separate.
- Prevedere un widget “oggi” che mostra subito le azioni più frequenti (aggiungi nota, aggiungi ore, controlla stato rimborsi).

## Capitolo 10: Piccole storie di errori evitati
- Un utente ha tentato di caricare un CSV al posto di una foto: il sistema ha bloccato il caricamento e spiegato che serviva un’immagine o un PDF. Nessun crash, solo un messaggio utile.
- Durante un test, un totale veniva mostrato con tre decimali: è stato corretto per rispettare il formato due decimali e simbolo euro. Piccolo dettaglio, ma ha evitato discussioni sui centesimi.
- Un ordine disattivato continuava a comparire in cache: è stata aggiunta una forzatura di refresh dopo l’aggiornamento admin, così l’utente vede subito le modifiche.

## Capitolo 11: Riflessioni sul passaggio da studente a sviluppatore
Quando si studia si è abituati a consegnare un progetto a fine corso e basta. Qui ogni scelta rimane e influenza la vita di chi userà l’app. Ho imparato a motivare le decisioni, a chiedere feedback presto, a non innamorarmi del primo design. E ho capito che “funziona sul mio PC” non basta: serve funzionare sul PC di tutti, con dati veri e connessioni ballerine.

## Bibliografia e sitografia
- Documentazione ufficiale Angular: https://angular.dev
- Documentazione Microsoft Graph API: https://learn.microsoft.com/graph
- Repository del progetto: https://github.com/fiorematti/portale_rendicontazione
