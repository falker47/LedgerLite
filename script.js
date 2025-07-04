// script.js

// Array globale delle transazioni
let transactions = [];
const localStorageKey = 'debitiCreditiTransactions';

// Configurazione Supabase (dovrai sostituire con i tuoi dati)
const supabaseUrl = 'https://eayjkdiycrqgsqbcrkgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVheWprZGl5Y3JxZ3NxYmNya2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTU5NDYsImV4cCI6MjA2MzQ5MTk0Nn0.V5_7LncFUiCIq-nBIhGVSDG9VKbfFzPjPAR2e1a9xxM'; // Inserisci qui la tua chiave API completa
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Stato dell'autenticazione
let currentUser = null;

// Suggerimenti fissi per la descrizione (già esistenti + nuove categorie)
const descriptionSuggestionsData = [
  { text: "Spesa", icon: "<i class='fa-solid fa-cart-shopping'></i>" },
  { text: "Cena", icon: "<i class='fa-solid fa-utensils'></i>" },
  { text: "Pranzo", icon: "<i class='fa-solid fa-utensils'></i>" },
  { text: "Pizza", icon: "<i class='fa-solid fa-pizza-slice'></i>" },
  { text: "Viaggio", icon: "<i class='fa-solid fa-plane'></i>" },
  { text: "Regalo", icon: "<i class='fa-solid fa-gift'></i>" },
  { text: "Ripetizioni", icon: "<i class='fa-solid fa-graduation-cap'></i>" },
  { text: "Affitto", icon: "<i class='fa-solid fa-house'></i>" },
  { text: "Bollette", icon: "<i class='fa-solid fa-file-invoice-dollar'></i>" },
  { text: "Prestito", icon: "<i class='fa-solid fa-hand-holding-dollar'></i>" },
  { text: "Dividi conto", icon: "<i class='fa-solid fa-user-friends'></i>" },
  { text: "Benzina", icon: "<i class='fa-solid fa-gas-pump'></i>" },
  { text: "Shopping", icon: "<i class='fa-solid fa-shopping-bag'></i>" },
  { text: "Taxi", icon: "<i class='fa-solid fa-taxi'></i>" },
  { text: "Treno", icon: "<i class='fa-solid fa-train'></i>" }
];

// Mappatura delle icone per le descrizioni
const descriptionIcons = {
  "spesa": "<i class='fa-solid fa-cart-shopping'></i>",
  "cena": "<i class='fa-solid fa-utensils'></i>",
  "pranzo": "<i class='fa-solid fa-utensils'></i>",
  "pizza": "<i class='fa-solid fa-pizza-slice'></i>",
  "viaggio": "<i class='fa-solid fa-plane'></i>",
  "regalo": "<i class='fa-solid fa-gift'></i>",
  "ripetizioni": "<i class='fa-solid fa-graduation-cap'></i>",
  "affitto": "<i class='fa-solid fa-house'></i>",
  "bollette": "<i class='fa-solid fa-file-invoice-dollar'></i>",
  "prestito": "<i class='fa-solid fa-hand-holding-dollar'></i>",
  "dividi conto": "<i class='fa-solid fa-user-friends'></i>",
  "benzina": "<i class='fa-solid fa-gas-pump'></i>",
  "shopping": "<i class='fa-solid fa-shopping-bag'></i>",
  "taxi": "<i class='fa-solid fa-taxi'></i>",
  "treno": "<i class='fa-solid fa-train'></i>"
};



// Elementi del DOM per la modalità Direct (S1)
const form = document.getElementById('transaction-form');
const nomeInput = document.getElementById('nome');
const importoInput = document.getElementById('importo');
const descrizioneInput = document.getElementById('descrizione');
const toggleTypeCheckbox = document.getElementById('toggle-type');
const toggleText = document.getElementById('toggle-text');
const nomeSuggestionsDiv = document.getElementById('nome-suggestions');
const descrizioneSuggestionsDiv = document.getElementById('descrizione-suggestions');

// Elementi del DOM per la modalità Hourly (S2)
const nomeHourlyInput = document.getElementById('nome-hourly');
const tariffaInput = document.getElementById('tariffa');
const oreInput = document.getElementById('ore');
const descrizioneHourlyInput = document.getElementById('descrizione-hourly');
const toggleTypeHourlyCheckbox = document.getElementById('toggle-type-hourly');
const toggleTextHourly = document.getElementById('toggle-text-hourly');
const nomeSuggestionsHourlyDiv = document.getElementById('nome-suggestions-hourly');
const descrizioneSuggestionsHourlyDiv = document.getElementById('descrizione-suggestions-hourly');

