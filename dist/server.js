

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express4 from "express";

// src/modules/users/users.route.ts
import express from "express";

// src/db/db.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  DATA_BASE_URL: process.env.DATA_BASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
};
var config_default = config;

// src/db/db.ts
var pool = new Pool({
  connectionString: config_default.DATA_BASE_URL
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20),
        email text UNIQUE NOT NULL,
        password text NOT NULL,
        is_active BOOLEAN DEFAULT true,
        age INT,
        role VARCHAR(10) DEFAULT 'user',
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles(
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    bio TEXT,
    address TEXT,
    phone VARCHAR(15),
    gender VARCHAR(10),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
`);
    console.log("database connected successfully");
  } catch (error) {
    console.error(error);
  }
};
var db_default = initDB;

// src/modules/users/user.service.ts
import bcrypt from "bcryptjs";
var userCreateService = async (payload) => {
  const { name, email, password, age, role } = payload;
  const hashPassword = await bcrypt.hash(password, 12);
  if (role) {
    if (role !== "admin" && role !== "agent" && role !== "user") {
      throw new Error(
        "Invalid role provided. Role must be 'admin', 'agent', or 'user'."
      );
    }
    const result = await pool.query(
      `INSERT INTO users(name,email,password,age,role)
           VALUES($1,$2,$3,$4,COALESCE($5, 'user'))
           RETURNING id,name,email,age,role,created_at,updated_at`,
      [name, email, hashPassword, age, role]
    );
    return result;
  } else {
    const result = await pool.query(
      `INSERT INTO users(name,email,password,age)
           VALUES($1,$2,$3,$4)
           RETURNING id,name,email,age,created_at,updated_at`,
      [name, email, hashPassword, age]
    );
    return result;
  }
};
var userAllService = async () => {
  const result = await pool.query(`
     SELECT name,email,age,role,created_at,updated_at FROM users `);
  return result;
};
var userGetSingleService = async (id) => {
  const result = await pool.query(
    `
        SELECT name,email,age,role,created_at,updated_at FROM users  WHERE id = $1
      `,
    [id]
  );
  return result;
};
var updateUserService = async (payload) => {
  const { name, password, age, is_active, id, role } = payload;
  const result = await pool.query(
    `
      UPDATE users
      SET
        name = COALESCE($1, name),
        password =COALESCE($2, password),
        age = COALESCE($3, age),
        is_active = COALESCE($4, is_active),
        role = COALESCE($6, role),
        updated_at = NOW()
      WHERE id = $5
      RETURNING id,name,email,age,role,created_at,updated_at
      `,
    [name, password, age, is_active, id, role]
  );
  return result;
};
var userDeleteService = async (id) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING id,name,email,age,role,created_at,updated_at`,
    [id]
  );
  return result;
};
var userService = {
  userCreateService,
  userAllService,
  userGetSingleService,
  updateUserService,
  userDeleteService
};

