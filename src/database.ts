import mysql from "mysql";

export const database = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export function query<T>(queryString: string, values?: unknown): Promise<T[]> {
  return new Promise((resolve, reject) => {
    database.query(queryString, values, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
}

export function queryOne<T>(queryString: string, values?: unknown): Promise<T> {
  return query<T>(queryString, values).then((results) => results[0]);
}
