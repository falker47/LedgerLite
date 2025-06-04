# LedgerLite 💰

Un'applicazione web semplice e intuitiva per gestire crediti e debiti personali con sincronizzazione cloud.

## 🚀 Caratteristiche

- **Gestione Crediti/Debiti**: Traccia facilmente chi ti deve soldi e a chi devi
- **Due modalità di inserimento**:
  - **Modalità Diretta**: Inserimento rapido di importi fissi
  - **Modalità Oraria**: Calcolo automatico basato su tariffa oraria
- **Sincronizzazione Cloud**: Accedi ai tuoi dati da qualsiasi dispositivo con Google
- **Suggerimenti Intelligenti**: Icone e suggerimenti per descrizioni comuni
- **Storico Completo**: Visualizza tutte le transazioni concluse
- **Interfaccia Responsive**: Funziona perfettamente su desktop e mobile

## 🛠️ Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (Database PostgreSQL + Autenticazione)
- **Autenticazione**: Google OAuth tramite Supabase
- **Hosting**: GitHub Pages
- **Icone**: Font Awesome 6
- **Font**: Google Fonts (Poppins)

## 📱 Come Usare

### Inserimento Transazioni

1. **Modalità Diretta**:
   - Inserisci nome, importo e descrizione
   - Usa il toggle per scegliere tra Credito/Debito
   - Clicca "Aggiungi Transazione"

2. **Modalità Oraria**:
   - Inserisci nome, tariffa oraria e ore lavorate
   - Il sistema calcolerà automaticamente l'importo
   - Supporta formati come "2.5", "2:30", "2h 30m"

### Gestione Transazioni

- **✅ Segna come Saldata**: Sposta la transazione nello storico
- **🗑️ Elimina**: Rimuove definitivamente la transazione
- **🔄 Sincronizza**: Forza la sincronizzazione con il cloud

### Autenticazione

- **Accedi con Google**: Sincronizza i dati tra dispositivi
- **Modalità Offline**: Funziona anche senza account (solo localStorage)

## 🎨 Suggerimenti Disponibili

L'app include suggerimenti predefiniti con icone:

- 🛒 Spesa
- 🍽️ Cena/Pranzo
- 🍕 Pizza
- ✈️ Viaggio
- 🎁 Regalo
- 🎓 Ripetizioni
- 🏠 Affitto
- 📄 Bollette
- 💰 Prestito
- 👥 Dividi conto
- ⛽ Benzina
- 🛍️ Shopping
- 🚕 Taxi
- 🚂 Treno

## 🔧 Installazione Locale

1. Clona il repository:
   ```bash
   git clone https://github.com/falker47/LedgerLite.git
   cd LedgerLite