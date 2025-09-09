import { Itinerary, SavedPlan, User } from "shared/types";

const API_BASE_URL = "/api";

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }));
        throw new Error(errorData.message || "Something went wrong with the request");
    }
    if (response.status === 204) {
        return;
    }
    return response.json();
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