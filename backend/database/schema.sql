-- USERS
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('root', 'add-only', 'edit', 'full') DEFAULT 'add-only',
    isRoot BOOLEAN DEFAULT FALSE
);

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    pincode VARCHAR(10),
    gstin VARCHAR(15),
    arn VARCHAR(50),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clientId INT NOT NULL,
    itemName VARCHAR(100) NOT NULL,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
);

-- CHALANS
CREATE TABLE IF NOT EXISTS chalans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clientId INT NOT NULL,
    serialNumber INT NOT NULL,
    date DATE NOT NULL,
    poDate DATE,
    poNumber VARCHAR(50),
    vehicleNo VARCHAR(50),
    remarks TEXT,
    arn VARCHAR(50),
    createdBy INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- CHALAN ITEMS
CREATE TABLE IF NOT EXISTS chalan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chalanId INT NOT NULL,
    sno INT NOT NULL,
    particulars VARCHAR(255) NOT NULL,
    noOfBoxes INT,
    costPerBox DECIMAL(10,2),
    totalQty DECIMAL(10,2),
    FOREIGN KEY (chalanId) REFERENCES chalans(id) ON DELETE CASCADE
); 