// Contenitori delle due modalità
const directModeContainer = document.getElementById('direct-mode');
const hourlyModeContainer = document.getElementById('hourly-mode');

// Elementi per il tab-switch
const tabButtons = document.querySelectorAll('.tab');

// Liste e storico
const creditiList = document.getElementById('crediti-list');
const debitiList = document.getElementById('debiti-list');
const historyList = document.getElementById('history-list');

// Modalità attiva ("direct" o "hourly")
let activeMode = "direct";

// Carica le transazioni dal database
async function loadTransactions() {
  if (!currentUser) {
    // Se non c'è un utente autenticato, carica dal localStorage come fallback
    const data = localStorage.getItem(localStorageKey);
    if (data) {
      transactions = JSON.parse(data);
    }
    return;
  }
  
  try {
    console.log("Caricamento dati da Supabase per l'utente:", currentUser.id);
    const { data, error } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', currentUser.id);
    
    if (error) {
      console.error("Errore nel caricamento delle transazioni:", error);
      throw error;
    }
    
    console.log("Dati ricevuti da Supabase:", data);
    transactions = data || [];
    
    // Salva anche in localStorage come backup
    localStorage.setItem(localStorageKey, JSON.stringify(transactions));
  } catch (error) {
    console.error("Errore nel caricamento delle transazioni:", error);
    // Fallback a localStorage
    const data = localStorage.getItem(localStorageKey);
    if (data) {
      transactions = JSON.parse(data);
    }
  }
}

// Salva le transazioni nel database
async function saveTransactions() {
  // Salva sempre in localStorage come backup
  localStorage.setItem(localStorageKey, JSON.stringify(transactions));
  
  if (!currentUser) return;
  
  try {
    console.log("Salvataggio dati su Supabase per l'utente:", currentUser.id);
    
    // Usa upsert invece di delete + insert
    const transactionsToUpsert = transactions.map(tx => ({
      ...tx,
      user_id: currentUser.id
    }));
    
    const { error } = await supabaseClient
      .from('transactions')
      .upsert(transactionsToUpsert, { onConflict: 'id' });
    
    if (error) {
      console.error("Errore nel salvataggio delle transazioni:", error);
      throw error;
    }
    
    console.log("Salvataggio completato con successo");
  } catch (error) {
    console.error("Errore nel salvataggio delle transazioni:", error);
    // Non mostrare l'alert all'utente per ogni errore di salvataggio
    // ma registra l'errore nella console
  }
}

// Funzione per fare il merge delle transazioni
function mergeTransactions(localTx, serverTx) {
  const merged = new Map();
  
  // Aggiungi tutte le transazioni del server
  serverTx.forEach(tx => merged.set(tx.id, tx));
  
  // Aggiungi/sovrascrivi con le transazioni locali (più recenti)
  localTx.forEach(tx => {
    const existing = merged.get(tx.id);
    if (!existing || new Date(tx.timestamp) >= new Date(existing.timestamp)) {
      merged.set(tx.id, tx);
    }
  });
  
  return Array.from(merged.values());
}

// Funzione per l'autenticazione con Google
async function signInWithGoogle() {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://falker47.github.io/LedgerLite/'
      }
    });
    
    if (error) throw error;
    
    // L'utente verrà reindirizzato a Google per l'autenticazione
  } catch (error) {
    console.error("Errore nell'autenticazione:", error);
  }
}

// Funzione per il logout
async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Errore durante il logout:", error);
      alert("Errore durante il logout: " + error.message);
      return;
    }
    
    currentUser = null;
    
    // Aggiorna UI
    document.getElementById('login-google').style.display = 'block';
    document.getElementById('logout-button').style.display = 'none';
    document.getElementById('sync-button').style.display = 'none';
    
    // Carica i dati dal localStorage
    await loadTransactions();
    renderAll();
  } catch (error) {
    console.error("Errore durante il logout:", error);
    alert("Errore durante il logout: " + error.message);
  }
}

// Listener per lo stato dell'autenticazione
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  // Aggiungi questo dopo la dichiarazione delle altre costanti
  const syncButton = document.getElementById('sync-button');
  
  // Funzione di sincronizzazione manuale
