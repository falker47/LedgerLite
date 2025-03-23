// script.js

// Array globale delle transazioni e chiave per il localStorage
let transactions = [];
const localStorageKey = 'debitiCreditiTransactions';

// Suggerimenti fissi per la descrizione (già esistenti)
const descriptionSuggestionsData = [
  { text: "Spesa", icon: "<i class='fa-solid fa-cart-shopping'></i>" },
  { text: "Cena", icon: "<i class='fa-solid fa-utensils'></i>" },
  { text: "Pranzo", icon: "<i class='fa-solid fa-utensils'></i>" },
  { text: "Viaggio", icon: "<i class='fa-solid fa-plane'></i>" },
  { text: "Regalo", icon: "<i class='fa-solid fa-gift'></i>" },
  { text: "Ripetizioni", icon: "<i class='fa-solid fa-graduation-cap'></i>" }
];

// Mappatura delle icone per le descrizioni
const descriptionIcons = {
  "spesa": "<i class='fa-solid fa-cart-shopping'></i>",
  "cena": "<i class='fa-solid fa-utensils'></i>",
  "pranzo": "<i class='fa-solid fa-utensils'></i>",
  "viaggio": "<i class='fa-solid fa-plane'></i>",
  "regalo": "<i class='fa-solid fa-gift'></i>",
  "ripetizioni": "<i class='fa-solid fa-graduation-cap'></i>"
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

// Carica le transazioni dal localStorage
function loadTransactions() {
  const data = localStorage.getItem(localStorageKey);
  if (data) {
    transactions = JSON.parse(data);
  }
}

// Salva le transazioni nel localStorage
function saveTransactions() {
  localStorage.setItem(localStorageKey, JSON.stringify(transactions));
}

// Inizializzazione
loadTransactions();
renderAll();

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
form.addEventListener('submit', function (e) {
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
    transaction = {
      id: Date.now(),
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
  saveTransactions();
  renderAll();
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

// Raggruppa le transazioni attive per nominativo e tipo
function getAggregatedActive() {
  const aggregated = {};
  transactions.forEach(tx => {
    if (!tx.settled) {
      const key = tx.nome + '|' + tx.type;
      if (!aggregated[key]) {
        aggregated[key] = {
          nome: tx.nome,
          type: tx.type,
          total: 0,
          transactions: []
        };
      }
      aggregated[key].total += tx.importo;
      aggregated[key].transactions.push(tx);
    }
  });
  return aggregated;
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

// Renderizza le liste aggregate per crediti e debiti includendo i pulsanti per segnare e cancellare
function renderAggregatedLists() {
  creditiList.innerHTML = '';
  debitiList.innerHTML = '';
  const aggregated = getAggregatedActive();
  for (let key in aggregated) {
    const group = aggregated[key];
    const li = document.createElement('li');
    let iconHTML = "";
    if (group.transactions.length > 1) {
      iconHTML = `<i class="fa-solid fa-circle-plus multiple-icon"></i>`;
    } else {
      const singleTx = group.transactions[0];
      iconHTML = getIconForDescription(singleTx.descrizione);
    }
    let descHTML = "";
    if (group.transactions.length === 1 && group.transactions[0].descrizione) {
      descHTML = ` - <em>${group.transactions[0].descrizione}</em>`;
    }
    // Bottone per segnare come saldato e pulsante trash per eliminare
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
        <span class="amount">${group.total.toFixed(2)}€</span>
      </div>
    `;
    // Evento per il bottone settle
    li.querySelector('.settle-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      group.transactions.forEach(tx => markAsSettled(tx.id));
    });
    // Evento per il pulsante trash (eliminazione del gruppo)
    const groupTrashBtn = li.querySelector('.trash-btn');

    groupTrashBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!groupTrashBtn.classList.contains('confirm-delete')) {
    groupTrashBtn.classList.add('confirm-delete');
    // Imposta solo l'icona iniziale
    groupTrashBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    // Crea dinamicamente lo span "Conferma"
    const confSpan = document.createElement('span');
    confSpan.className = "confirmation-text";
    confSpan.textContent = "Conferma";
    groupTrashBtn.appendChild(confSpan);
    // Aggiungi la classe 'show' dopo un breve ritardo per attivare la transizione
    setTimeout(() => {
      confSpan.classList.add('show');
    }, 10);
  } else {
    deleteGroupTransactions(group.nome, group.type);
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
function markAsSettled(id) {
  transactions = transactions.map(tx => {
    if (tx.id === id) {
      tx.settled = true;
    }
    return tx;
  });
  saveTransactions();
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
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveTransactions();
  renderAll();
}

// Elimina tutte le transazioni (non saldate) di un gruppo (per nome e tipo)
function deleteGroupTransactions(nome, type) {
  transactions = transactions.filter(tx => {
    if (!tx.settled && tx.nome === nome && tx.type === type) {
      return false;
    }
    return true;
  });
  saveTransactions();
  renderAll();
}

// Ripristina lo stato iniziale del pulsante trash
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
