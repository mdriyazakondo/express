import { pool } from "../../db/db";
import type { userInterface } from "./user.interface";
import bcrypt from "bcryptjs";

const userCreateService = async (payload: userInterface) => {
  const { name, email, password, age, role } = payload;
  const hashPassword = await bcrypt.hash(password, 12);

  if (role) {
    if (role !== "admin" && role !== "agent" && role !== "user") {
      throw new Error(
        "Invalid role provided. Role must be 'admin', 'agent', or 'user'.",
      );
    }
    const result = await pool.query(
      `INSERT INTO users(name,email,password,age,role)
           VALUES($1,$2,$3,$4,COALESCE($5, 'user'))
           RETURNING id,name,email,age,role,created_at,updated_at`,
      [name, email, hashPassword, age, role],
    );
    return result;
  } else {
    const result = await pool.query(
      `INSERT INTO users(name,email,password,age)
           VALUES($1,$2,$3,$4)
           RETURNING id,name,email,age,created_at,updated_at`,
      [name, email, hashPassword, age],
    );
    return result;
  }
};

const userAllService = async () => {
  const result = await pool.query(`
     SELECT name,email,age,role,created_at,updated_at FROM users `);
  return result;
};

const userGetSingleService = async (id: string) => {
  const result = await pool.query(
    `
        SELECT name,email,age,role,created_at,updated_at FROM users  WHERE id = $1
      `,
    [id],
  );

  return result;
};

const updateUserService = async (payload: userInterface) => {
  const { name, password, age, is_active, id, role } = payload;
  const result = await pool.query(
    `
      UPDATE users
      SET
        name = COALESCE($1, name),
        password =COALESCE($2, password),
        age = COALESCE($3, age),
        is_active = COALESCE($4, is_active),
        role = COALESCE($6, role),
        updated_at = NOW()
      WHERE id = $5
      RETURNING id,name,email,age,role,created_at,updated_at
      `,
    [name, password, age, is_active, id, role],
  );
  return result;
};

const userDeleteService = async (id: string) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING id,name,email,age,role,created_at,updated_at`,
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