async function manualSync() {
  if (!currentUser) {
    alert("Devi essere autenticato per sincronizzare i dati.");
    return;
  }
  
  try {
    syncButton.disabled = true;
    syncButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizzazione...';
    
    // Carica i dati dal server
    const { data: serverData, error: loadError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', currentUser.id);
    
    if (loadError) {
      console.error("Errore nel caricamento delle transazioni:", loadError);
      throw loadError;
    }
    
    // Merge con i dati locali
    const serverTransactions = serverData || [];
    const localTransactions = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    
    // Usa una strategia di merge più robusta
    const mergedTransactions = mergeTransactionsImproved(localTransactions, serverTransactions);
    
    // Aggiorna locale
    transactions = mergedTransactions;
    localStorage.setItem(localStorageKey, JSON.stringify(transactions));
    
    // Aggiorna il server con i dati uniti
    const { error: upsertError } = await supabaseClient
      .from('transactions')
      .upsert(
        mergedTransactions.map(tx => ({
          ...tx,
          user_id: currentUser.id
        })),
        { onConflict: 'id' }
      );
    
    if (upsertError) {
      console.error("Errore nell'aggiornamento delle transazioni:", upsertError);
      throw upsertError;
    }
    
    renderAll();
    alert("Sincronizzazione completata!");
    
  } catch (error) {
    console.error("Errore durante la sincronizzazione:", error);
    alert("Errore durante la sincronizzazione: " + error.message);
  } finally {
    syncButton.disabled = false;
    syncButton.innerHTML = '<i class="fas fa-sync"></i> Sincronizza';
  }
}

// Funzione di merge migliorata
function mergeTransactionsImproved(localTx, serverTx) {
  const merged = new Map();
  
  // Aggiungi tutte le transazioni del server
  serverTx.forEach(tx => merged.set(tx.id, tx));
  
  // Aggiungi/sovrascrivi con le transazioni locali più recenti
  localTx.forEach(tx => {
    const existing = merged.get(tx.id);
    // Se non esiste sul server o la versione locale è più recente
    if (!existing || new Date(tx.timestamp) > new Date(existing.timestamp)) {
      merged.set(tx.id, tx);
    }
  });
  
  return Array.from(merged.values());
}

// Funzione di merge migliorata
function mergeTransactionsImproved(localTx, serverTx) {
  const merged = new Map();
  
  // Aggiungi tutte le transazioni del server
  serverTx.forEach(tx => merged.set(tx.id, tx));
  
  // Aggiungi/sovrascrivi con le transazioni locali più recenti
  localTx.forEach(tx => {
    const existing = merged.get(tx.id);
    // Se non esiste sul server o la versione locale è più recente
    if (!existing || new Date(tx.timestamp) > new Date(existing.timestamp)) {
      merged.set(tx.id, tx);
    }
  });
  
  return Array.from(merged.values());
}
  
  // Aggiungi l'event listener per il pulsante sync
  syncButton.addEventListener('click', manualSync);
  if (session) {
    currentUser = session.user;
    document.getElementById('login-google').style.display = 'none';
    document.getElementById('logout-button').style.display = 'block';
    document.getElementById('sync-button').style.display = 'block';
    await loadTransactions();
    renderAll();
  } else {
    console.log("Utente non autenticato");
    currentUser = null;
    
    // Aggiorna UI
    document.getElementById('login-google').style.display = 'block';
    document.getElementById('logout-button').style.display = 'none';
    document.getElementById('sync-button').style.display = 'none';
    await loadTransactions(); // Carica i dati locali
    renderAll();
  }
});

// Elimina una singola transazione
async function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  await saveTransactions();
  
  // Se l'utente è autenticato, elimina anche dal server
  if (currentUser) {
    try {
      const { error } = await supabaseClient
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error("Errore nell'eliminazione della transazione:", error);
      }
    } catch (error) {
      console.error("Errore nell'eliminazione della transazione:", error);
    }
  }
  
  renderAll();
}

async function markAsSettled(id) {
  transactions = transactions.map(tx => {
    if (tx.id === id) {
      tx.settled = true;
    }
    return tx;
  });
  await saveTransactions();
  renderAll(); // ✅ Già presente
}

async function deleteGroupTransactions(nome, type) {
  transactions = transactions.filter(tx => {
    if (!tx.settled && tx.nome === nome && tx.type === type) {
      return false;
    }
    return true;
  });
  await saveTransactions();
  renderAll(); // ✅ Già presente
}

// Funzione per ripristinare il pulsante trash allo stato originale
function revertTrashButton(button) {
  button.classList.remove('confirm-delete');
  button.innerHTML = `<i class="fa-solid fa-trash"></i>`;
}

// Gestione del toggle per la modalità Direct
toggleTypeCheckbox.addEventListener('change', function () {
  if (toggleTypeCheckbox.checked) {
    toggleText.textContent = "Debito";
    toggleText.style.color = "#F44336";
  } else {
    toggleText.textContent = "Credito";
    toggleText.style.color = "#4CAF50";
  }
});

