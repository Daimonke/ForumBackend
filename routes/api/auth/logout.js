import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
