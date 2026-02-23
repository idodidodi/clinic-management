-- Create Enums
CREATE TYPE meeting_type AS ENUM ('CHILD', 'PARENT', 'PARENTS');
CREATE TYPE payment_method AS ENUM ('CASH', 'BIT', 'PAYBOX', 'BANK_DRAFT');

-- Create Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cell_phone TEXT,
    email TEXT,
    invoice_name TEXT,
    invoice_description TEXT,
    tariff_default INTEGER DEFAULT 0,
    tariff_parents INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Meetings Table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT NOW(),
    type meeting_type NOT NULL DEFAULT 'CHILD',
    custom_cost INTEGER,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    payer_name TEXT,
    amount INTEGER NOT NULL DEFAULT 0,
    date TIMESTAMPTZ DEFAULT NOW(),
    method payment_method NOT NULL DEFAULT 'CASH',
    ref TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_customers
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_meetings
BEFORE UPDATE ON meetings
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_payments
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Indexes for performance
CREATE INDEX idx_customers_name ON customers (name);
CREATE INDEX idx_meetings_customer_id ON meetings (customer_id);
CREATE INDEX idx_meetings_date ON meetings (date);
CREATE INDEX idx_meetings_type ON meetings (type);
CREATE INDEX idx_payments_customer_id ON payments (customer_id);
CREATE INDEX idx_payments_date ON payments (date);
CREATE INDEX idx_payments_method ON payments (method);
