# LedgerLite 💰

A simple, robust web app to track personal credits and debts, synced via Firebase.

## Setup Instructions

### 1. Firebase Configuration

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  **Authentication**: Enable **Google** provider.
4.  **Firestore**: Create a database (start in **production mode** or **test mode**).
5.  **Project Settings**:
    - Register a Web App.
    - Copy the `firebaseConfig` object properties.
    - Open `js/firebaseConfig.js` in this project.
    - Replace the placeholder values (`YOUR_API_KEY`, etc.) with your actual keys.

### 2. Security Rules

1.  In Firebase Console > Firestore > Rules.
2.  Copy the content of the `firestore.rules` file from this project.
3.  Paste it into the console and publish.

### 3. Run Locally

Since this project uses ES Modules, you need a local server (you cannot just open `index.html` file directly).

- **VS Code**: Install "Live Server" extension, right-click `index.html` -> "Open with Live Server".
- **Python**: Run `python -m http.server` in the project root and open `http://localhost:8000`.

## Features

- **Google Login**: Secure authentication.
- **Real-time Dashboard**: Instant updates for Total Credit/Debt and Net Balance.
- **Entry Management**: Add, Edit, Delete, and Toggle Status (Open/Closed).
- **Filtering**: Search by name/description, filter by type or status.
- **Responsive Design**: Premium UI that works on mobile and desktop.
