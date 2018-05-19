var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3360,
    user: "root",
    password: "hello",
    database: "bamazon"
});


//establishing connection 
connection.connect(function(err){
    if (err) throw err; 
    console.log("connection successful!"); 
    makeTable(); 
})

//collect all of the data from mysql and print it to the screen 
var makeTable = function(){
    connection.query("SELECT * FROM products", function(err, res){
        for(var i=0; i<res.length; i++){
            console.log(res[i].itemid+" || "+res[i].productname+" || "+
                res[i].departmentname+" || "+res[i].price+" || "+res[i].stockquantity+"/n"); 
        }
    promptCustomer(res); 
    })
}
//a user can select and option and then purchase from there - take in the response object from the connection query, so that the products are the choices that the user can make the selection from 
var promptCustomer = function(res){
    inquirer.prompt([{//what would they like to purchase
        type:'input', 
        name:'choice', 
        message:'what would you like to purchase?'
    }]).then(function(answer){
        var correct = false; 
        for(var i=0;i<res.length;i++){
            if(res[i].productname === answer.choice){//loop through the response and see if the name = to the choice they made and set the id of what that item was 
                correct=true; 
                var product=answer.choice; 
                var id=i; 
                //how many would they like to buy
                inquirer.prompt({
                    type:"input", 
                    name:"quantity", 
                    message:"how much would you like to buy?",
                    validate: function(value){
                       //checking if a number
                        if(isNAN(value)===false){
                            return true; 
                        } else{
                            return false; 
                        }
                    }
                //if that number is not greater than the stock quantity then it will purchase that item and subtract an item from the database
                }).then(function(answer){
                    if((res[id].stockquantity-answer.quantity)>0){
                        connection.query("Update products SET stockquantity=' "+(res[id].stockquantity-answer.quantity)+" ' WHERE productname=' "+product+"'", function(err,res2){
                            console.log("Product Bought!"); 
                        })
                    } else {
                        console.log("not a valid selection"); 
                        promptCustomer(res); 
                    }
                })
            }
        }
    })
}