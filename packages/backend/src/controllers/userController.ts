import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
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
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "A user with that email already exists" });
    }

    const user = new User({ name, email });
    await user.save();
    return res.status(201).json(user);
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
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const derivedName = name || normalizedEmail.split("@")[0];
      user = new User({ name: derivedName, email: normalizedEmail });
      await user.save();
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};