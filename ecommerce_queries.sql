/*showing available products*/
SELECT
    product_name,
    category,
    price,
    quantity_in_stock
FROM product
WHERE quantity_in_stock > 0
ORDER BY product_name;

/*showing customer purchase history*/
SELECT
    c.first_name || ' ' || c.last_name AS customer_name,
    p.product_name,
    pu.quantity,
    pu.total_amount,
    pu.purchase_date,
    s.first_name || ' ' || s.last_name AS staff_member
FROM purchase pu
JOIN customer c ON pu.customer_id = c.customer_id
JOIN product p ON pu.product_id = p.product_id
JOIN staff s ON pu.staff_id = s.staff_id
ORDER BY pu.purchase_date DESC;

/*showing low stock products*/
SELECT
    product_name,
    category,
    quantity_in_stock
FROM product
WHERE quantity_in_stock <= 5
ORDER BY quantity_in_stock ASC;

/*showing total sales by product*/
SELECT
    p.product_name,
    SUM(pu.quantity) AS total_units_sold,
    SUM(pu.total_amount) AS total_sales
FROM purchase pu
JOIN product p ON pu.product_id = p.product_id
GROUP BY p.product_id, p.product_name
ORDER BY total_sales DESC;