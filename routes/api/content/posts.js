import express from "express";
import isAuthed from "../../../isAuthed.js";
import con from "../../../dbCon.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const authed = await isAuthed(req);
    // get all posts from db and send them
    const [posts] = await con.query(
      `
    SELECT posts.*, username, avatar, (SELECT COUNT(user_id) FROM posts WHERE user_id = users.id) AS userPostsCount, 
    (SELECT COUNT(*) from postsRating where posts.id = postsRating.post_id AND postsRating.vote = 1) AS upvotes,
    (SELECT COUNT(*) from postsRating where posts.id = postsRating.post_id AND postsRating.vote = 0) AS downvotes,
    (SELECT COUNT(*) from comments where comments.post_id = posts.id) AS comments
    ${
      req.token?.id
        ? ", (SELECT vote from postsRating where posts.id = postsRating.post_id AND postsRating.user_id = ?) AS userVoted"
        : ""
    } 
    FROM posts
    JOIN users ON users.id = posts.user_id
    ORDER BY posts.created_at DESC
    `,
      [req.token?.id]
    );
    const data = posts.map((item) => {
      return {
        post: {
          id: item.id,
          user_id: item.user_id,
          title: item.title,
          content: item.content,
          created_at: item.created_at,
          postVotes: item.upvotes - item.downvotes,
          userVoted: item.userVoted,
          comments: item.comments,
        },
        user: {
          username: item.username,
          avatar: item.avatar,
          userPostsCount: item.userPostsCount,
        },
      };
    });
    console.log(data);
    res.json({
      success: true,
      posts: data,
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

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const [result] = await con.query(
      `INSERT INTO posts (user_id, title, content, created_at) VALUES (?, ?, ?, ?)`,
      [req.token.id, title, content, new Date().toLocaleString("LT")]
    );

    res.json({
      success: true,
      inserted_id: result.insertId,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
