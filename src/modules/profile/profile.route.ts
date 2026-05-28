import express from "express";
import { profileController } from "./profile.controller";

const profileRoute = express.Router();

profileRoute.post("/", profileController.createProfileController);

export default profileRoute;
