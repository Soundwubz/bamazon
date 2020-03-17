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
    managerPrompt();
});

function getItemId(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

function managerPrompt() {
    inquirer.prompt(
        {
            name: 'operation',
            message: 'Select an operation',
            choices: ['view products for sale',
            'view low inventory',
            'add to inventory',
            'add new product',
            'exit'],
            type: 'list'
        }
    ).then((res) => {
        switch(res.operation) {
            case 'view products for sale':
                viewAllItems();
                break;
            case 'view low inventory':
                viewLowInv();
                break;
            case 'add to inventory':
                addInventory();
                break;
            case 'add new product':
                addNewProduct();
                break;
            case 'exit':
                console.log('Goodbye');
                connection.end();
                break;
        }
    });
}

function viewAllItems() {
    let query = "SELECT * FROM products";
    let getItems = connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n-------------------------------\n ALL PRODUCTS \n-------------------------------\n');
        for(i = 0; i < res.length; i++) {
            console.log('Product Id: ', res[i].item_id, '\nProduct Name: ', res[i].product_name,
            '\nPrice ($): ', res[i].price, '\nStock: ', res[i].stock_quantity);
            console.log('\n------------------------------\n');
        }
        managerPrompt();
    });
}

function viewLowInv() {
    let query = "SELECT * FROM products WHERE stock_quantity < 5";
    let getLowInv = connection.query(query, (err, res) => {
        if(err) throw err;
        console.log('\n-------------------------------\n LOW INVENTORY \n-------------------------------\n');
        for(i = 0; i < res.length; i++) {
            console.log('Product Id: ', res[i].item_id, '\nProduct Name: ', res[i].product_name, 
            '\nStock: ', res[i].stock_quantity);
            console.log('\n------------------------------\n');
        }
        managerPrompt();
    })
}

function addInventory() {
    inquirer.prompt([
        {
            type: 'number',
            message: "What is the ID number of the product you'd like to update inventory for?",
            name: 'item_id'
        },
        {
            type: 'number',
            message: "How many units of this product are being added?",
            name: 'quantity'
        }
    ]).then((res) => {
        let productAdded = res.quantity;
        let itemId = res.item_id;
        let query = "SELECT * FROM products WHERE ?";
        let purchaseItem = connection.query(query, {item_id: itemId}, (err, res) => {
            if(err) throw err;
            let product = res[0].product_name;
            let newStock = res[0].stock_quantity + productAdded;
            let updateQuery = "UPDATE products SET stock_quantity = " + newStock.toString() + " WHERE ?";
            let updateStock = connection.query(updateQuery, {item_id: itemId}, (err, res, fields) => {
                if (err) throw err;
                connection.query('SELECT * FROM products WHERE ?', {item_id: itemId}, (err, res) => {
                    if(err) throw err;
                    console.log('\n-------------------------------\n UPDATED INVENTORY \n-------------------------------\n');
                    console.log('Product Id: ', res[0].item_id, '\nProduct Name: ', res[0].product_name, 
                    '\nStock: ', res[0].stock_quantity);
                    console.log('\n------------------------------\n');
                    managerPrompt();
                });
            });
        });
    })
}

function addNewProduct() {
    inquirer.prompt([
        {
            name: 'product_name',
            message: 'Name of Product'
        },
        {
            name: 'department_name',
            message: 'Department Name'
        },
        {
            type: 'number',
            message: 'Price ($)',
            name: 'price'
        },
        {
            type: 'number',
            message: 'Stock quantity',
            name: 'stock_quantity'
        },
    ]).then((answer) => {
        let itemId = getItemId(1000, 9999);
        let query = `INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
        VALUES (` + itemId + `, "` + answer.product_name + `", "` + answer.department_name + `", ` + answer.price
        + `, ` + answer.stock_quantity + `)`;
        connection.query(query, (err, res) => {
            if(err) throw err;
            connection.query('SELECT * FROM products WHERE ?', {item_id: itemId}, (err, res) => {
                console.log('\n-------------------------------\n NEW PRODUCT ADDED \n-------------------------------\n');
                console.log('Product Id: ', res[0].item_id, '\nProduct Name: ', res[0].product_name,
                '\nPrice ($): ', res[0].price, '\nStock: ', res[0].stock_quantity);
                managerPrompt();
            });
        });
    }) 
}