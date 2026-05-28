import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  port: process.env.PORT,
  DATA_BASE_URL: process.env.DATA_BASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
};

export default config;
