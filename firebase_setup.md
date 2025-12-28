# Guida Configurazione Firebase per LedgerLite

Ecco i passaggi dettagliati per configurare il tuo progetto Firebase.

## 1. Creare Progetto e Ottenere API Keys

1.  Vai sulla **[Firebase Console](https://console.firebase.google.com/)** e clicca su **"Crea un progetto"** (o "Aggiungi progetto").
2.  Dai un nome al progetto (es. `ledgerlite-app`) e procedi. (Puoi disabilitare Google Analytics per semplicità).
3.  Una volta creato il progetto, clicca sull'icona **Web** (l'icona `</>`) nella pagina principale "Tieni tutto sotto controllo".
4.  Registra l'app con un soprannome (es. `LedgerLite Web`) e clicca **Registra app**.
5.  Ti verrà mostrato un blocco di codice `firebaseConfig`. Copia solo l'oggetto `const firebaseConfig = { ... };`.
6.  Incolla questi valori nel tuo file locale `js/firebaseConfig.js` sostituendo i placeholder.

## 2. Attivare Autenticazione Google

1.  Nel menu a sinistra della Console, vai su **Build** > **Authentication**.
2.  Clicca su **Inizia** (Get Started).
3.  Nella tab **Sign-in method**, seleziona **Google**.
4.  Clicca l'interruttore **Abilita** (Enable).
5.  Seleziona la tua email di supporto dal menu a tendina.
6.  Clicca **Salva**.

## 3. Configurare Firestore e Security Rules

### Creare il Database

1.  Nel menu a sinistra, vai su **Build** > **Firestore Database**.
2.  Clicca **Crea database**.
3.  Scegli una location (es. `eur3` per l'Europa) e clicca **Avanti**.
4.  Scegli **Avvia in modalità produzione** (Start in production mode) e clicca **Crea**.

### Impostare le Regole di Sicurezza

1.  Una volta creato il database, clicca sulla tab **Regole** (Rules) in alto.
2.  Cancella il contenuto esistente e incolla queste regole (le stesse presenti nel tuo file `firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regola chiave: Permetti lettura/scrittura SOLO se l'ID utente
    // nel percorso del documento corrisponde all'ID dell'utente loggato.
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // La regola viene ereditata dalle sottocollezioni (entries),
      // ma è meglio esplicitarla per chiarezza o se servono regole diverse.
      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3.  Clicca **Pubblica**.

### Perché queste regole funzionano?

- `match /users/{userId}`: Intercetta qualsiasi richiesta ai dati di un utente specifico.
- `request.auth.uid == userId`: Controlla che chi sta facendo la richiesta sia _effettivamente_ il proprietario di quei dati. Se io (User A) provo a leggere `/users/UserB/entries`, Firestore blocca la richiesta perché il mio `uid` non è uguale a `UserB`.
