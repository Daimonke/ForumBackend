import express from "express";
import isAuthed from "../../../isAuthed.js";
import con from "../../../dbCon.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const authed = await isAuthed(req);
    if (!authed) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in",
      });
    }
    const { post_id, user_id, vote } = req.body;
    const [votes] = await con.query(
      `
    SELECT COUNT(*) AS count FROM postsRating WHERE user_id = ?
    AND post_id = ?
    `,
      [user_id, post_id]
    );

    if (votes[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already voted for this post",
      });
    }

    await con.query(
      `
    INSERT INTO postsRating (post_id, user_id, vote)
    VALUES (?, ?, ?)
    `,
      [post_id, user_id, vote]
    );
    return res.status(200).json({
      success: true,
      message: "Vote added",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const authed = await isAuthed(req);
    if (!authed) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in",
      });
    }
    const { id } = req.params;

    await con.query(
      `
    UPDATE postsRating SET vote = ? WHERE post_id = ? AND user_id = ?
    `,
      [req.body.vote, id, req.token.id]
    );

    return res.status(200).json({
      success: true,
      message: "Vote deleted",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
