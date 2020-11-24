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
                        if (roleresults[i].title === answer.role) {
                            roleId = roleresults[i].id
                        }
                    }

                    if (answer.manager === "None") {
                        managerId = null
                    } else {
                        for (var i = 0; i < employeeresults.length; i++) {
                            if (employeeresults[i].first_name + " " + employeeresults[i].last_name === answer.manager)
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
    connection.query("SELECT * FROM department", function (err, deptresults) {
        if (err) throw err;
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
                },
                {
                    name: "department",
                    type: "list",
                    message: "What department is this role in?",
                    choices: function () {
                        const deptChoiceArray = deptresults.map(deptresults => deptresults.dept_name)
                        return deptChoiceArray;
                    }
                }
            ])
            .then(function (answer) {
                for (var i = 0; i < deptresults.length; i++) {
                    if (deptresults[i].dept_name === answer.department) {
                        deptId = deptresults[i].id
                    }
                }

                connection.query(
                    "INSERT INTO role SET ?",
                    {
                        title: answer.rolename,
                        salary: answer.salary,
                        department_id: deptId
                    },
                    function (err) {
                        if (err) throw err;
                        console.log("Your new role was added!");
                        start();
                    }
                );
            });
    });
}

function addDept() {
    inquirer
        .prompt([
            {
                name: "deptname",
                type: "input",
                message: "What is the department's name?"
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO department SET ?",
                {
                    dept_name: answer.deptname
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your new department was added!");
                    start();
                }
            );
        });
}

function viewEmployees() {
    var query = "SELECT employees.first_name, employees.last_name, role.title, role.salary, department.dept_name FROM employees INNER JOIN role INNER JOIN department ON (employees.role_id = role.id AND role.department_id = department.id)"

    connection.query(query, function (err, employeeresponse) {
        if (err) throw err;
        console.table(employeeresponse);
        start()
    });
}

function viewRoles() {
    var query = "SELECT role.title, role.salary, department.dept_name FROM role INNER JOIN department ON (role.department_id = department.id)"

    connection.query(query, function (err, roleresponse) {
        if (err) throw err;
        console.table(roleresponse);
        start();
    });
}

function viewDepts() {
    connection.query("SELECT * FROM department", function (err, response) {
        if (err) throw err;
        console.table(response);
        start();
    });
}

function updateRole() {
    connection.query("SELECT * FROM role", function (err, roleresults) {
        if (err) throw err;
        connection.query("SELECT * FROM employees", function (err, employeeresults) {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        name: "whatEmployee",
                        type: "list",
                        message: "Which employee would you like to update?",
                        choices: function () {
                            const employeeChoices = employeeresults.map(employeeresults => employeeresults.first_name + " " + employeeresults.last_name)
                            return (employeeChoices);
                        }
                    },
                    {
                        name: "whatRole",
                        type: "list",
                        message: "What is their new role?",
                        choices: function () {
                            const roleChoices = roleresults.map(roleresults => roleresults.title);
                            return roleChoices;
                        }
                    }
                ])
                .then(function (answer) {

                    for (var i = 0; i < employeeresults.length; i++) {
                        if (employeeresults[i].first_name + " " + employeeresults[i].last_name === answer.whatEmployee)
                            employeeUpdate = employeeresults[i].id
                    }

                    for (var i = 0; i < roleresults.length; i++) {
                        if (roleresults[i].title === answer.whatRole) {
                            roleId = roleresults[i].id
                        }
                    }

                    connection.query(
                        `UPDATE employees SET ? WHERE ?`,
                        [
                            {
                                role_id: roleId
                            },
                            {
                                id: employeeUpdate
                            }
                        ],
                        function (err) {
                            if (err) throw err;
                            console.log("Employee Updated!");
                            start();
                        }
                    );
                });
        });
    });
}

start();