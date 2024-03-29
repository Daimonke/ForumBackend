import express from "express";
import con from "../../../dbCon.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (req.body.username.length < 4 || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Username and password must be at least 4 characters long",
      });
    }

    const username =
      req.body.username[0].toUpperCase() + req.body.username.slice(1);

    const [user] = await con.query(`SELECT * FROM users WHERE username = ?`, [
      username,
    ]);
    if (user.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // random avatar api url
    const avatar = `https://avatars.dicebear.com/api/bottts/${username}.svg`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await con.query(
      `INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)`,
      [username, hashedPassword, avatar]
    );
    const token = jwt.sign(
      { id: result.insertId, username: username, avatar: avatar },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "User created successfully",
      id: result.insertId,
      username: username,
      avatar: avatar,
      userPostsCount: 0,
      token: token,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
