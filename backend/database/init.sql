-- SQLite version of the schema
-- USERS
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'add-only' CHECK(role IN ('root', 'add-only', 'edit', 'full')),
    isRoot INTEGER DEFAULT 0
);

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER NOT NULL,
    itemName TEXT NOT NULL,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
);

-- CHALANS
CREATE TABLE IF NOT EXISTS chalans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER NOT NULL,
    serialNumber INTEGER NOT NULL,
    date TEXT NOT NULL,
    poDate TEXT,
    poNumber TEXT,
    vehicleNo TEXT,
    remarks TEXT,
    createdBy INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- CHALAN ITEMS
CREATE TABLE IF NOT EXISTS chalan_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chalanId INTEGER NOT NULL,
    sno INTEGER NOT NULL,
    particulars TEXT NOT NULL,
    noOfBoxes INTEGER,
    costPerBox REAL,
    totalQty REAL,
    FOREIGN KEY (chalanId) REFERENCES chalans(id) ON DELETE CASCADE
);
