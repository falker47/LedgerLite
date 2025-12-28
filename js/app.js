import { auth, db, provider } from './firebaseConfig.js';
import { signInWithPopup, signInAnonymously, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- State ---
let currentUser = null;
let entries = [];
let unsubscribeEntries = null;

// --- DOM Elements ---
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginBtn = document.getElementById('login-btn');
const guestBtn = document.getElementById('guest-btn');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');
const userAvatarImg = document.getElementById('user-avatar');

// Stats
const totalCreditEl = document.getElementById('total-credit');
const totalDebtEl = document.getElementById('total-debt');
const netBalanceEl = document.getElementById('net-balance');

// Entries
const entriesListEl = document.getElementById('entries-list');
const loadingIndicator = document.getElementById('loading-indicator');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const filterType = document.getElementById('filter-type');
const filterStatus = document.getElementById('filter-status');

// Modal
const entryModal = document.getElementById('entry-modal');
const entryForm = document.getElementById('entry-form');
const addEntryBtn = document.getElementById('add-entry-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const modalTitle = document.getElementById('modal-title');
const entryIdInput = document.getElementById('entry-id');

// --- Helper Functions ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};

const formatDate = (timestamp) => {
    if (!timestamp) return '';
    // Handle both Firestore Timestamp and JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

// --- Auth Formatting ---
const toggleAuthUI = (user) => {
    if (user) {
        authSection.classList.add('hidden');
        appSection.classList.remove('hidden');
        userNameSpan.textContent = user.displayName;
        userAvatarImg.src = user.photoURL || 'https://via.placeholder.com/40';
    } else {
        authSection.classList.remove('hidden');
        appSection.classList.add('hidden');
        userNameSpan.textContent = '';
        userAvatarImg.src = '';
    }
};

// --- Database Logic ---
const subscribeToEntries = (uid) => {
    if (unsubscribeEntries) unsubscribeEntries();

    loadingIndicator.classList.remove('hidden');
    entriesListEl.innerHTML = '';

    // Path: users/{uid}/entries
    const q = query(
        collection(db, "users", uid, "entries"),
        orderBy("createdAt", "desc")
    );

    unsubscribeEntries = onSnapshot(q, (snapshot) => {
        loadingIndicator.classList.add('hidden');
        entries = [];
        snapshot.forEach((doc) => {
            entries.push({ id: doc.id, ...doc.data() });
        });
        renderApp();
    }, (error) => {
        console.error("Error fetching entries:", error);
        loadingIndicator.textContent = "Error loading entries.";
        // Likely permission denied if rules aren't set up or auth failed
    });
};

// --- App Logic ---
const calculateTotals = (filteredEntries) => {
    let credit = 0;
    let debt = 0;

    filteredEntries.forEach(entry => {
        if (entry.status === 'open') {
            const val = parseFloat(entry.amount) || 0;
            if (entry.type === 'credit') credit += val;
            if (entry.type === 'debt') debt += val;
        }
    });

    totalCreditEl.textContent = formatCurrency(credit);
    totalDebtEl.textContent = formatCurrency(debt);

    const net = credit - debt;
    netBalanceEl.textContent = formatCurrency(net);

    if (net > 0) {
        netBalanceEl.style.color = 'var(--credit-color)';
    } else if (net < 0) {
        netBalanceEl.style.color = 'var(--debt-color)';
    } else {
        netBalanceEl.style.color = 'var(--text-main)';
    }
};

const filterEntries = () => {
    const term = searchInput.value.toLowerCase();
    const type = filterType.value;
    const status = filterStatus.value;

    return entries.filter(entry => {
        const matchesTerm = (entry.counterpartyName || '').toLowerCase().includes(term) ||
            (entry.description || '').toLowerCase().includes(term);
        const matchesType = type === 'all' || entry.type === type;
        const matchesStatus = status === 'all' || entry.status === status;

        return matchesTerm && matchesType && matchesStatus;
    });
};

const renderApp = () => {
    const filtered = filterEntries();
    calculateTotals(entries); // Calculate totals based on ALL entries or filtered? Usually totals show global state, list shows filtered.
    // Requirement: "Total credit ... sum of all entries ... Open". This implies global totals.
    // Requirement: "Add filters ...". This implies list filtering.
    // So calculateTotals(entries) for global stats, but render filtered list.

    // Wait, requirement says "sum of all entries with type=credit and status=open".
    // Does search filter affect totals? Usually no without explicit "Filtered Total".
    // I will stick to global totals for the cards.
    calculateTotals(entries);

    entriesListEl.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filtered.forEach(entry => {
            const tr = document.createElement('tr');

            const isCredit = entry.type === 'credit';
            const badgeClass = isCredit ? 'credit' : 'debt';
            const badgeText = isCredit ? 'Credit' : 'Debt';
            const statusClass = entry.status === 'closed' ? 'closed' : '';

            tr.innerHTML = `
                <td class="${statusClass}">${formatDate(entry.createdAt)}</td>
                <td><span class="type-badge ${badgeClass}">${badgeText}</span></td>
                <td class="${statusClass} font-medium">${entry.counterpartyName}</td>
                <td class="${statusClass} text-muted">${entry.description || '-'}</td>
                <td class="font-bold ${badgeClass} ${statusClass}">${formatCurrency(entry.amount)}</td>
                <td><span class="status-badge ${statusClass}">${entry.status}</span></td>
                <td>
                    <button class="action-btn" onclick="window.editEntry('${entry.id}')" title="Edit">
                        <svg style="width:18px;height:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" /></svg>
                    </button>
                    <button class="action-btn" onclick="window.toggleStatus('${entry.id}')" title="Toggle Status">
                        ${entry.status === 'open'
                    ? '<svg style="width:18px;height:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" /></svg>'
                    : '<svg style="width:18px;height:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,13H7V11H17V13Z" /></svg>'
                }
                    </button>
                    <button class="action-btn delete" onclick="window.deleteEntry('${entry.id}')" title="Delete">
                        <svg style="width:18px;height:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                    </button>
                </td>
            `;
            entriesListEl.appendChild(tr);
        });
    }
};

// --- Modal Logic ---
const openModal = (mode = 'create', entry = null) => {
    entryModal.classList.remove('hidden');
    entryForm.reset();

    if (mode === 'edit' && entry) {
        modalTitle.textContent = 'Edit Entry';
        entryIdInput.value = entry.id;

        // Populate fields
        const typeRadios = entryForm.querySelectorAll('name="entry-type"');
        if (entry.type === 'credit') document.querySelector('input[name="entry-type"][value="credit"]').checked = true;
        else document.querySelector('input[name="entry-type"][value="debt"]').checked = true;

        document.getElementById('counterparty').value = entry.counterpartyName;
        document.getElementById('amount').value = entry.amount;
        document.getElementById('description').value = entry.description || '';
        document.getElementById('due-date').value = entry.dueDate || '';
    } else {
        modalTitle.textContent = 'Add Entry';
        entryIdInput.value = '';
        // Default to credit
        document.querySelector('input[name="entry-type"][value="credit"]').checked = true;
    }
};

const closeModal = () => {
    entryModal.classList.add('hidden');
};

// --- Global Actions (for onclick handlers) ---
window.editEntry = (id) => {
    const entry = entries.find(e => e.id === id);
    if (entry) openModal('edit', entry);
};

window.toggleStatus = async (id) => {
    if (!currentUser) return;
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    const newStatus = entry.status === 'open' ? 'closed' : 'open';
    try {
        await updateDoc(doc(db, "users", currentUser.uid, "entries", id), {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Error toggling status:", e);
        alert("Failed to update status");
    }
};

window.deleteEntry = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    if (!currentUser) return;

    try {
        await deleteDoc(doc(db, "users", currentUser.uid, "entries", id));
    } catch (e) {
        console.error("Error deleting:", e);
        alert("Failed to delete entry");
    }
};

// --- Event Listeners ---
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch(error => {
        console.error("Login failed:", error);
        alert("Login failed: " + error.message);
    });
});

guestBtn.addEventListener('click', () => {
    signInAnonymously(auth).catch(error => {
        console.error("Guest login failed:", error);
        alert("Guest login failed: " + error.message);
    });
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

addEntryBtn.addEventListener('click', () => {
    openModal('create');
});

closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

entryModal.addEventListener('click', (e) => {
    if (e.target === entryModal) closeModal();
});

entryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const formData = new FormData(entryForm); // doesn't work well with specific manual IDs sometimes, let's grab directly
    const type = document.querySelector('input[name="entry-type"]:checked').value;
    const counterpartyName = document.getElementById('counterparty').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date').value;
    const entryId = entryIdInput.value;

    const entryData = {
        type,
        counterpartyName,
        amount,
        description,
        dueDate,
        updatedAt: serverTimestamp()
    };

    try {
        if (entryId) {
            // Edit
            await updateDoc(doc(db, "users", currentUser.uid, "entries", entryId), entryData);
        } else {
            // Create
            entryData.status = 'open';
            entryData.createdAt = serverTimestamp();
            await addDoc(collection(db, "users", currentUser.uid, "entries"), entryData);
        }
        closeModal();
    } catch (err) {
        console.error("Error saving entry:", err);
        alert("Error saving entry: " + err.message);
    }
});

searchInput.addEventListener('input', renderApp);
filterType.addEventListener('change', renderApp);
filterStatus.addEventListener('change', renderApp);

// --- Initialization ---
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    toggleAuthUI(user);
    if (user) {
        subscribeToEntries(user.uid);
    } else {
        if (unsubscribeEntries) unsubscribeEntries();
        entries = [];
        renderApp();
    }
});

console.log("App Initialized");
