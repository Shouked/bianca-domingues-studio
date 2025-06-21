CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO procedures (name) VALUES
('Extensão de Cílios'),
('Design de Sobrancelhas'),
('Lash Lifting'),
('Brow Lamination'),
('Hydra Gloss');

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_value NUMERIC NOT NULL,
  status TEXT DEFAULT 'agendado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE appointment_procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  procedure_id UUID NOT NULL REFERENCES procedures(id)
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

