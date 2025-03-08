// script.js

// Array globale delle transazioni
let transactions = [];
const localStorageKey = 'debitiCreditiTransactions';

// Suggerimenti fissi per la descrizione (testo e icona associata)
const descriptionSuggestionsData = [
  { text: "Spesa", icon: "<i class='fa-solid fa-cart-shopping'></i>" },
  { text: "Cena", icon: "<i class='fa-solid fa-utensils'></i>" },
  { text: "Pranzo", icon: "<i class='fa-solid fa-utensils'></i>" },
  { text: "Viaggio", icon: "<i class='fa-solid fa-plane'></i>" },
  { text: "Regalo", icon: "<i class='fa-solid fa-gift'></i>" }
];

// Mappatura delle icone per le descrizioni nelle liste
const descriptionIcons = {
  "spesa": "<i class='fa-solid fa-cart-shopping'></i>",
  "cena": "<i class='fa-solid fa-utensils'></i>",
  "pranzo": "<i class='fa-solid fa-utensils'></i>",
  "viaggio": "<i class='fa-solid fa-plane'></i>",
  "regalo": "<i class='fa-solid fa-gift'></i>"
};

// Elementi del DOM
const form = document.getElementById('transaction-form');
const nomeInput = document.getElementById('nome');
const importoInput = document.getElementById('importo');
const descrizioneInput = document.getElementById('descrizione');
const toggleTypeCheckbox = document.getElementById('toggle-type');
const toggleText = document.getElementById('toggle-text');

const nomeSuggestionsDiv = document.getElementById('nome-suggestions');
const descrizioneSuggestionsDiv = document.getElementById('descrizione-suggestions');

const creditiList = document.getElementById('crediti-list');
const debitiList = document.getElementById('debiti-list');
const historyList = document.getElementById('history-list');

// Carica transazioni dal localStorage
function loadTransactions() {
  const data = localStorage.getItem(localStorageKey);
  if (data) {
    transactions = JSON.parse(data);
  }
}

// Salva transazioni nel localStorage
function saveTransactions() {
  localStorage.setItem(localStorageKey, JSON.stringify(transactions));
}

// Inizializza
loadTransactions();
renderAll();

// Gestione toggle
toggleTypeCheckbox.addEventListener('change', function () {
  if (toggleTypeCheckbox.checked) {
    toggleText.textContent = "Debito";
    toggleText.style.color = "#F44336"; // Rosso per Debito
  } else {
    toggleText.textContent = "Credito";
    toggleText.style.color = "#4CAF50"; // Verde per Credito
  }
});


// Submit del form
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const nome = nomeInput.value.trim();
  let rawImporto = importoInput.value.trim();
  let importo = parseFloat(rawImporto);
  if (!nome || isNaN(importo)) return;

  // Se l'utente ha inserito il segno "-" manualmente, forziamo il debito
  if (rawImporto.indexOf('-') !== -1) {
    importo = -Math.abs(importo);
  } else {
    // Altrimenti, usiamo il toggle per determinare il segno
    if (toggleTypeCheckbox.checked) {
      importo = -Math.abs(importo);
    } else {
      importo = Math.abs(importo);
    }
  }
  const descrizione = descrizioneInput.value.trim();
  const type = importo >= 0 ? "Credito" : "Debito";

  const transaction = {
    id: Date.now(),
    nome,
    importo,
    descrizione,
    type,
    settled: false,
    timestamp: new Date().toISOString()
  };
  transactions.push(transaction);
  saveTransactions();
  renderAll();
  form.reset();
  // Reset del toggle
  toggleTypeCheckbox.checked = false;
  toggleText.textContent = "Credito";
});

// Renderizza tutte le liste
function renderAll() {
  renderAggregatedLists();
  renderHistory();
}

// Raggruppa le transazioni attive (non saldate) per nominativo e tipo
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

// Ottiene l'icona in base alla descrizione (prima occorrenza)
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

// Renderizza crediti e debiti aggregati
function renderAggregatedLists() {
  creditiList.innerHTML = '';
  debitiList.innerHTML = '';

  const aggregated = getAggregatedActive();
  for (let key in aggregated) {
    const group = aggregated[key];
    const li = document.createElement('li');

    // Se più transazioni: mostra icona "più transazioni"
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

    const checkBtnHTML = `<button class="action-btn" title="Segna tutte come saldate"><i class="fa-solid fa-check"></i></button>`;

    li.innerHTML = `
      <div>
        <span class="icon-span">${iconHTML}</span>
        <strong>${group.nome}</strong>${descHTML}
      </div>
      <div>
        <span class="amount">${group.total.toFixed(2)}€</span>
        ${checkBtnHTML}
      </div>
    `;

    li.querySelector('.action-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      group.transactions.forEach(tx => markAsSettled(tx.id));
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

// Mostra/nasconde il dettaglio delle transazioni multiple
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
    detailLi.innerHTML = `
      <div>
        <span class="icon-span">${txIcon}</span> 
        ${tx.importo.toFixed(2)}€${desc}
      </div>
      <button class="action-btn" title="Segna come saldato">
        <i class="fa-solid fa-check"></i>
      </button>
    `;
    detailLi.querySelector('.action-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      markAsSettled(tx.id);
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

// Renderizza lo storico
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

      const trashBtn = `<button class="action-btn trash-btn" title="Elimina"><i class="fa-solid fa-trash"></i></button>`;
      li.innerHTML = `
        <div>
          <span class="icon-span">${icon}</span>
          <strong class="${typeClass}">${tx.nome}</strong> 
          <span>${tx.importo.toFixed(2)}€</span>
          ${tx.descrizione ? ` - <em>${tx.descrizione}</em>` : ""}
        </div>
        <div class="delete-container">
          ${trashBtn}
        </div>
      `;

      const trashButton = li.querySelector('.trash-btn');
      trashButton.addEventListener('click', function () {
        if (!trashButton.classList.contains('confirm-delete')) {
          trashButton.classList.add('confirm-delete');
          trashButton.innerHTML = `<i class="fa-solid fa-trash"></i><span class="confirmation-text">Conferma</span>`;
          const textSpan = trashButton.querySelector('.confirmation-text');
          setTimeout(() => {
            textSpan.classList.add('show');
          }, 10);
        } else {
          deleteTransaction(tx.id);
        }
      });

      trashButton.addEventListener('mouseleave', function () {
        if (trashButton.classList.contains('confirm-delete')) {
          setTimeout(() => {
            if (!trashButton.matches(':hover') && trashButton.classList.contains('confirm-delete')) {
              revertTrashButton(trashButton);
            }
          }, 500);
        }
      });

      historyList.appendChild(li);
    });
  }
}

// Elimina la transazione
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveTransactions();
  renderAll();
}

// Ripristina il bottone cestino
function revertTrashButton(button) {
  button.classList.remove('confirm-delete');
  button.innerHTML = `<i class="fa-solid fa-trash"></i>`;
}

/* --------------------- */
/* GESTIONE SUGGERIMENTI */
/* --------------------- */

// Suggerimenti per il campo Nome
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

// Suggerimenti per il campo Descrizione
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
