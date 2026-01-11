DROP TABLE IF EXISTS trips;
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  trip_code VARCHAR(50) UNIQUE NOT NULL,
  loading_date DATE NOT NULL,
  unloading_date DATE,
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  vehicle_number VARCHAR(50) NOT NULL,
  driver_number VARCHAR(50),
  motor_owner_name VARCHAR(255),
  motor_owner_number VARCHAR(50),
  gaadi_freight NUMERIC(12, 2) DEFAULT 0,
  gaadi_advance NUMERIC(12, 2) DEFAULT 0,
  gaadi_balance NUMERIC(12, 2) DEFAULT 0,
  party_name VARCHAR(255) NOT NULL,
  party_number VARCHAR(50),
  party_freight NUMERIC(12, 2) DEFAULT 0,
  party_advance NUMERIC(12, 2) DEFAULT 0,
  party_balance NUMERIC(12, 2) DEFAULT 0,
  tds NUMERIC(12, 2) DEFAULT 0,
  himmali NUMERIC(12, 2) DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'UNPAID',
  gaadi_balance_status VARCHAR(50) DEFAULT 'UNPAID',
  profit NUMERIC(12, 2) DEFAULT 0,
  weight VARCHAR(50),
  remark TEXT,
  pod_status VARCHAR(50) DEFAULT 'PENDING',
  pod_path TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  mobile VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS motor_owners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  mobile VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_expenses (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  vehicle_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
