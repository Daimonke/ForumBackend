import express from "express";
import isAuthed from "../../../isAuthed.js";
import con from "../../../dbCon.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const authed = await isAuthed(req);
    const [comment] = await con.query(
      `
        SELECT comments.*, username, avatar, users.id AS user_id, (SELECT COUNT(user_id) FROM posts WHERE user_id = comments.user_id) AS userPostsCount,
        (SELECT COUNT(*) from commentsRating where comments.id = commentsRating.comment_id AND commentsRating.vote = 1) AS upvotes,
        (SELECT COUNT(*) from commentsRating where comments.id = commentsRating.comment_id AND commentsRating.vote = 0) AS downvotes
        ${
          authed
            ? `, (SELECT vote from commentsRating where comments.id = commentsRating.comment_id AND commentsRating.user_id = ${con.escape(
                req.token.id
              )}) AS userVoted`
            : ""
        }
        FROM comments
        JOIN users ON users.id = comments.user_id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at DESC
        `,
      [req.params.id]
    );
    const data = comment
      .map((item) => {
        return {
          comment: {
            id: item.id,
            post_id: item.post_id,
            user_id: item.user_id,
            comment: item.comment,
            created_at: item.created_at,
            commentVotes: item.upvotes - item.downvotes,
            userVoted: item.userVoted,
          },
          user: {
            id: item.user_id,
            username: item.username,
            avatar: item.avatar,
            userPostsCount: item.userPostsCount,
          },
        };
      })
      .sort((a, b) => b.comment.commentVotes - a.comment.commentVotes);

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const authed = await isAuthed(req);

    if (!authed) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to create a post",
      });
    }

    const { post_id, comment } = req.body;

    if (!post_id || !comment) {
      return res.status(400).json({
        success: false,
        message: "Comment is empty!",
      });
    }
    const created_at = new Date().toLocaleString("LT");
    const [data] = await con.query(
      `INSERT INTO comments (user_id, post_id, comment, created_at) VALUES (?, ?, ?, ?)`,
      [req.token.id, post_id, comment, created_at]
    );

    res.json({
      success: true,
      inserted_id: data.insertId,
      created_at: created_at,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
