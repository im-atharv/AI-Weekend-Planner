import { Request, Response, NextFunction } from "express";
import Plan from "../models/Plan.js";

export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userEmail, plan } = req.body;
    if (!userEmail || !plan) {
      return res.status(400).json({ error: "userEmail and plan are required" });
    }
    const normalizedEmail = userEmail.toLowerCase().trim();
    const doc = new Plan({
      userEmail: normalizedEmail,
      ...plan,
    });
    await doc.save();
    return res.status(201).json(doc);
  } catch (err) {
    return next(err);
  }
};

export const getPlansByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const plans = await Plan.find({ userEmail: email }).sort({
      createdAt: -1,
    });
    return res.json(plans);
  } catch (err) {
    return next(err);
  }
};

export const getPlanById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    return res.json(plan);
  } catch (err) {
    return next(err);
  }
};

export const deletePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await Plan.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: "Plan not found" });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ error: "Plan data is required" });
    }

    const updateData = {
      title: plan.title,
      totalEstimatedCost: plan.totalEstimatedCost,
      itinerary: plan.itinerary,
      preferences: plan.preferences,
      sources: plan.sources,
    };

    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    return res.json(updatedPlan);
  } catch (err) {
    return next(err);
  }
};