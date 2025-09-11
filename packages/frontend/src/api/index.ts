import { Itinerary, SavedPlan, User } from "shared/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const handleResponse = async (response: Response) => {
  const ct = response.headers.get("content-type") || "";
  if (response.status === 204) return;
  const parseJson = async () => {
    try { return await response.json(); } catch { return null; }
  };
  const parseText = async () => {
    try { return await response.text(); } catch { return ""; }
  };

  const payload = ct.includes("application/json") ? await parseJson() : await parseText();

  if (!response.ok) {
    const msg =
      (payload && typeof payload === "object" && (payload.message || payload.error || payload.msg)) ||
      (typeof payload === "string" && payload) ||
      "Something went wrong with the request";
    throw new Error(msg);
  }
  return ct.includes("application/json") ? payload : { data: payload };
};

export const getSavedPlans = (userEmail: string): Promise<SavedPlan[]> => {
    return fetch(`${API_BASE_URL}/plans/${encodeURIComponent(userEmail)}`).then(handleResponse);
};

export const getPlanById = (planId: string): Promise<SavedPlan> => {
    return fetch(`${API_BASE_URL}/plans/plan/${planId}`).then(handleResponse);
};

export const savePlan = (userEmail: string, plan: Itinerary): Promise<SavedPlan> => {
    return fetch(`${API_BASE_URL}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, plan }),
    }).then(handleResponse);
};

export const updatePlan = (planId: string, plan: Itinerary): Promise<SavedPlan> => {
    return fetch(`${API_BASE_URL}/plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
    }).then(handleResponse);
};

export const deletePlan = (planId: string): Promise<void> => {
    return fetch(`${API_BASE_URL}/plans/${planId}`, {
        method: "DELETE",
    }).then(handleResponse);
};

export const googleLogin = (id_token: string): Promise<User> => {
    return fetch(`${API_BASE_URL}/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token }),
    }).then(handleResponse);
};

export const emailRegister = (name: string, email: string, password: string): Promise<User> => {
    return fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    }).then(handleResponse);
};

export const emailLogin = (email: string, password: string): Promise<User> => {
    return fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    }).then(handleResponse);
};
