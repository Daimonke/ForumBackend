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
    const { comment_id, user_id, vote } = req.body;
    const [votes] = await con.query(
      `
    SELECT COUNT(*) AS count FROM commentsRating WHERE user_id = ?
    AND comment_id = ?
    `,
      [user_id, comment_id]
    );

    if (votes[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already voted for this post",
      });
    }

    await con.query(
      `
    INSERT INTO commentsRating (comment_id, user_id, vote)
    VALUES (?, ?, ?)
    `,
      [comment_id, user_id, vote]
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
    UPDATE commentsRating SET vote = ? WHERE comment_id = ? AND user_id = ?
    `,
      [req.query.vote, id, req.token.id]
    );

    return res.status(200).json({
      success: true,
      message: "Vote changed!",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
