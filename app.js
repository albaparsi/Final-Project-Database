require("dotenv").config();

const { Client } = require("pg");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

console.log("Database being used:", process.env.DB_NAME);
const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

const rl = readline.createInterface({ input, output });

async function viewProducts() {
  const result = await client.query(`
    SELECT product_id, product_name, category, price, quantity_in_stock
    FROM product
    ORDER BY product_id;
  `);

  console.table(result.rows);
}

async function addCustomer() {
  const firstName = await rl.question("First name: ");
  const lastName = await rl.question("Last name: ");
  const email = await rl.question("Email: ");
  const phone = await rl.question("Phone: ");

  const result = await client.query(
    `INSERT INTO customer (first_name, last_name, email, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING customer_id, first_name, last_name;`,
    [firstName, lastName, email, phone]
  );

  console.log("Customer added:", result.rows[0]);
}

async function addProduct() {
  const productName = await rl.question("Product name: ");
  const description = await rl.question("Description: ");
  const category = await rl.question("Category: ");
  const price = Number(await rl.question("Price: "));
  const quantity = Number(await rl.question("Quantity in stock: "));

  if (!Number.isFinite(price) || price <= 0) {
    console.log("Price must be greater than 0.");
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    console.log("Quantity must be a whole number of 0 or more.");
    return;
  }

  const result = await client.query(
    `INSERT INTO product
      (product_name, description, category, price, quantity_in_stock)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING product_id, product_name;`,
    [productName, description, category, price, quantity]
  );

  console.log("Product added:", result.rows[0]);
}

async function recordPurchase() {
  const customerId = Number(await rl.question("Customer ID: "));
  const productId = Number(await rl.question("Product ID: "));
  const staffId = Number(await rl.question("Staff ID: "));
  const quantity = Number(await rl.question("Quantity: "));
  const paymentMethod = await rl.question(
    "Payment method (example: Visa ending in 1234): "
  );

  if (
    !Number.isInteger(customerId) ||
    !Number.isInteger(productId) ||
    !Number.isInteger(staffId) ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    console.log("IDs and quantity must be valid whole numbers.");
    return;
  }

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      `SELECT product_name, price, quantity_in_stock
       FROM product
       WHERE product_id = $1
       FOR UPDATE;`,
      [productId]
    );

    if (productResult.rowCount === 0) {
      throw new Error("Product not found.");
    }

    const product = productResult.rows[0];

    if (product.quantity_in_stock < quantity) {
      throw new Error(
        `Not enough inventory. Only ${product.quantity_in_stock} available.`
      );
    }

    const totalAmount = Number(product.price) * quantity;

    const purchaseResult = await client.query(
      `INSERT INTO purchase
        (customer_id, product_id, staff_id, quantity, total_amount, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING purchase_id, total_amount, purchase_date;`,
      [customerId, productId, staffId, quantity, totalAmount, paymentMethod]
    );

    await client.query(
      `UPDATE product
       SET quantity_in_stock = quantity_in_stock - $1
       WHERE product_id = $2;`,
      [quantity, productId]
    );

    await client.query("COMMIT");

    console.log("Purchase recorded:", purchaseResult.rows[0]);
    console.log(`Inventory updated for ${product.product_name}.`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Purchase failed:", error.message);
  }
}

async function viewCustomerPurchases() {
  const customerId = Number(await rl.question("Customer ID: "));

  const result = await client.query(
    `SELECT
       c.first_name || ' ' || c.last_name AS customer_name,
       p.product_name,
       pu.quantity,
       pu.total_amount,
       pu.payment_method,
       pu.purchase_date,
       s.first_name || ' ' || s.last_name AS processed_by
     FROM purchase pu
     JOIN customer c ON pu.customer_id = c.customer_id
     JOIN product p ON pu.product_id = p.product_id
     JOIN staff s ON pu.staff_id = s.staff_id
     WHERE c.customer_id = $1
     ORDER BY pu.purchase_date DESC;`,
    [customerId]
  );

  if (result.rowCount === 0) {
    console.log("No purchases found for that customer.");
    return;
  }

  console.table(result.rows);
}

async function viewLowStock() {
  const result = await client.query(`
    SELECT product_id, product_name, category, quantity_in_stock
    FROM product
    WHERE quantity_in_stock <= 5
    ORDER BY quantity_in_stock, product_name;
  `);

  console.table(result.rows);
}

function showMenu() {
  console.log(`
--- E-Commerce Database CLI ---
1. View all products
2. Add a customer
3. Add a product
4. Record a purchase
5. View customer purchase history
6. View low-stock products
7. View product sales report
8. Exit
`);
}

async function viewProductSales() {
  const result = await client.query(`
    SELECT
      p.product_name,
      SUM(pu.quantity) AS total_units_sold,
      SUM(pu.total_amount) AS total_sales
    FROM purchase pu
    JOIN product p ON pu.product_id = p.product_id
    GROUP BY p.product_id, p.product_name
    ORDER BY total_sales DESC;
  `);

  if (result.rows.length === 0) {
    console.log("No purchase records found.");
    return;
  }

  console.table(result.rows);
}

async function main() {
  try {
    await client.connect();
    console.log("Connected to ecommerce_db.");

    let running = true;

    while (running) {
      showMenu();
      const choice = await rl.question("Choose an option: ");

      try {
        switch (choice.trim()) {
          case "1":
            await viewProducts();
            break;
          case "2":
            await addCustomer();
            break;
          case "3":
            await addProduct();
            break;
          case "4":
            await recordPurchase();
            break;
          case "5":
            await viewCustomerPurchases();
            break;
          case "6":
            await viewLowStock();
            break;
          case "7":
            await viewProductSales();
            break;
          case "8":
            running = false;
            console.log("Goodbye.");
            break;
          default:
            console.log("Invalid option. Please enter 1 through 8.");
        }
      } catch (error) {
        console.log("Database error:", error.message);
      }
    }
  } catch (error) {
    console.error("Could not connect to the database:", error.message);
  } finally {
    await client.end();
    rl.close();
  }
}

main();