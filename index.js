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

    connection.query("SELECT * FROM role", function (err, roleresults) {
        if (err) throw err;
        connection.query("SELECT * FROM employees", function (err, employeeresults) {
            if (err) throw err;


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
                        choices: function () {
                            const roleChoiceArray = roleresults.map(roleresults => roleresults.title);
                            return roleChoiceArray;
                        },
                        message: "What is your employee's role?",
                    },
                    {
                        name: "manager",
                        type: "list",
                        message: "Who is your employee's manager?",
                        choices: function () {
                            const employeeChoiceArray = employeeresults.map(employeeresults => employeeresults.first_name + " " + employeeresults.last_name)
                            employeeChoiceArray.push("None");
                            return (employeeChoiceArray);
                        }
                    }
                ])
                .then(function (answer) {
                    var roleId;

                    for (var i = 0; i < roleresults.length; i++) {
                        roleId = roleresults[i].id
                    }

                    if (answer.manager === "None") {
                        managerId = null
                    } else {
                        for (var i = 0; i < employeeresults.length; i++) {
                            managerId = employeeresults[i].id
                        }
                    }

                    connection.query(
                        "INSERT INTO employees SET ?",
                        {
                            first_name: answer.firstName,
                            last_name: answer.lastName,
                            role_id: roleId,
                            manager_id: managerId,
                        },
                        function (err) {
                            if (err) throw err;
                            console.log("Your new employee was added!");
                            start();
                        }
                    );
                });
        })
    });
}

function addRole() {
    inquirer
        .prompt([
            {
                name: "rolename",
                type: "input",
                message: "What is the name of the new role?"
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary?",
                validate: (value) => {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                },
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: answer.rolename,
                    salary: answer.salary
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your new role was added!");
                    start();
                }
            );
        })
}

start();