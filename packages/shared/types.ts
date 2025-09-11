export interface Preferences {
    vibe: string;
    budget: string;
    interests: string[];
    group: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    distance: string;
    pace: string;
    dietaryNeeds: string[];
    occasion: string;
    accommodation: string[];
    transportation: string;
    dates: {
        start: string;
        end: string;
    };
}

export interface Activity {
    time: string;
    title: string;
    description: string;
    location: string | { name?: string; address: string };
    category:
    | "Dining"
    | "Entertainment"
    | "Relaxation"
    | "Activity"
    | "Nightlife"
    | "Shopping"
    | "Culture"
    | "History & Heritage"
    | "Nature & Parks"
    | "Special Event"
    | "Outdoor Activities"
    | "Travel"
    | "Spa & Wellness"
    | "Art & Culture"
    | "Live Music"; 
    bookingPartner?: "Zomato" | "BookMyShow" | "Internal";
    travelInfo?: {
        mode: string;
        duration: string;
        distance?: string;
        from?: string;
    };
    isSpecialEvent?: boolean;
    estimatedCost?: string;
}

export interface DayPlan {
    day: string;
    theme: string;
    activities: Activity[];
}

export interface Itinerary {
    title: string;
    totalEstimatedCost?: string;
    itinerary: DayPlan[];
    preferences: Preferences;
    sources?: GroundingMetadataSource[];
}

export interface SavedPlan extends Itinerary {
    _id: string;
    userEmail: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface GroundingMetadataSource {
    uri: string;
    title: string;
    [key: string]: any;
}

export interface ChatMessage {
    role: "user" | "model";
    content: Itinerary | string;
    sources?: GroundingMetadataSource[];
}

export interface User {
    name: string;
    email: string;
}