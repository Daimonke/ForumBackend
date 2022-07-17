import express from "express";
import isAuthed from "../../../isAuthed.js";
import con from "../../../dbCon.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const authed = await isAuthed(req);
    if (authed) {
      const [data] = await con.query(
        `SELECT COUNT(user_id) AS userPostsCount FROM posts WHERE user_id = ?`,
        [req.token.id]
      );
      return res.json({
        success: true,
        username: req.token.username,
        id: req.token.id,
        avatar: req.token.avatar,
        userPostsCount: data[0].userPostsCount,
      });
    } else {
      return res.status(201).json({
        success: false,
        message: "Unauthorized",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
