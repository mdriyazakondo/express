import app from "./app";
import config from "./config";
import initDB from "./db/db";

const startServer = async () => {
  await initDB();
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
};

startServer();