// Gestione del toggle per la modalità Hourly
toggleTypeHourlyCheckbox.addEventListener('change', function () {
  if (toggleTypeHourlyCheckbox.checked) {
    toggleTextHourly.textContent = "Debito";
    toggleTextHourly.style.color = "#F44336";
  } else {
    toggleTextHourly.textContent = "Credito";
    toggleTextHourly.style.color = "#4CAF50";
  }
});

// Gestione dello switch tra le modalità tramite tab
tabButtons.forEach(tab => {
  tab.addEventListener('click', function() {
    activeMode = tab.getAttribute('data-mode');
    tabButtons.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    if (activeMode === "direct") {
      directModeContainer.classList.add('active');
      hourlyModeContainer.classList.remove('active');
      // Imposta gli attributi required per la modalità Direct
      nomeInput.setAttribute('required', '');
      importoInput.setAttribute('required', '');
      // Rimuove required dai campi della modalità Hourly
      nomeHourlyInput.removeAttribute('required');
      tariffaInput.removeAttribute('required');
      oreInput.removeAttribute('required');
    } else {
      hourlyModeContainer.classList.add('active');
      directModeContainer.classList.remove('active');
      // Imposta gli attributi required per la modalità Hourly
      nomeHourlyInput.setAttribute('required', '');
      tariffaInput.setAttribute('required', '');
      oreInput.setAttribute('required', '');
      // Rimuove required dai campi della modalità Direct
      nomeInput.removeAttribute('required');
      importoInput.removeAttribute('required');
    }
    form.reset();
    // Resetta i toggle alla modalità default
    toggleTypeCheckbox.checked = false;
    toggleText.textContent = "Credito";
    toggleText.style.color = "#4CAF50";
    toggleTypeHourlyCheckbox.checked = false;
    toggleTextHourly.textContent = "Credito";
    toggleTextHourly.style.color = "#4CAF50";
  });
});

// Funzione per interpretare il campo "Ore"
function parseOre(value) {
  if (!value) return 0;
  if (value.includes(":") || value.includes(",") || value.includes("-") || value.includes(" ")) {
    const parts = value.split(/[:,\-\s]+/);
    if (parts.length >= 2) {
      const hours = parseFloat(parts[0]) || 0;
      const minutes = parseFloat(parts[1]) || 0;
      return hours + minutes / 60;
    } else {
      return parseFloat(value) || 0;
    }
  } else {
    // Senza separatore, interpreta come minuti
    const minutes = parseFloat(value);
    return minutes / 60;
  }
}

