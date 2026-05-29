import express, { type Request, type Response } from "express";
import userRoute from "./modules/users/users.route";
import profileRoute from "./modules/profile/profile.route";
import authRoute from "./modules/auth/auth.route";
import logger from "./middleware/logger";
import cookieParser from "cookie-parser";
import cors from "cors";
import globalErrorHandler from "./middleware/globalError";

const app = express();
app.use(cookieParser());
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));

app.use(logger);

app.use("/api/users", userRoute);
app.use("/api/profile", profileRoute);
app.use("/api/auth", authRoute);

// connect database

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "server is running" });
});

app.use(globalErrorHandler);

export default app;
