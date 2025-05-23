CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  importo DECIMAL NOT NULL,
  descrizione TEXT,
  type TEXT NOT NULL,
  settled BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);