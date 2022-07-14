import express from "express";
import con from "../../../dbCon.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (username.length < 4 || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Username and password must be at least 4 characters long",
      });
    }

    const [user] = await con.query(`SELECT * FROM users WHERE username = ?`, [
      username,
    ]);
    if (user.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await con.query(
      `INSERT INTO users (username, password) VALUES (?, ?)`,
      [username, hashedPassword]
    );
    const token = jwt.sign(
      { id: result.insertId, username: username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res
      .cookie("token", token, {
        httpOnly: true,
        // maxAge 30 days
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: "strict",
      })
      .json({
        success: true,
        message: "User created successfully",
        id: result.insertId,
      });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
