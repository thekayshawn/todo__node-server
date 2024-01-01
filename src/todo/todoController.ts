import http from "http";
import { ParsedUrlQuery } from "querystring";

// Utils
import { Todo } from "./todoTypes";
import { todoModel } from "./todoModel";
import { send400, send404, send405, send500, sendJSON } from "../utils";

type Controller = {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  query: ParsedUrlQuery;
};

function getTodos({ res, query }: Controller) {
  // Get the ID from the query
  const id = query.id?.toString();

  // Return todo by id if it exists
  if (id) {
    todoModel
      .getTodoById(id)
      .then((todo) => {
        if (!todo) {
          send404(res);
          return;
        }

        sendJSON(res, todo);
      })
      .catch((error) => {
        console.error(error);
        send500(res);
      });

    return;
  }

  // Otherwise, fetch all todos
  todoModel
    .getAllTodos()
    .then((todos) => {
      sendJSON(res, todos);
    })
    .catch((error) => {
      console.error(error);
      send500(res);
    });
}

function postTodo({ req, res }: Controller) {
  let body = "";

  req.on("data", (chunk) => {
    if (!chunk) {
      send400(res);
      return;
    }

    body += chunk;
  });

  req.on("end", () => {
    const params = JSON.parse(body);

    // Get the title from the query
    const title: string | undefined = params.title;

    // Send 400 if the title is missing
    if (!title) {
      send400(res);
      return;
    }

    todoModel
      .addTodo({ title, completed: false })
      .then((newTodo) => {
        sendJSON(res, newTodo);
      })
      .catch((error) => {
        console.error(error);
        send500(res);
      });
  });
}

function patchTodo({ req, res, query }: Controller) {
  const id = query.id?.toString();

  if (!id) {
    send400(res);
    return;
  }

  let body = "";

  req.on("data", (chunk) => {
    if (!chunk) {
      send400(res);
      return;
    }

    body += chunk;
  });

  req.on("end", () => {
    const params = JSON.parse(body);

    // Get the data from the query
    const title: string | undefined = params.title;
    const completed: boolean | undefined = params.completed;

    // Send 400 if no data is provided
    if (!title && completed === undefined) {
      send400(res);
      return;
    }

    const todo = {
      ...(title && { title }),
      ...(completed !== undefined && { completed }),
    };

    todoModel
      .updateTodoById(id, todo)
      .then((updatedTodo) => {
        sendJSON(res, updatedTodo);
      })
      .catch((error) => {
        console.error(error);
        send500(res);
      });
  });
}

function deleteTodo({ res, query }: Controller) {
  const id = query.id?.toString();

  if (!id) {
    send400(res);
    return;
  }

  todoModel
    .removeTodoById(id)
    .then(() => {
      sendJSON(res, { id });
    })
    .catch((error) => {
      console.error(error);
      send500(res);
    });
}

export function todoController({ req, res, query }: Controller) {
  // Get the HTTP method
  const method = req.method?.toLowerCase();

  // Send 400 if the method is missing
  if (!method) {
    send400(res);
    return;
  }

  const handler = {
    get: getTodos,
    post: postTodo,
    patch: patchTodo,
    delete: deleteTodo,
  }[method || ""];

  // In case of no match, send 405
  if (!handler) {
    send405(res);
    return;
  }

  // Call the handler
  handler({
    req,
    res,
    query,
  });
}
