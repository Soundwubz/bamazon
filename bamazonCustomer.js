var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "p@$$w0rd",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log('connected to bamazon');
  viewAllItems();
});

function viewAllItems() {
    let query = "SELECT * FROM products";
    let getItems = connection.query(query, (err, res) => {
        if (err) throw err;
        for(i = 0; i < res.length; i++) {
            console.log('Product Id: ', res[i].item_id, '\nProduct Name: ', res[i].product_name,
            '\nPrice: $', res[i].price, '\nStock: ', res[i].stock_quantity);
            console.log('\n------------------------------\n');
        }
        beginPrompt();
    });
    // connection.end();
}

function beginPrompt() {
    inquirer.prompt(
        {
            type: 'confirm',
            message: 'Would you like to purchase a product?',
            name: 'beginPurchase'
        }
    ).then((ans) => {
        if(ans.beginPurchase) {
            // run new prompt
            purchasePrompt();
        } else {
            console.log('Okay, please come back soon!');
            connection.end();
        }
    });
}

function purchasePrompt() {
    inquirer.prompt([
        {
            type: 'number',
            message: "What is the ID number of the product you'd like to purchase?",
            name: 'item_id'
        },
        {
            type: 'number',
            message: "How many units of this product would you like to purchase?",
            name: 'quantity'
        }
    ]).then((res) => {
        console.log(res);
        const purchaseQuantity = res.quantity;
        let itemId = res.item_id;
        let query = "SELECT * FROM products WHERE ?";
        let purchaseItem = connection.query(query, {item_id: itemId}, (err, res) => {
            if (err) throw err;
            if(res[0].stock_quantity > 0 && res[0].stock_quantity >= purchaseQuantity) {
                let purchaseTotal = res[0].price * purchaseQuantity;
                let newStock = res[0].stock_quantity - purchaseQuantity;
                let updateQuery = "UPDATE products SET stock_quantity = " + newStock.toString() + " WHERE ?";
                let updateStock = connection.query(updateQuery, {item_id: itemId}, (err, res) => {
                    if (err) throw err;
                    // update db to reflect purchase
                    console.log("\nTotal: $" + purchaseTotal);
                    connection.end();
                });
                } else {
                console.log('Insufficient Quantity!');
                beginPrompt();
            }
        });
    })
}