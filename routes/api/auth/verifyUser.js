import express from "express";
import isAuthed from "../../../isAuthed.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const authed = await isAuthed(req);
    if (authed) {
      return res.json({
        success: true,
        username: req.token.username,
        id: req.token.id,
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
