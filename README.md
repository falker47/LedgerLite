# LedgerLite 💰

A sleek, modern web app to track personal credits and debts with real-time Firebase sync.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)

## ✨ Features

- **🔐 Secure Authentication** — Login via Google or continue as Guest
- **📊 Real-time Dashboard** — Instant updates for Total Credit, Debt, and Net Balance
- **📝 Entry Management** — Add, Edit, Delete, and Toggle Status (Open/Closed)
- **🔍 Powerful Filters** — Search by name/description, filter by type or status
- **📱 Responsive Design** — Premium UI that works seamlessly on mobile and desktop
- **☁️ Cloud Sync** — Data synced across all your devices via Firebase Firestore

## 🚀 Quick Start

### Prerequisites

- A [Firebase](https://firebase.google.com/) account
- A local web server (for ES Modules support)

### 1. Clone the Repository

```bash
git clone https://github.com/falker47/LedgerLite.git
cd LedgerLite
```

### 2. Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. **Authentication**: Enable the **Google** sign-in provider
4. **Firestore**: Create a database (start in **production mode** or **test mode**)
5. **Project Settings**:
   - Register a Web App
   - Copy the `firebaseConfig` object properties
   - Open `js/firebaseConfig.js` and replace the placeholder values with your actual keys

### 3. Security Rules

1. In Firebase Console → Firestore → Rules
2. Copy the content of `firestore.rules` from this project
3. Paste it into the console and publish

### 4. Run Locally

Since this project uses ES Modules, you need a local server:

**VS Code:**

```
Install "Live Server" extension → Right-click index.html → "Open with Live Server"
```

**Python:**

```bash
python -m http.server 8000
# Open http://localhost:8000
```

**Node.js:**

```bash
npx serve .
# Open http://localhost:3000
```

## 🛠️ Tech Stack

| Technology        | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| HTML5             | Structure                                      |
| CSS3              | Styling with CSS Variables & Responsive Design |
| JavaScript (ES6+) | Logic & Firebase SDK Integration               |
| Firebase Auth     | Google Authentication                          |
| Cloud Firestore   | Real-time Database                             |

## 📂 Project Structure

```
ledger-lite/
├── index.html          # Main application
├── css/
│   └── style.css       # Complete styling
├── js/
│   ├── app.js          # Main application logic
│   └── firebaseConfig.js  # Firebase configuration
├── firestore.rules     # Firestore security rules
└── README.md
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ by <a href="https://github.com/falker47">falker47</a></p>
