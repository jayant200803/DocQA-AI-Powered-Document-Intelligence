// Guards internal service-to-service routes (the AI service's progress/status
// callbacks). These write to the database without a user token, so they must
// carry a shared secret that only the backend and AI service know.
export const internalAuth = (req, res, next) => {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret || req.headers['x-internal-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
};
