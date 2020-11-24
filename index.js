var mysql = require("mysql");
var inquirer = require("inquirer");
var consoletable = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "emanagerDB"
});

function start() {
    inquirer
        .prompt(
            {
                name: "whatDo",
                type: "list",
                message: "What would you like to do?",
                choices: ["Add Employee", "Add A New Department", "Add A New Role", "View Employees", "View Departments", "View Roles", "Update Employee Role", "Quit"]
            })
        .then(function (answer) {
            if (answer.whatDo === "Add Employee") {
                addEmployee();
            }
            else if (answer.whatDo === "Add A New Department") {
                addDept();
            }
            else if (answer.whatDo === "Add A New Role") {
                addRole();
            }
            else if (answer.whatDo === "View Employees") {
                viewEmployees();
            }
            else if (answer.whatDo === "View Departments") {
                viewDepts();
            }
            else if (answer.whatDo === "View Roles") {
                viewRoles();
            }
            else if (answer.whatDo === "Update Employee Role") {
                updateRole();
            } else {
                connection.end();
            }
        });
};

function addEmployee() {
    inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "What is your employee's first name?",
            },
            {
                name: "lastName",
                type: "input",
                message: "What is your employee's last name?",
            },
            {
                name: "role",
                type: "list",
                message: "What is your employee's role?",
                choices: ["1", "2"]
            },
            {
                name: "manager",
                type: "list",
                message: "Who is your employee's manager?",
                choices: ["1,", "2"]
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO employees SET ?",
                {
                    first_name: answer.firstName,
                    last_name: answer.lastName,
                    role_id: answer.role,
                    manager_id: answer.manager,
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your Employee was added!");
                    start();
                }
            );
        });
}

start();