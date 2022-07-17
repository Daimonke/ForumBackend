import express from "express";
import con from "../../../dbCon.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username.length < 4 || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const [user] = await con.query(
      `SELECT *, (SELECT COUNT(user_id) FROM posts WHERE user_id = users.id) AS userPostsCount
       FROM users WHERE username = ?`,
      [username]
    );
    if (user.length <= 0) {
      return res.status(400).json({
        success: false,
        message: "Username does not exist",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { id: user[0].id, username: user[0].username, avatar: user[0].avatar },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res
      .cookie("token", token, {
        httpOnly: true,
        // maxAge 30 days
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // must be 'none' to enable cross-site delivery
        secure: process.env.NODE_ENV === "production", // must be true if sameSite='none'
      })
      .json({
        success: true,
        message: "User logged in successfully",
        id: user[0].id,
        username: user[0].username,
        avatar: user[0].avatar,
        userPostsCount: user[0].userPostsCount,
      });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
