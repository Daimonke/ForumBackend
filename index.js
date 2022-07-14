import "dotenv/config";
import express from "express";
import cors from "cors";
import registerRouter from "./routes/api/auth/register.js";
import loginRouter from "./routes/api/auth/login.js";
import verifyRouter from "./routes/api/auth/verifyUser.js";
import logoutRouter from "./routes/api/auth/logout.js";
import postsRouter from "./routes/api/content/posts.js";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 3020;
const app = express();

const corsOptions = {
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/auth/verifyUser", verifyRouter);
app.use("/auth/register", registerRouter);
app.use("/auth/login", loginRouter);
app.use("/auth/logout", logoutRouter);
app.use("/content/posts", postsRouter);

app.listen(PORT, () =>
  console.log(`Server running at: http://localhost:${PORT}`)
);
