const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`there is a DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const hasPriorityAndStatusProperty = (obj) => {
  return obj.priority != undefined && obj.status != undefined;
};
const hasPriorityProperty = (obj) => {
  return obj.priority != undefined;
};
const hasStatusProperty = (obj) => {
  return obj.status != undefined;
};

//API 1
app.get("/todos/", async (request, response) => {
  let todoQuery = "";
  const { status, priority, search_q = "" } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      todoQuery = `select * from todo where todo like '%${search_q}%' and status='${status}' and priority='${priority}'`;
      break;
    case hasPriorityProperty(request.query):
      todoQuery = `select * from todo where priority='${priority}'`;
      break;
    case hasStatusProperty(request.query):
      todoQuery = `select * from todo where status='${status}'`;
      break;
    default:
      todoQuery = `select * from todo where todo like '%${search_q}%'`;
      break;
  }

  const dbResponse = await db.all(todoQuery);
  response.send(dbResponse);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sqlQuery = `select * from todo where id='${todoId}'`;
  const dbResponse = await db.get(sqlQuery);
  response.send(dbResponse);
});

//API 3

app.post("/todos/", async (request, response) => {
  const body = request.body;
  const { id, todo, priority, status } = body;
  const sqlQuery = `insert into todo(id,todo,priority,status) values
    (
        '${id}',
        '${todo}',
        '${priority}',
        '${status}'
        );`;
  await db.run(sqlQuery);
  response.send("Todo Successfully Added");
});

//API 4

const checkTodo = (obj) => {
  return obj.todo != undefined;
};
const checkPriority = (obj) => {
  return obj.priority != undefined;
};
const checkStatus = (obj) => {
  return obj.status != undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const body = request.body;
  const { todoId } = request.params;
  let query = "";
  const { todo, priority, status } = body;
  switch (true) {
    case checkTodo(body):
      query = `update todo set todo='${todo}' where id=${todoId};`;
      await db.run(query);
      response.send("Todo Updated");
      break;
    case checkPriority(body):
      query = `update todo set priority='${priority}' where id=${todoId};`;
      await db.run(query);
      response.send("Priority Updated");
      break;
    case checkStatus(body):
      query = `update todo set status='${status}' where id=${todoId};`;
      await db.run(query);
      response.send("Status Updated");
      break;
    default:
      break;
  }
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sqlQuery = `delete from todo where id=${todoId}`;
  await db.run(sqlQuery);
  response.send("Todo Deleted");
});

module.exports = app;
