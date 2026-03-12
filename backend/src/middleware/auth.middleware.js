import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "JWT_SECRET is not configured" });
    }

    const payload = jwt.verify(token, secret);
    req.user = { user_id: payload.user_id };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
