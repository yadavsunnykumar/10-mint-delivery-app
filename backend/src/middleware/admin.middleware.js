/**
 * Server-side admin authentication middleware.
 * Requires the X-Admin-Key header to match the ADMIN_SECRET env variable.
 * This prevents unauthenticated access to admin endpoints regardless of
 * client-side auth state.
 */
export const requireAdmin = (req, res, next) => {
  const key = req.headers["x-admin-key"];
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    console.error("ADMIN_SECRET is not set in environment");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  if (!key || key !== secret) {
    return res.status(403).json({ error: "Forbidden" });
  }

  return next();
};
