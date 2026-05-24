import type { Request, Response } from "express";
import { pool } from "../../db/db";

const createUser = async (req: Request, res: Response) => {
  const { name, email, password, age } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users(name,email,password,age)
       VALUES($1,$2,$3,$4)
       RETURNING *`,
      [name, email, password, age],
    );

    res.status(201).json({
      message: "user create successfully",
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(404).json({
      message: "user create felid",
      success: false,
      error: error,
    });
  }
};

const allUserGet = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
     SELECT * FROM users `);

    res.status(200).json({
      message: "users retrieved successfully",
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(404).json({
      message: "user fetch felid",
      success: false,
      error: error,
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT * FROM users  WHERE id = $1
      `,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Single user retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(404).json({
      message: " single user fetch  felid",
      success: false,
      error: error.message,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, password, age, is_active } = req.body;

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

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(404).json({
      message: " Update user  felid",
      success: false,
      error: error.message,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: "User delete failed",
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "User delete failed",
        error: "Unknown error",
      });
    }
  }
};

export const usersController = {
  allUserGet,
  createUser,
  getSingleUser,
  updateUser,
  deleteUser,
};
