import express, { type Request, type Response } from "express";

import userRoute from "./modules/users/users.route";

const app = express();
app.use(express.json());

app.use("/api/users", userRoute);

// connect database

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "server is running" });
});

export default app;