// Gestione submit del form
form.addEventListener('submit', async function (e) {
  e.preventDefault();
  let transaction = null;
  if (activeMode === "direct") {
    // Modalità Direct (S1)
    const nome = nomeInput.value.trim();
    let rawImporto = importoInput.value.trim();
    let importo = parseFloat(rawImporto);
    if (!nome || isNaN(importo)) return;
    if (rawImporto.indexOf('-') !== -1) {
      importo = -Math.abs(importo);
    } else {
      if (toggleTypeCheckbox.checked) {
        importo = -Math.abs(importo);
      } else {
        importo = Math.abs(importo);
      }
    }
    const descrizione = descrizioneInput.value.trim();
    const type = importo >= 0 ? "Credito" : "Debito";
    // Sostituire Date.now() con una funzione che genera ID unici
    function generateUniqueId() {
      return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    // Nel form submit per la modalità Hourly:
    transaction = {
      id: generateUniqueId(), // ✅ Cambia da Date.now() a generateUniqueId()
      nome,
      importo,
      descrizione,
      type,
      settled: false,
      timestamp: new Date().toISOString()
    };
  } else {
    // Modalità Hourly (S2)
    const nome = nomeHourlyInput.value.trim();
    let tariffa = parseFloat(tariffaInput.value.trim());
    const oreRaw = oreInput.value.trim();
    if (!nome || isNaN(tariffa) || !oreRaw) return;
    const oreValue = parseOre(oreRaw);
    let importo = tariffa * oreValue;
    if (toggleTypeHourlyCheckbox.checked) {
      importo = -Math.abs(importo);
    } else {
      importo = Math.abs(importo);
    }
    const descrizione = descrizioneHourlyInput.value.trim();
    const type = importo >= 0 ? "Credito" : "Debito";
    transaction = {
      id: Date.now(),
      nome,
      importo,
      descrizione,
      type,
      settled: false,
      timestamp: new Date().toISOString()
    };
  }
  transactions.push(transaction);
  renderAll(); // Refresh immediato prima del salvataggio
  await saveTransactions();
  renderAll(); // Refresh dopo il salvataggio (già presente)
  form.reset();
  // Reset dei toggle
  toggleTypeCheckbox.checked = false;
  toggleText.textContent = "Credito";
  toggleText.style.color = "#4CAF50";
  toggleTypeHourlyCheckbox.checked = false;
  toggleTextHourly.textContent = "Credito";
  toggleTextHourly.style.color = "#4CAF50";
});

// Renderizza tutte le liste (aggregato e storico)
function renderAll() {
  renderAggregatedLists();
  renderHistory();
}

// Raggruppa le transazioni attive per nominativo con compensazione automatica
function getAggregatedActiveWithCompensation() {
  const byPerson = {};
  
  // Prima raggruppa tutte le transazioni per persona
  transactions.forEach(tx => {
    if (!tx.settled) {
      if (!byPerson[tx.nome]) {
        byPerson[tx.nome] = {
          crediti: [],
          debiti: [],
          totalCrediti: 0,
          totalDebiti: 0
        };
      }
      
      if (tx.importo >= 0) {
        byPerson[tx.nome].crediti.push(tx);
        byPerson[tx.nome].totalCrediti += tx.importo;
      } else {
        byPerson[tx.nome].debiti.push(tx);
        byPerson[tx.nome].totalDebiti += Math.abs(tx.importo);
      }
    }
  });
  
  const result = {};
  
  // Calcola il saldo netto per ogni persona
  for (let nome in byPerson) {
    const person = byPerson[nome];
    const saldoNetto = person.totalCrediti - person.totalDebiti;
    
    if (Math.abs(saldoNetto) < 0.01) {
      // Saldo praticamente zero, non mostrare nulla
      continue;
    }
    
    let key, type, total, transactions, descrizione;
    
    if (saldoNetto > 0) {
      // Credito netto
      key = nome + '|Credito';
      type = 'Credito';
      total = saldoNetto;
      transactions = [...person.crediti, ...person.debiti];
      
      if (person.totalDebiti > 0) {
        // C'è stata compensazione
        const creditiDesc = person.crediti.map(tx => tx.descrizione).filter(d => d).join(', ');
        const debitiDesc = person.debiti.map(tx => tx.descrizione).filter(d => d).join(', ');
        descrizione = `Residuo credito (${creditiDesc || 'varie'} - ${debitiDesc || 'varie'})`;
      } else {
        // Solo crediti
        descrizione = person.crediti.length === 1 ? person.crediti[0].descrizione : null;
      }
    } else {
      // Debito netto
      key = nome + '|Debito';
      type = 'Debito';
      total = saldoNetto; // Già negativo
      transactions = [...person.crediti, ...person.debiti];
      
      if (person.totalCrediti > 0) {
        // C'è stata compensazione
        const creditiDesc = person.crediti.map(tx => tx.descrizione).filter(d => d).join(', ');
        const debitiDesc = person.debiti.map(tx => tx.descrizione).filter(d => d).join(', ');
        descrizione = `Residuo debito (${debitiDesc || 'varie'} - ${creditiDesc || 'varie'})`;
      } else {
        // Solo debiti
        descrizione = person.debiti.length === 1 ? person.debiti[0].descrizione : null;
      }
    }
    
    result[key] = {
      nome,
      type,
      total,
      transactions,
      descrizione,
      isCompensated: (person.totalCrediti > 0 && person.totalDebiti > 0)
    };
  }
  
  return result;
}

// Funzione originale per compatibilità (se serve)
function getAggregatedActive() {
  return getAggregatedActiveWithCompensation();
}

// Restituisce l'icona in base alla descrizione
function getIconForDescription(text) {
  if (!text) return "";
  const lowerText = text.toLowerCase();
  for (let key in descriptionIcons) {
    if (lowerText.includes(key)) {
      return descriptionIcons[key];
    }
  }
  return "";
}

// Renderizza le liste aggregate con compensazione
function renderAggregatedLists() {
  creditiList.innerHTML = '';
  debitiList.innerHTML = '';
  const aggregated = getAggregatedActiveWithCompensation();
  
  for (let key in aggregated) {
    const group = aggregated[key];
    const li = document.createElement('li');
    
    let iconHTML = "";
    if (group.isCompensated) {
      // Icona speciale per transazioni compensate
      iconHTML = `<i class="fa-solid fa-scale-balanced compensation-icon" title="Saldo compensato"></i>`;
    } else if (group.transactions.length > 1) {
      iconHTML = `<i class="fa-solid fa-circle-plus multiple-icon"></i>`;
    } else {
      const singleTx = group.transactions[0];
      iconHTML = getIconForDescription(singleTx.descrizione);
    }
    
    let descHTML = "";
    if (group.descrizione) {
      descHTML = ` - <em>${group.descrizione}</em>`;
    } else if (group.transactions.length === 1 && group.transactions[0].descrizione) {
      descHTML = ` - <em>${group.transactions[0].descrizione}</em>`;
    }
    
    // Bottoni per azioni
    const settleBtnHTML = `<button class="action-btn settle-btn" title="Segna tutte come saldate"><i class="fa-solid fa-check"></i></button>`;
    const trashBtnHTML = `<button class="action-btn trash-btn" title="Elimina"><i class="fa-solid fa-trash"></i></button>`;
    
    li.innerHTML = `
      <div>
        <span class="icon-span">${iconHTML}</span>
        <strong>${group.nome}</strong>${descHTML}
      </div>
      <div class="button-group">
        ${settleBtnHTML}
        ${trashBtnHTML}
        <span class="amount">${Math.abs(group.total).toFixed(2)}€</span>
      </div>
    `;
    
    // Eventi per i bottoni
    li.querySelector('.settle-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      group.transactions.forEach(tx => markAsSettled(tx.id));
    });
    
    const groupTrashBtn = li.querySelector('.trash-btn');
    groupTrashBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!groupTrashBtn.classList.contains('confirm-delete')) {
        groupTrashBtn.classList.add('confirm-delete');
        groupTrashBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        const confSpan = document.createElement('span');
        confSpan.className = "confirmation-text";
        confSpan.textContent = "Conferma";
        groupTrashBtn.appendChild(confSpan);
        setTimeout(() => {
          confSpan.classList.add('show');
        }, 10);
      } else {
        // Elimina tutte le transazioni del gruppo
        group.transactions.forEach(tx => {
          transactions = transactions.filter(t => t.id !== tx.id);
        });
        saveTransactions();
        renderAll();
      }
    });
    
    groupTrashBtn.addEventListener('mouseleave', function() {
      if (groupTrashBtn.classList.contains('confirm-delete')) {
        revertTrashButton(groupTrashBtn);
      }
    });
    
    if (group.transactions.length > 1) {
      li.addEventListener('click', function (e) {
        if (e.target.closest('.action-btn')) return;
        toggleDetail(li, group.transactions);
      });
    }
    
    // Aggiungi alla lista appropriata
    if (group.type === "Credito") {
      creditiList.appendChild(li);
    } else {
      debitiList.appendChild(li);
    }
  }
}

