import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { verifyGoogleToken } from "../services/authService.js";

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id_token } = req.body;
    if (!id_token) {
      return res.status(400).json({ error: "ID token is required" });
    }
    const payload = await verifyGoogleToken(id_token);

    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google token" });
    }
    const normalizedEmail = payload.email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = new User({
        name: payload.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
      });
      await user.save();
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ error: "Please provide a valid email" });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "A user with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email: normalizedEmail, passwordHash });
    await user.save();
    // Do not expose passwordHash
    return res.status(201).json({ name: user.name, email: user.email });
  } catch (err) {
    return next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ error: "Please provide a valid email" });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User
      .findOne({ email: normalizedEmail })
      .select("+passwordHash");

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!user.passwordHash) {
      return res
        .status(400)
        .json({ error: "This account uses Google Sign-In. Use Google to login." });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    return res.json({ name: user.name, email: user.email });
  } catch (err) {
    return next(err);
  }
};