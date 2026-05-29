import type { userInterface } from "./user.interface";
import type { Request, Response } from "express";
import { pool } from "../../db/db";
import { userService } from "./user.service";
import sendResponse from "../../utility/sendResponse";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.userCreateService(req.body);

    res.status(201).json({
      message: "user create successfully",
      success: true,
      data: result.rows[0],
    });

    sendResponse(res, {
      statusCode: 201,
      message: "user create successfully",
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 404,
      message: "user create failed",
      success: false,
      error: error,
    });
  }
};

const allUserGet = async (req: Request, res: Response) => {
  try {
    const result = await userService.userAllService();
    sendResponse(res, {
      statusCode: 200,
      message: "users retrieved successfully",
      success: true,
      data: result.rows,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 404,
      message: "user fetch failed",
      success: false,
      error: error,
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await userService.userGetSingleService(id as string);
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
    const userUpdateData = { name, password, age, is_active, id };

    const result = await userService.updateUserService(
      userUpdateData as userInterface,
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
    const result = await userService.userDeleteService(id as string);

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