// Mostra/nasconde il dettaglio per transazioni multiple, aggiungendo i pulsanti settle e trash per ogni dettaglio
function toggleDetail(li, txList) {
  const existingDetail = li.querySelector('.detail');
  if (existingDetail) {
    existingDetail.remove();
    return;
  }
  const detailUl = document.createElement('ul');
  detailUl.classList.add('detail');
  txList.forEach(tx => {
    const detailLi = document.createElement('li');
    const txIcon = getIconForDescription(tx.descrizione);
    const desc = tx.descrizione ? ` - <em>${tx.descrizione}</em>` : "";
    const settleBtnHTML = `<button class="action-btn settle-btn" title="Segna come saldato"><i class="fa-solid fa-check"></i></button>`;
    const trashBtnHTML = `<button class="action-btn trash-btn" title="Elimina"><i class="fa-solid fa-trash"></i></button>`;
    detailLi.innerHTML = `
      <div>
        <span class="icon-span">${txIcon}</span> 
        ${tx.importo.toFixed(2)}€${desc}
      </div>
      <div class="button-group">
        ${settleBtnHTML}
        ${trashBtnHTML}
      </div>
    `;
    detailLi.querySelector('.settle-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      markAsSettled(tx.id);
    });
    const detailTrashBtn = detailLi.querySelector('.trash-btn');

    detailTrashBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!detailTrashBtn.classList.contains('confirm-delete')) {
    detailTrashBtn.classList.add('confirm-delete');
    detailTrashBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    const confSpan = document.createElement('span');
    confSpan.className = "confirmation-text";
    confSpan.textContent = "Conferma";
    detailTrashBtn.appendChild(confSpan);
    setTimeout(() => {
      confSpan.classList.add('show');
    }, 10);
  } else {
    deleteTransaction(tx.id);
  }
});


    detailTrashBtn.addEventListener('mouseleave', function() {
      if (detailTrashBtn.classList.contains('confirm-delete')) {
        revertTrashButton(detailTrashBtn);
      }
    });
    detailUl.appendChild(detailLi);
  });
  li.appendChild(detailUl);
}

