import express from "express";
import { usersController } from "./users.controller";

const userRoute = express();

userRoute.get("/", usersController.allUserGet);

userRoute.post("/", usersController.createUser);

userRoute.get("/:id", usersController.getSingleUser);

userRoute.put("/:id", usersController.updateUser);

userRoute.delete("/:id", usersController.updateUser);

export default userRoute;
