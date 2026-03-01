-- Add split bill support to customers
ALTER TABLE customers ADD COLUMN is_split_bill BOOLEAN DEFAULT FALSE;

-- Add secondary payment tracking to meetings
ALTER TABLE meetings ADD COLUMN is_paid_secondary BOOLEAN DEFAULT FALSE;
