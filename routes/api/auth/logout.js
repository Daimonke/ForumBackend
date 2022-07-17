import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        // maxAge 30 days
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: "none", // must be 'none' to enable cross-site delivery
        secure: true, // must be true if sameSite='none'
      })
      .json({
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
