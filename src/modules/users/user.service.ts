import { pool } from "../../db/db";
import type { userInterface } from "./user.interface";

const userCreateService = async (payload: userInterface) => {
  const { name, email, password, age } = payload;
  const result = await pool.query(
    `INSERT INTO users(name,email,password,age)
           VALUES($1,$2,$3,$4)
           RETURNING *`,
    [name, email, password, age],
  );
  return result;
};

const userAllService = async () => {
  const result = await pool.query(`
     SELECT * FROM users `);
  return result;
};

const userGetSingleService = async (id: string) => {
  const result = await pool.query(
    `
        SELECT * FROM users  WHERE id = $1
      `,
    [id],
  );

  return result;
};

const updateUserService = async (payload: userInterface) => {
  const { name, password, age, is_active, id } = payload;
  const result = await pool.query(
    `
      UPDATE users
      SET
        name = COALESCE($1, name),
        password =COALESCE($2, password),
        age = COALESCE($3, age),
        is_active = COALESCE($4, is_active),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
    [name, password, age, is_active, id],
  );
  return result;
};

const userDeleteService = async (id: string) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id],
  );

  return result;
};
export const userService = {
  userCreateService,
  userAllService,
  userGetSingleService,
  updateUserService,
  userDeleteService,
};
