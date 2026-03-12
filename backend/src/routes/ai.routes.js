import express from "express";
import axios from "axios";
const router = express.Router();

const AI_URL = process.env.AI_URL || "http://localhost:8000";

router.get("/test-ai", async (req, res) => {
  try {
    const response = await axios.get(`${AI_URL}/`);
    res.json(response.data);
  } catch (err) {
    console.error("AI test route error:", err.message);
    res.status(502).json({ error: "AI service is unavailable" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`${AI_URL}/search`, { params: { q } });
    res.json(response.data);
  } catch (err) {
    console.error("AI search route error:", err.message);
    res.status(502).json({ error: "Search service is unavailable" });
  }
});

router.get("/recommend/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const response = await axios.get(`${AI_URL}/recommend/${user_id}`);
    res.json(response.data);
  } catch (err) {
    console.error("AI recommend route error:", err.message);
    res.status(502).json({ error: "Recommendation service is unavailable" });
  }
});

router.post("/predict-eta", async (req, res) => {
  try {
    const response = await axios.post(`${AI_URL}/predict-eta`, req.body);

    res.json(response.data);
  } catch (err) {
    console.error("AI ETA route error:", err.message);
    res.status(502).json({ error: "ETA prediction failed" });
  }
});

export default router;
