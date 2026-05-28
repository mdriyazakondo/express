import type { Request, Response } from "express";
import { profileService } from "./profile.service";

const createProfileController = async (req: Request, res: Response) => {
  try {
    const result = await profileService.createProfileService(req.body);

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Profile creation failed",
    });
  }
};

export const profileController = {
  createProfileController,
};
