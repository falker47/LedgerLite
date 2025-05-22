CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  importo NUMERIC NOT NULL,
  descrizione TEXT,
  type TEXT NOT NULL,
  settled BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);