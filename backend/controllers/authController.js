import { getPool } from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const DEFAULT_JWT_SECRET = "verdantcare_customer_support_jwt_secret_key_2026_xyz";

function generateToken(payload) {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export async function register(req, res) {
  try {
    const { name, email, password, role = "CUSTOMER" } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Full name, email address, and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters."
      });
    }

    const pool = getPool();
    const cleanEmail = email.trim().toLowerCase();

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1;",
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "This email address is already registered. Please sign in."
      });
    }

    const avatar = name.trim()
      .split(/\s+/)
      .map(part => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CU";

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === "ADMIN" ? "ADMIN" : "CUSTOMER";

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, avatar)
       VALUES (?, ?, ?, ?, ?);`,
      [name.trim(), cleanEmail, hashedPassword, assignedRole, avatar]
    );

    const userObj = {
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole,
      avatar
    };

    // Generate JWT token so newly registered users are logged in immediately without 401 error
    const token = generateToken({
      id: userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role
    });

    res.status(201).json({
      token,
      user: userObj
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    res.status(500).json({
      message: "Failed to register user. Please try again."
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email address and password are required."
      });
    }

    const pool = getPool();
    const cleanEmail = email.trim().toLowerCase();

    const [rows] = await pool.query(
      `SELECT id, name, email, password, role, avatar
       FROM users WHERE email = ? LIMIT 1;`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const user = rows[0];
    let passwordMatches = false;

    if (user.password.startsWith("$2")) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      // Plain text check & auto-upgrade to bcrypt hash
      passwordMatches = user.password === password;

      if (passwordMatches) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          "UPDATE users SET password = ? WHERE id = ?;",
          [hashedPassword, user.id]
        );
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    const token = generateToken({
      id: userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role
    });

    res.json({
      token,
      user: userObj
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Failed to login. Please try again."
    });
  }
}
