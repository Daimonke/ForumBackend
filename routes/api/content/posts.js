import express from "express";
import isAuthed from "../../../isAuthed.js";
import con from "../../../dbCon.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const authed = await isAuthed(req);

    const { sort, display } = req.query;

    // get all posts from db and send them
    const [posts] = await con.query(
      `
    SELECT posts.*, username, avatar, (SELECT COUNT(user_id) FROM posts WHERE user_id = users.id) AS userPostsCount, 
    (SELECT COUNT(*) from postsRating where posts.id = postsRating.post_id AND postsRating.vote = 1) AS upvotes,
    (SELECT COUNT(*) from postsRating where posts.id = postsRating.post_id AND postsRating.vote = 0) AS downvotes,
    (SELECT COUNT(*) from comments where comments.post_id = posts.id) AS comments
    ${
      authed
        ? `, (SELECT vote from postsRating where posts.id = postsRating.post_id AND postsRating.user_id = ${con.escape(
            req.token.id
          )}) AS userVoted`
        : ""
    } 
    FROM posts
    JOIN users ON users.id = posts.user_id
    ${
      display && req.token
        ? `WHERE posts.user_id = ${con.escape(req.token.id)}`
        : ""
    }
    ${sort === "comments" ? `ORDER BY comments DESC` : ""}
    ${sort === "created_at" ? `ORDER BY created_at DESC` : ""}
    ${!sort ? "ORDER BY posts.created_at DESC" : ""}
    `
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
          original_content: item.original_content,
          original_title: item.original_title,
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

router.patch("/:id", async (req, res) => {
  try {
    const authed = await isAuthed(req);

    if (!authed) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to edit a post",
      });
    }

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const [post] = await con.query(`SELECT * FROM posts WHERE id = ?`, [
      req.params.id,
    ]);
    if (req.token.id !== post[0].user_id) {
      return res.status(401).json({
        success: false,
        message: "You can only edit your own posts",
      });
    }

    const { original_content, original_title } = post[0];
    console.log("post", post);
    const [result] = await con.query(
      `UPDATE posts SET title = ?, content = ?
      ${
        original_title === null && post[0].title !== title
          ? `, original_title = ${con.escape(post[0].title)}`
          : ""
      }
          ${
            original_content === null && post[0].content !== content
              ? `, original_content = ${con.escape(post[0].content)}`
              : ""
          }
       WHERE id = ?`,
      [title, content, req.params.id]
    );
    console.log("result", result);
    res.json({
      success: true,
      message: "Post updated",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const authed = await isAuthed(req);

    if (!authed) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to delete a post",
      });
    }

    const [post] = await con.query(`SELECT * FROM posts WHERE id = ?`, [
      req.params.id,
    ]);
    if (req.token.id !== post[0].user_id) {
      return res.status(401).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    const [result] = await con.query(`DELETE FROM posts WHERE id = ?`, [
      req.params.id,
    ]);

    res.json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
