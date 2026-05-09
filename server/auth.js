const jwt = require("jsonwebtoken");

function makeAuthMiddleware({ jwtSecret }) {
  return function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    try {
      const payload = jwt.verify(token, jwtSecret);
      req.user = { id: payload.sub, email: payload.email };
      return next();
    } catch {
      return res.status(401).json({ error: "Invalid auth token" });
    }
  };
}

module.exports = { makeAuthMiddleware };

