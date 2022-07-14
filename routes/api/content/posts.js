import express from "express";
import isAuthed from "../../../isAuthed.js";
import con from "../../../dbCon.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // get all posts from db and send them
    const [posts] = await con.query(`
    SELECT posts.*, username, avatar, (select count(user_id) FROM posts WHERE user_id = users.id) AS userPostsCount FROM posts
    JOIN users ON users.id = posts.user_id
    ORDER BY posts.created_at DESC
    `);

    const data = posts.map((item) => {
      return {
        post: {
          id: item.id,
          user_id: item.user_id,
          title: item.title,
          content: item.content,
          created_at: item.created_at,
        },
        user: {
          username: item.username,
          avatar: item.avatar,
          userPostsCount: item.userPostsCount,
        },
      };
    });

    res.json({
      success: true,
      posts: data,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
