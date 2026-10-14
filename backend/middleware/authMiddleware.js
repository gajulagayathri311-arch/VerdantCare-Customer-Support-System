import jwt from "jsonwebtoken";

const DEFAULT_JWT_SECRET = "verdantcare_customer_support_jwt_secret_key_2026_xyz";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required. Please log in.",
      code: "AUTH_REQUIRED"
    });
  }

  // Support demo convenience tokens if used during local/demo testing
  if (token === "demo_customer_token") {
    req.user = {
      id: 101,
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com",
      role: "CUSTOMER"
    };
    return next();
  }

  if (token === "demo_admin_token") {
    req.user = {
      id: 201,
      name: "Alex Mercer",
      email: "alex.mercer@verdantcare.com",
      role: "ADMIN"
    };
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.warn("JWT Verification failed:", error.message);
    return res.status(401).json({
      message: "Invalid or expired session token. Please log in again.",
      code: "TOKEN_EXPIRED"
    });
  }
}
