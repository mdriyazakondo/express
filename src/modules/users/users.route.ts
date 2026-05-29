import express from "express";
import { usersController } from "./users.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const userRoute = express();

userRoute.get(
  "/",
  auth(USER_ROLE.admin, USER_ROLE.agent),
  usersController.allUserGet,
);

userRoute.post("/", usersController.createUser);

userRoute.get("/:id", usersController.getSingleUser);

userRoute.put("/:id", usersController.updateUser);

userRoute.delete("/:id", usersController.deleteUser);

export default userRoute;
