import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { pool } from "../db/db";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      token as string,
      config.JWT_SECRET,
    ) as jwt.JwtPayload;

    const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
      decoded.email,
    ]);

    const user = userData.rows[0];

    if (userData.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User Not found!" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Forbidden!!" });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default auth;
