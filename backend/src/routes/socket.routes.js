import express from "express";

const router = express.Router();

router.post("/send", async (req, res) => {
    const { event, data } = req.body;

    const io = req.app.get("io");
    if (io) {
        io.emit(event, data);
    }

    return res.json({ success: true });
});

export default router;