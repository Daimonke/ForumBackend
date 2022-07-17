import "dotenv/config";
import express from "express";
import cors from "cors";
import registerRouter from "./routes/api/auth/register.js";
import loginRouter from "./routes/api/auth/login.js";
import verifyRouter from "./routes/api/auth/verifyUser.js";
import logoutRouter from "./routes/api/auth/logout.js";
import postsRouter from "./routes/api/content/posts.js";
import voteRouter from "./routes/api/content/vote.js";
import commentsRouter from "./routes/api/content/comments.js";
import commentsVoteRouter from "./routes/api/content/commentsVote.js";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 3020;
const app = express();

const corsOptions = {
  credentials: true,
  origin:
    process.env.NODE_ENV === "production"
      ? "https://daimonke-forum.herokuapp.com"
      : "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/auth/verifyUser", verifyRouter);
app.use("/auth/register", registerRouter);
app.use("/auth/login", loginRouter);
app.use("/auth/logout", logoutRouter);
app.use("/content/posts", postsRouter);
app.use("/content/vote", voteRouter);
app.use("/content/comments", commentsRouter);
app.use("/content/commentsVote", commentsVoteRouter);

app.listen(PORT, () =>
  console.log(`Server running at: http://localhost:${PORT}`)
);
