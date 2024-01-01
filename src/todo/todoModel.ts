// Utils
import { NewTodo, Todo } from "./todoTypes";
import { query, queryOne } from "../database";

/**
 * Get all todos
 * @returns {Promise<Todo[]>} - All todos
 */
async function getAllTodos(): Promise<Todo[]> {
  return query<Todo>("SELECT * FROM todos");
}

/**
 * Get todo by id
 * @param {string} id - Todo id
 * @returns {Promise<Todo>} - Todo
 */
async function getTodoById(id: string): Promise<Todo | undefined> {
  return queryOne<Todo>("SELECT * FROM todos WHERE id = ?", [id]);
}

/**
 * Add todo
 * @param {Todo} todo - Todo
 * @returns {Promise<Todo>} - Add todo
 */
async function addTodo({ title, completed }: NewTodo): Promise<Todo> {
  // Insert todo into database
  await queryOne<Todo>(
    "INSERT INTO todos (`title`, `completed`) VALUES (?, ?)",
    [title, completed]
  );

  // Return the last inserted todo
  // This is a MySQL-specific feature
  return queryOne<Todo>("SELECT * FROM todos WHERE id = LAST_INSERT_ID()");
}

/**
 * Update todo
 * @param {Todo['id']} id - Todo id
 * @param {Todo} todo - Todo
 * @returns {Promise<Todo>} - Updated todo
 */
async function updateTodoById(
  id: Todo["id"],
  todo: Partial<NewTodo>
): Promise<Todo> {
  // Update todo in database
  await queryOne<Todo>("UPDATE todos SET ? WHERE id = ?", [todo, id]);

  // Return the updated todo
  return queryOne<Todo>("SELECT * FROM todos WHERE id = ?", [id]);
}

/**
 * Remove todo
 * @param {string} id - Todo id
 * @returns {Promise<void>} - Remove todo
 */
async function removeTodoById(id: string): Promise<void> {
  return queryOne("DELETE FROM todos WHERE id = ?", [id]);
}

export const todoModel = {
  addTodo,
  getAllTodos,
  getTodoById,
  updateTodoById,
  removeTodoById,
};