// Segna una transazione come saldata
async function markAsSettled(id) {
  transactions = transactions.map(tx => {
    if (tx.id === id) {
      tx.settled = true;
    }
    return tx;
  });
  await saveTransactions();
  renderAll();
}

// Renderizza lo storico delle transazioni saldate
function renderHistory() {
  historyList.innerHTML = '';
  const settled = transactions.filter(tx => tx.settled);
  if (settled.length === 0) {
    const li = document.createElement('li');
    li.textContent = "Nessuna transazione conclusa";
    li.classList.add('empty-history');
    historyList.appendChild(li);
  } else {
    settled.forEach(tx => {
      const li = document.createElement('li');
      const icon = getIconForDescription(tx.descrizione);
      const typeClass = (tx.type === "Credito") ? "text-credit" : "text-debit";
      const trashBtnHTML = `<button class="action-btn trash-btn" title="Elimina"><i class="fa-solid fa-trash"></i></button>`;
      li.innerHTML = `
        <div>
          <span class="icon-span">${icon}</span>
          <strong class="${typeClass}">${tx.nome}</strong> 
          <span>${tx.importo.toFixed(2)}€</span>
          ${tx.descrizione ? ` - <em>${tx.descrizione}</em>` : ""}
        </div>
        <div class="delete-container">
          ${trashBtnHTML}
        </div>
      `;
      const trashButton = li.querySelector('.trash-btn');
      trashButton.addEventListener('click', function () {
        if (!trashButton.classList.contains('confirm-delete')) {
          trashButton.classList.add('confirm-delete');
          trashButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
          const confSpan = document.createElement('span');
          confSpan.className = "confirmation-text";
          confSpan.textContent = "Conferma";
          trashButton.appendChild(confSpan);
          setTimeout(() => {
            confSpan.classList.add('show');
          }, 10);
        } else {
          deleteTransaction(tx.id);
        }
      });
      trashButton.addEventListener('mouseleave', function () {
        if (trashButton.classList.contains('confirm-delete')) {
          revertTrashButton(trashButton);
        }
      });
      historyList.appendChild(li);
    });
  }
}

// Elimina una singola transazione
async function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  await saveTransactions();
  
  // Se l'utente è autenticato, elimina anche dal server
  if (currentUser) {
    try {
      const { error } = await supabaseClient
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error("Errore nell'eliminazione della transazione:", error);
      }
    } catch (error) {
      console.error("Errore nell'eliminazione della transazione:", error);
    }
  }
  
  renderAll();
}

async function markAsSettled(id) {
  transactions = transactions.map(tx => {
    if (tx.id === id) {
      tx.settled = true;
    }
    return tx;
  });
  await saveTransactions();
  renderAll(); // ✅ Già presente
}

async function deleteGroupTransactions(nome, type) {
  transactions = transactions.filter(tx => {
    if (!tx.settled && tx.nome === nome && tx.type === type) {
      return false;
    }
    return true;
  });
  await saveTransactions();
  renderAll(); // ✅ Già presente
}

// Funzione per ripristinare il pulsante trash allo stato originale
function revertTrashButton(button) {
  button.classList.remove('confirm-delete');
  button.innerHTML = `<i class="fa-solid fa-trash"></i>`;
}

/* --------------------- */
/* GESTIONE SUGGERIMENTI */
// Suggerimenti per il campo Nome (modalità Direct)
nomeInput.addEventListener('input', function () {
  const query = nomeInput.value.trim().toLowerCase();
  if (query.length < 2) {
    nomeSuggestionsDiv.style.display = 'none';
    return;
  }
  const suggestions = new Set();
  transactions.forEach(tx => {
    if (!tx.settled && tx.nome.toLowerCase().includes(query)) {
      suggestions.add(tx.nome);
    }
  });
  nomeSuggestionsDiv.innerHTML = '';
  if (suggestions.size > 0) {
    suggestions.forEach(sugg => {
      const div = document.createElement('div');
      div.classList.add('suggestion');
      div.textContent = sugg;
      div.addEventListener('mousedown', function (e) {
        e.preventDefault();
        nomeInput.value = sugg;
        nomeSuggestionsDiv.style.display = 'none';
        nomeInput.focus();
      });
      nomeSuggestionsDiv.appendChild(div);
    });
    nomeSuggestionsDiv.style.display = 'block';
  } else {
    nomeSuggestionsDiv.style.display = 'none';
  }
});
nomeSuggestionsDiv.addEventListener('mousedown', (e) => {
  e.preventDefault();
});

