import express from "express";
import { usersController } from "./users.controller";
import auth from "../../middleware/auth";

const userRoute = express();

userRoute.get("/", auth("admin"), usersController.allUserGet);

userRoute.post("/", usersController.createUser);

userRoute.get("/:id", usersController.getSingleUser);

userRoute.put("/:id", usersController.updateUser);

userRoute.delete("/:id", usersController.deleteUser);

export default userRoute;
