var mysql = require("mysql");
var inquirer = require("inquirer");
var consoletable = require("console.table");

function newEmployee() {
    inquirer
        .prompt({
            name: "whatDo",
            type: "list",
            message: "What would you like to do?",
            choices: ["Add Employee", "Add A New Department", "Add a New Role", "View Employees", "View Departments", "View Roles", "Update Employee Role", "Quit"]
        })

};

newEmployee();