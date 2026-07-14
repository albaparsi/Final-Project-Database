-- E-Commerce Database System
-- CS4092 Final Project
-- PostgreSQL

DROP TABLE IF EXISTS purchase;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS staff;

CREATE TABLE staff (
    staff_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    job_title VARCHAR(75) NOT NULL,
    hire_date DATE NOT NULL
);

CREATE TABLE customer (
    customer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    account_created_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE product (
    product_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    quantity_in_stock INT NOT NULL CHECK (quantity_in_stock >= 0)
);

CREATE TABLE purchase (
    purchase_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    staff_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    payment_method VARCHAR(50) NOT NULL,
    purchase_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_purchase_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id),

    CONSTRAINT fk_purchase_product
        FOREIGN KEY (product_id)
        REFERENCES product(product_id),

    CONSTRAINT fk_purchase_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(staff_id)
);

INSERT INTO staff (first_name, last_name, email, job_title, hire_date)
VALUES
    ('Alex', 'Morgan', 'alex.morgan@techstore.com', 'Store Manager', '2024-01-15'),
    ('Jamie', 'Lee', 'jamie.lee@techstore.com', 'Inventory Specialist', '2024-06-10'),
    ('Taylor', 'Reed', 'taylor.reed@techstore.com', 'Sales Associate', '2025-02-03');

INSERT INTO customer (first_name, last_name, email, phone, account_created_date)
VALUES
    ('Jordan', 'Smith', 'jordan.smith@email.com', '513-555-0101', '2026-06-01'),
    ('Casey', 'Brown', 'casey.brown@email.com', '513-555-0102', '2026-06-05'),
    ('Morgan', 'Davis', 'morgan.davis@email.com', '513-555-0103', '2026-06-12'),
    ('Riley', 'Wilson', 'riley.wilson@email.com', '513-555-0104', '2026-06-20');

INSERT INTO product (
    product_name,
    description,
    category,
    price,
    quantity_in_stock
)
VALUES
    ('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 'Accessories', 29.99, 20),
    ('Mechanical Keyboard', 'Compact mechanical keyboard with backlight', 'Accessories', 89.99, 12),
    ('USB-C Hub', 'Six-port USB-C hub with HDMI output', 'Accessories', 49.99, 5),
    ('Webcam', '1080p webcam with built-in microphone', 'Cameras', 64.99, 8),
    ('Portable SSD', '1TB external solid-state drive', 'Storage', 99.99, 4),
    ('Noise-Canceling Headphones', 'Wireless over-ear headphones', 'Audio', 149.99, 10);

INSERT INTO purchase (
    customer_id,
    product_id,
    staff_id,
    quantity,
    total_amount,
    payment_method,
    purchase_date
)
VALUES
    (1, 1, 3, 1, 29.99, 'Visa ending in 1234', '2026-06-15 10:30:00'),
    (1, 3, 3, 1, 49.99, 'Visa ending in 1234', '2026-06-15 10:32:00'),
    (2, 2, 1, 1, 89.99, 'Mastercard ending in 5678', '2026-06-18 14:15:00'),
    (3, 5, 2, 1, 99.99, 'Visa ending in 9012', '2026-06-22 09:45:00'),
    (4, 4, 3, 2, 129.98, 'Discover ending in 3456', '2026-06-25 16:20:00'),
    (2, 6, 1, 1, 149.99, 'Mastercard ending in 5678', '2026-06-28 11:05:00');