// src/utility/sendResponse.ts
var sendResponse = (res, result) => {
  res.status(result.statusCode).json({
    message: result.message,
    success: result.success,
    data: result.data,
    error: result.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/users/users.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.userCreateService(req.body);
    res.status(201).json({
      message: "user create successfully",
      success: true,
      data: result.rows[0]
    });
    sendResponse_default(res, {
      statusCode: 201,
      message: "user create successfully",
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 404,
      message: "user create failed",
      success: false,
      error
    });
  }
};
var allUserGet = async (req, res) => {
  try {
    const result = await userService.userAllService();
    sendResponse_default(res, {
      statusCode: 200,
      message: "users retrieved successfully",
      success: true,
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 404,
      message: "user fetch failed",
      success: false,
      error
    });
  }
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.userGetSingleService(id);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Single user retrieved successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(404).json({
      message: " single user fetch  felid",
      success: false,
      error: error.message
    });
  }
};
var updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password, age, is_active } = req.body;
    const userUpdateData = { name, password, age, is_active, id };
    const result = await userService.updateUserService(
      userUpdateData
    );
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(404).json({
      message: " Update user  felid",
      success: false,
      error: error.message
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id"
    });
  }
  try {
    const result = await userService.userDeleteService(id);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: "User delete failed",
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "User delete failed",
        error: "Unknown error"
      });
    }
  }
};
var usersController = {
  allUserGet,
  createUser,
  getSingleUser,
  updateUser,
  deleteUser
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const decoded = jwt.verify(
        token,
        config_default.JWT_SECRET
      );
      const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
        decoded.email
      ]);
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User Not found!" });
      }
      if (!user.is_active) {
        return res.status(403).json({ success: false, message: "Forbidden!!" });
      }
      if (roles.length && !roles.includes(user.role)) {
        return res.status(400).json({ success: false, message: "Forbidden!!" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  admin: "admin",
  agent: "agent",
  user: "user"
};

// src/modules/users/users.route.ts
var userRoute = express();
userRoute.get(
  "/",
  auth_default(USER_ROLE.admin, USER_ROLE.agent),
  usersController.allUserGet
);
userRoute.post("/", usersController.createUser);
userRoute.get("/:id", usersController.getSingleUser);
userRoute.put("/:id", usersController.updateUser);
userRoute.delete("/:id", usersController.deleteUser);
var users_route_default = userRoute;

// src/modules/profile/profile.route.ts
import express2 from "express";

// src/modules/profile/profile.service.ts
var createProfileService = async (payload) => {
  const { user_id, bio, address, phone, gender } = payload;
  const userResult = await pool.query(`SELECT id FROM users WHERE id = $1`, [
    user_id
  ]);
  if (userResult.rowCount === 0) {
    throw new Error("User does not exist");
  }
  const result = await pool.query(
    `
    INSERT INTO profiles (user_id, bio, address, phone, gender)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [user_id, bio, address, phone, gender]
  );
  return result.rows[0];
};
var profileService = { createProfileService };

// src/modules/profile/profile.controller.ts
var createProfileController = async (req, res) => {
  try {
    const result = await profileService.createProfileService(req.body);
    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Profile creation failed"
    });
  }
};
var profileController = {
  createProfileController
};

// src/modules/profile/profile.route.ts
var profileRoute = express2.Router();
profileRoute.post("/", profileController.createProfileController);
var profile_route_default = profileRoute;

// src/modules/auth/auth.route.ts
import express3 from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginService = async (payload) => {
  const { email, password } = payload;
  const result = await pool.query(
    `SELECT id, name, email, password, age, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  if (result.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }
  const userData = result.rows[0];
  const isPasswordValid = await bcrypt2.compare(password, userData.password);
  if (!isPasswordValid) {
    throw new Error("Invalid Credentials");
  }
  const jwtPayload = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.JWT_SECRET, {
    expiresIn: "1d"
  });
  const refreshToken = jwt2.sign(jwtPayload, config_default.JWT_REFRESH_SECRET, {
    expiresIn: "7d"
  });
  delete userData.password;
  return { ...userData, accessToken, refreshToken };
};
var refreshTokenService = async (token) => {
  try {
    if (!token) {
      throw new Error("Unauthorized");
    }
    const decoded = jwt2.verify(
      token,
      config_default.JWT_REFRESH_SECRET
    );
    const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
      decoded.email
    ]);
    const user = userData.rows[0];
    if (userData.rows.length === 0) {
      throw new Error("User Not found!");
    }
    if (!user.is_active) {
      throw new Error("Forbidden!!");
    }
    const jwtPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    const accessToken = jwt2.sign(jwtPayload, config_default.JWT_SECRET, {
      expiresIn: "1d"
    });
    return { accessToken };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
var authService = { loginService, refreshTokenService };

// src/modules/auth/auth.controller.ts
var loginController = async (req, res) => {
  try {
    const result = await authService.loginService(req.body);
    const { refreshToken } = result;
    res.cookie("refreshToken", refreshToken, {
      secure: false,
      // IN production set to true
      httpOnly: true,
      sameSite: "lax"
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Profile creation failed"
    });
  }
};
var refreshTokenController = async (req, res) => {
  try {
    const result = await authService.refreshTokenService(
      req.cookies.refreshToken
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Profile creation failed"
    });
  }
};
var authController = {
  loginController,
  refreshTokenController
};

// src/modules/auth/auth.route.ts
var authRoute = express3.Router();
authRoute.post("/login", authController.loginController);
authRoute.post("/refresh-token", authController.refreshTokenController);
var auth_route_default = authRoute;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `Method --> ${req.method} Time --> ${/* @__PURE__ */ new Date()} URL --> ${req.url}`;
  fs.appendFile("logget.txt", log + "\n", (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
  next();
};
var logger_default = logger;

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globalError.ts
var globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalError_default = globalErrorHandler;

// src/app.ts
var app = express4();
app.use(cookieParser());
app.use(express4.json());
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use(cors(corsOptions));
app.use(logger_default);
app.use("/api/users", users_route_default);
app.use("/api/profile", profile_route_default);
app.use("/api/auth", auth_route_default);
app.get("/", (req, res) => {
  res.status(200).json({ message: "server is running" });
});
app.use(globalError_default);
var app_default = app;

// src/server.ts
var startServer = async () => {
  await db_default();
  app_default.listen(config_default.port, () => {
    console.log(`Server running on http://localhost:${config_default.port}`);
  });
};
startServer();
//# sourceMappingURL=server.js.map