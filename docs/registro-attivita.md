# Registro Attività – panoramica informale

La pagina del registro attività si presenta come un foglio di controllo semplice: titolo grande in alto, subito sotto una card con tutti i filtri e in angolo il pulsante scuro con l’icona di export. Niente fronzoli, tutto a portata di clic.

Nella card filtri si parte da **Cerca utente**, campo con lente che filtra per nome e cognome. Accanto c’è **In data**: un input “gg/mm/aaaa” che, al clic, fa comparire un mini calendario sovrapposto; le frecce cambiano mese, i giorni sono cliccabili, e il valore selezionato finisce nel filtro. I menu a discesa **Stato convalida** e **Location** restringono la lista per stato (convalidato, da convalidare, tutti) e luogo (sede, smart working, trasferta). A destra c’è il toggle **Seleziona tutto** che spunta o toglie la convalida su tutte le righe filtrate, e il pulsante tondo di **Export** che apre il popup dedicato.

La tabella centrale è lineare: colonne per nome, cliente, codice ordine, data (formattata dd/MM/yyyy), location, ore, stato approvazione e la colonna **Convalida** con una checkbox per riga. Se i dati stanno arrivando compare la riga “Caricamento attività...”, se qualcosa va storto appare un messaggio di errore rosso sotto la tabella.

La selezione per convalidare è diretta: ogni checkbox modifica il contatore interno, e il totale selezionato si riflette nei pulsanti in fondo. Il toggle “Seleziona tutto” agisce solo sulle righe filtrate correnti, così non si rischia di toccare attività nascoste da un filtro.

In basso a destra due bottoni grandi: **Respingi convalida** (grigio/arancio) e **Conferma convalide** (grigio quando inattivo, arancio acceso quando c’è almeno una selezione). Entrambi si disabilitano se non ci sono righe selezionate o se è in corso una richiesta. Durante l’invio mostrano uno spinner. Sotto compaiono eventuali errori di validazione o rifiuto per dare feedback immediato.

Il popup **Esporta attività** scorre su un backdrop scuro: scegli **Mese** (dropdown abbreviato) e **Utente** (caricato al volo al clic, con opzione “Nome Utente” vuota). Sotto ci sono due pulsanti formato: uno per **PDF** con icona rossa e uno per **EXCEL** con icona verde; il formato scelto resta evidenziato. In fondo i bottoni **Annulla** (chiude) ed **Esporta** (avvia download). L’export richiede un utente selezionato e un formato; in caso di errore mostra un alert dal component e chiude il popup al successo scaricando il file.

Il calendario rapido del filtro data è minimale: header con mese/anno in italiano, frecce per navigare, griglia con iniziali dei giorni e celle cliccabili. Il giorno selezionato si evidenzia, chiude il popup e ri-lancia il caricamento dati. L’input testo accetta solo valori sanificati, così si evita di sporcare il filtro con formati errati.

In sintesi, la pagina è pensata per un flusso da back-office: filtri in alto, tabella leggibile, check rapidi, pulsanti di massa per convalidare o respingere, e un export focalizzato per utente e mese. Stile pulito, ombre leggere, controlli disabilitati quando serve, feedback visivi costanti per ridurre gli errori mentre si lavora a ritmo serrato.
