import type { Request, Response } from "express";
import { authService } from "./auth.service";

const loginController = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginService(req.body);

    const { refreshToken } = result;

    res.cookie("refreshToken", refreshToken, {
      secure: false, // IN production set to true
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Profile creation failed",
    });
  }
};

const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const result = await authService.refreshTokenService(
      req.cookies.refreshToken,
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Profile creation failed",
    });
  }
};

export const authController = {
  loginController,
  refreshTokenController,
};