// Suggerimenti per il campo Descrizione (modalità Direct)
descrizioneInput.addEventListener('input', function () {
  const query = descrizioneInput.value.trim().toLowerCase();
  const filtered = descriptionSuggestionsData.filter(item =>
    item.text.toLowerCase().startsWith(query)
  );
  descrizioneSuggestionsDiv.innerHTML = '';
  if (filtered.length > 0) {
    filtered.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('suggestion');
      div.innerHTML = `${item.icon} ${item.text}`;
      div.addEventListener('mousedown', function (e) {
        e.preventDefault();
        descrizioneInput.value = item.text;
        descrizioneSuggestionsDiv.style.display = 'none';
        descrizioneInput.focus();
      });
      descrizioneSuggestionsDiv.appendChild(div);
    });
    descrizioneSuggestionsDiv.style.display = 'block';
  } else {
    descrizioneSuggestionsDiv.style.display = 'none';
  }
});
descrizioneSuggestionsDiv.addEventListener('mousedown', function (e) {
  e.preventDefault();
});
descrizioneInput.addEventListener('blur', function () {
  setTimeout(() => {
    descrizioneSuggestionsDiv.style.display = 'none';
  }, 200);
});

// Suggerimenti per il campo Nome (modalità Hourly)
nomeHourlyInput.addEventListener('input', function () {
  const query = nomeHourlyInput.value.trim().toLowerCase();
  if (query.length < 2) {
    nomeSuggestionsHourlyDiv.style.display = 'none';
    return;
  }
  const suggestions = new Set();
  transactions.forEach(tx => {
    if (!tx.settled && tx.nome.toLowerCase().includes(query)) {
      suggestions.add(tx.nome);
    }
  });
  nomeSuggestionsHourlyDiv.innerHTML = '';
  if (suggestions.size > 0) {
    suggestions.forEach(sugg => {
      const div = document.createElement('div');
      div.classList.add('suggestion');
      div.textContent = sugg;
      div.addEventListener('mousedown', function (e) {
        e.preventDefault();
        nomeHourlyInput.value = sugg;
        nomeSuggestionsHourlyDiv.style.display = 'none';
        nomeHourlyInput.focus();
      });
      nomeSuggestionsHourlyDiv.appendChild(div);
    });
    nomeSuggestionsHourlyDiv.style.display = 'block';
  } else {
    nomeSuggestionsHourlyDiv.style.display = 'none';
  }
});
nomeSuggestionsHourlyDiv.addEventListener('mousedown', (e) => {
  e.preventDefault();
});

// Suggerimenti per il campo Descrizione (modalità Hourly)
descrizioneHourlyInput.addEventListener('input', function () {
  const query = descrizioneHourlyInput.value.trim().toLowerCase();
  const filtered = descriptionSuggestionsData.filter(item =>
    item.text.toLowerCase().startsWith(query)
  );
  descrizioneSuggestionsHourlyDiv.innerHTML = '';
  if (filtered.length > 0) {
    filtered.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('suggestion');
      div.innerHTML = `${item.icon} ${item.text}`;
      div.addEventListener('mousedown', function (e) {
        e.preventDefault();
        descrizioneHourlyInput.value = item.text;
        descrizioneSuggestionsHourlyDiv.style.display = 'none';
        descrizioneHourlyInput.focus();
      });
      descrizioneSuggestionsHourlyDiv.appendChild(div);
    });
    descrizioneSuggestionsHourlyDiv.style.display = 'block';
  } else {
    descrizioneSuggestionsHourlyDiv.style.display = 'none';
  }
});
descrizioneSuggestionsHourlyDiv.addEventListener('mousedown', function (e) {
  e.preventDefault();
});
descrizioneHourlyInput.addEventListener('blur', function () {
  setTimeout(() => {
    descrizioneSuggestionsHourlyDiv.style.display = 'none';
  }, 200);
});

// Aggiungi event listener per i pulsanti di autenticazione
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('login-google').addEventListener('click', signInWithGoogle);
  document.getElementById('logout-button').addEventListener('click', signOut);
  
  // Inizializzazione
  loadTransactions();
  renderAll();
});

// Aggiungi questo evento per la sincronizzazione manuale
syncButton.addEventListener('click', async function() {
  if (currentUser) {
    try {
      await loadTransactions();
      renderAll();
      alert('Sincronizzazione completata!');
    } catch (error) {
      console.error('Errore durante la sincronizzazione:', error);
      alert('Errore durante la sincronizzazione. Controlla la console per i dettagli.');
    }
  }
});
