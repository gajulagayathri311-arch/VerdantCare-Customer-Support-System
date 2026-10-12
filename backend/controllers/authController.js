
import { getPool } from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters."
      });
    }

    const pool = getPool();
    const cleanEmail = email.trim().toLowerCase();

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    const avatar = name.trim()
      .split(/\s+/)
      .map(part => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CU";

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, avatar)
       VALUES (?, ?, ?, 'CUSTOMER', ?)`,
      [name.trim(), cleanEmail, hashedPassword, avatar]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      role: "CUSTOMER",
      avatar
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    res.status(500).json({
      message: "Failed to register user."
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from backend/.env");
      return res.status(500).json({
        message: "Server authentication configuration is missing."
      });
    }

    const pool = getPool();

    const [rows] = await pool.query(
      `SELECT id, name, email, password, role, avatar
       FROM users WHERE email = ? LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const user = rows[0];
    let passwordMatches = false;

    if (user.password.startsWith("$2")) {
      passwordMatches = await bcrypt.compare(
        password,
        user.password
      );
    } else {
      passwordMatches = user.password === password;

      if (passwordMatches) {
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, user.id]
        );
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Failed to login."
    });
  }
}
