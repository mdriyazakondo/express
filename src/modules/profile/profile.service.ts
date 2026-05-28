import { pool } from "../../db/db";
import type { profileInterface } from "./profile.interface";

const createProfileService = async (payload: profileInterface) => {
  const { user_id, bio, address, phone, gender } = payload;

  // 1️⃣ user exists check
  const userResult = await pool.query(`SELECT id FROM users WHERE id = $1`, [
    user_id,
  ]);

  if (userResult.rowCount === 0) {
    throw new Error("User does not exist");
  }

  // 2️⃣ profile insert
  const result = await pool.query(
    `
    INSERT INTO profiles (user_id, bio, address, phone, gender)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [user_id, bio, address, phone, gender],
  );

  return result.rows[0];
};

export const profileService = { createProfileService };
