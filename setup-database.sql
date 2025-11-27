-- PixelWalls Database Setup Script
-- Run this script in SQL Server Management Studio

-- Connect to your SQL Server at 45.120.139.237,1433 with:
-- Username: sa
-- Password: datacare@123

-- 1. Create the database
CREATE DATABASE PixelWalls;
GO

-- 2. Use the database
USE PixelWalls;
GO

-- 3. Create the users table
CREATE TABLE users (
    id NVARCHAR(255) PRIMARY KEY,
    username NVARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- 4. Create the payment_history table
CREATE TABLE payment_history (
    id NVARCHAR(255) PRIMARY KEY,
    user_id NVARCHAR(255) NOT NULL,
    plan_id NVARCHAR(50) NOT NULL,
    plan_name NVARCHAR(255) NOT NULL,
    amount INT NOT NULL,
    currency NVARCHAR(10) NOT NULL,
    status NVARCHAR(20) DEFAULT 'Pending',
    razorpay_order_id NVARCHAR(255),
    razorpay_payment_id NVARCHAR(255) NULL,
    razorpay_signature NVARCHAR(255) NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    verified_at DATETIME2 NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- 5. Create the user_generation_counts table
CREATE TABLE user_generation_counts (
    user_id NVARCHAR(255) PRIMARY KEY,
    basic_plan_count INT DEFAULT 0,
    last_reset_date DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- 5. Insert a test user
INSERT INTO users (id, username, created_at)
VALUES ('user_abc_123', 'abc', GETDATE());
GO

-- 6. Verify the setup
SELECT 'Database setup completed successfully!' as message;
SELECT 'Users table:' as table_name, COUNT(*) as record_count FROM users;
SELECT 'Payment history table:' as table_name, COUNT(*) as record_count FROM payment_history;
GO