import type { Request, Response } from "express";
import fs from "fs";

const logger = (req: Request, res: Response, next: () => void) => {
  const log = `Method --> ${req.method} Time --> ${new Date()} URL --> ${req.url}`;
  fs.appendFile("logget.txt", log + "\n", (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
  next();
};

export default logger;
