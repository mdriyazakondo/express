import { pool } from "../../db/db";
import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const loginService = async (payload: { email: string; password: string }) => {
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
    role: userData.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.JWT_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(jwtPayload, config.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  // 🔐 password remove before return
  delete userData.password;

  return { ...userData, accessToken, refreshToken };
};

const refreshTokenService = async (token: string) => {
  try {
    if (!token) {
      throw new Error("Unauthorized");
    }

    const decoded = jwt.verify(
      token as string,
      config.JWT_REFRESH_SECRET,
    ) as JwtPayload;

    const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
      decoded.email,
    ]);

    const user = userData.rows[0];

    if (userData.rows.length === 0) {
      throw new Error("User Not found!");
    }

    if (!user.is_active) {
      throw new Error("Forbidden!!");
    }

    const jwtPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(jwtPayload, config.JWT_SECRET, {
      expiresIn: "1d",
    });

    return { accessToken };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const authService = { loginService, refreshTokenService };
