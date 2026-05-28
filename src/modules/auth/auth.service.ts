import { pool } from "../../db/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

const loginService = async (payload: any) => {
  const { email, password } = payload;

  const result = await pool.query(
    `SELECT id, name, email, password, age, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email],
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }

  const userData = result.rows[0];

  // password verify
  const isPasswordValid = await bcrypt.compare(password, userData.password);

  if (!isPasswordValid) {
    throw new Error("Invalid Credentials");
  }

  const jwtPayload = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
  };

  const token = jwt.sign(jwtPayload, config.JWT_SECRET, { expiresIn: "1d" });

  // 🔐 password remove before return
  delete userData.password;

  return { ...userData, token };
};

export const authService = { loginService };
