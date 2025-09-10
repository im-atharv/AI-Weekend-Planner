import { Schema, model } from "mongoose";
import { SavedPlan } from "../../shared/types";

const ActivitySchema = new Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    name: { type: String },
    address: { type: String, required: true },
  },
  category: {
    type: String,
    enum: [
      'Dining',
      'Entertainment',
      'Relaxation',
      'Activity',
      'Nightlife',
      'Shopping',
      'Culture',
      'History & Heritage',
      'Nature & Parks',
      'Special Event',
      'Outdoor Activities',
      'Travel',
      'Spa & Wellness',
      'Art & Culture',
      'Live Music',
    ],
    required: true,
  },
  estimatedCost: { type: String, required: true },
  isSpecialEvent: { type: Boolean, default: false },
  bookingPartner: {
    type: String,
    enum: ['Zomato', 'BookMyShow', 'Internal', null],
    default: null,
  },
  travelInfo: {
    mode: { type: String },
    duration: { type: String },
    distance: { type: String },
    from: { type: String },
  },
});

const DayPlanSchema = new Schema({
  day: { type: String, required: true },
  theme: { type: String },
  activities: [ActivitySchema],
});

const PreferencesSchema = new Schema({
  vibe: String,
  budget: String,
  interests: [String],
  group: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  distance: String,
  pace: String,
  dietaryNeeds: [String],
  occasion: String,
  accommodation: [String],
  transportation: String,
  dates: {
    start: String,
    end: String,
  },
});

const PlanSchema = new Schema<SavedPlan>(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String },
    totalEstimatedCost: { type: String },
    itinerary: [DayPlanSchema],
    preferences: PreferencesSchema,
    sources: [Object],
  },
  {
    timestamps: true,
  }
);

export default model<SavedPlan>("Plan", PlanSchema);