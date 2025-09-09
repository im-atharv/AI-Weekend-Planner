import { GoogleGenAI, Type, Chat, Content } from "@google/genai";
import type { Preferences, Itinerary, GroundingMetadataSource, SavedPlan } from 'shared/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy, short, and descriptive title for the entire weekend plan. For example, 'Gurugram Getaway: Culture, Cuisine & Nightlife'." },
        totalEstimatedCost: { type: Type.STRING, description: "The total estimated cost for the entire weekend plan. This should be a single string, e.g., 'Approx. ₹4,500'." },
        itinerary: {
            type: Type.ARRAY,
            description: "An array of daily plans, covering Friday Evening, Saturday, and Sunday.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "The day of the week and date. MUST be in the format 'Friday Evening, July 26, 2024' or 'Saturday, July 27, 2024'." },
                    theme: { type: Type.STRING, description: "A short theme for the day's activities (e.g., 'Vibrant Nightlife & Fine Dining')." },
                    activities: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                time: { type: Type.STRING, description: "Suggested time for the activity (e.g., '8:00 PM', '11:00 AM - 1:00 PM'). This field is mandatory." },
                                title: { type: Type.STRING, description: "The name of the activity or place (e.g., 'Dinner at The Corner Bistro')." },
                                description: { type: Type.STRING, description: "A brief, appealing description of the activity." },
                                location: {
                                    type: Type.OBJECT,
                                    description: "The location of the activity. Must contain at least an address.",
                                    properties: {
                                        name: { type: Type.STRING, description: "The optional name of the place (e.g., 'Spectra Restaurant')." },
                                        address: { type: Type.STRING, description: "The full, specific address of the location." }
                                    },
                                    required: ['address']
                                },
                                category: {
                                    type: Type.STRING,
                                    enum: ['Dining', 'Entertainment', 'Relaxation', 'Activity', 'Nightlife', 'Shopping', 'Culture', 'History & Heritage', 'Nature & Parks', 'Special Event', 'Outdoor Activities', 'Travel'],
                                    description: "The category of the activity. Use 'Special Event' for time-sensitive events you discover."
                                },
                                estimatedCost: { type: Type.STRING, description: "An estimated cost for this specific activity (e.g., 'Approx. ₹1200', 'Free'). This field is mandatory." },
                                isSpecialEvent: {
                                    type: Type.BOOLEAN,
                                    description: "Set to true if this is a specific, date-sensitive event (like a concert, festival, or exhibition) you discovered."
                                },
                                bookingPartner: {
                                    type: Type.STRING,
                                    enum: ['Zomato', 'BookMyShow', 'Internal'],
                                    description: "Suggested booking partner, if applicable.",
                                    nullable: true,
                                },
                                travelInfo: {
                                    type: Type.OBJECT,
                                    description: "Details on the travel from the previous location to this activity. For the first activity of the day, this is from the user's home.",
                                    properties: {
                                        mode: { type: Type.STRING, description: "Recommended mode of transport (e.g., 'Ride-Sharing', 'Metro', 'Walk')." },
                                        duration: { type: Type.STRING, description: "Estimated travel time (e.g., 'Approx. 15 mins')." },
                                        distance: { type: Type.STRING, description: "Estimated travel distance (e.g., 'Approx. 5 km').", nullable: true },
                                        from: { type: Type.STRING, description: "The starting point of the travel leg.", nullable: true },
                                    },
                                    required: ['mode', 'duration']
                                },
                            },
                            required: ['time', 'title', 'description', 'location', 'category', 'estimatedCost', 'isSpecialEvent', 'travelInfo']
                        }
                    }
                },
                required: ['day', 'theme', 'activities']
            }
        }
    },
    required: ['title', 'totalEstimatedCost', 'itinerary']
};

const cleanJsonText = (text: string) => {
    if (!text || typeof text.indexOf !== 'function') {
        console.error("Received invalid text input for JSON cleaning:", text);
        throw new Error("Received no response from the AI architect.");
    }

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
        console.error("Failed to find a valid JSON object in the text.", { text });
        throw new Error("Received malformed JSON from the AI architect.");
    }

    let jsonString = text.substring(jsonStart, jsonEnd + 1);
    jsonString = jsonString.replace(/[\n\r]/g, ' ');

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON string:", e);
        console.error("Original text from AI:", text);
        throw new Error("Received malformed JSON from the AI architect.");
    }
}

const removeCitations = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => removeCitations(item));
    }

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value === 'string') {
                newObj[key] = value.replace(/\s*\[\d+(,\s*\d+)*\]\s*/g, '').trim();
            } else {
                newObj[key] = removeCitations(value);
            }
        }
    }
    return newObj;
};


const getSystemInstruction = (preferences: Preferences) => `
You are 'Curate', a premium AI concierge, expert route planner, and local event scout specializing in creating hyper-personalized weekend itineraries. Your tone is sophisticated, helpful, and concise.

**CRITICAL RULE: Your final output must be a single, complete, and uninterrupted JSON object.**
**CRITICAL RULE: Under NO circumstances should you include citation markers like [15] or [11, 22] in any of the text fields.**

**Budget and Costing - THIS IS CRITICAL:**
- The user has specified a budget range: **${preferences.budget}**.
- Your \`totalEstimatedCost\` MUST fall within this range.
- Every activity MUST have an \`estimatedCost\`.
- You MUST calculate a \`totalEstimatedCost\` for the entire itinerary.

**Core Task: Date-Aware Event Discovery - THIS IS YOUR MOST IMPORTANT FUNCTION.**
- You MUST use your Google Search tool to find real, specific, time-sensitive events (concerts, festivals, workshops, etc.) happening in the user's city on the specified dates: ${preferences.dates.start} to ${preferences.dates.end}.
- If you find a matching event, you MUST integrate it, set \`isSpecialEvent\` to \`true\`, and the category to \`Special Event\`.

**Routing and Logistics - THIS IS CRITICAL:**
- The user's home base is: ${preferences.location.address}.
- Plan activity sequences logically to minimize travel.
- For EACH activity, include a \`travelInfo\` object from the PREVIOUS location. For the first activity of the day, the journey is from the user's home base.
- Use common sense for \`travelInfo.mode\`. Suggest 'Walk' for short distances (under 1 km), even if the user's preference is different.

**Itinerary Structure - THIS IS CRITICAL:**
- You MUST generate a catchy \`title\`.
- Every activity object MUST have a 'time' property.
- The itinerary must cover Friday evening, Saturday, and Sunday.
- The \`day\` property MUST be a string with the day of the week and full date (e.g., 'Friday Evening, September 12, 2025').

**Output Format - THIS IS CRITICAL:**
- Your output MUST ALWAYS be a single, valid JSON object conforming to the schema. No introductory text or markdown.
- For follow-up requests, provide a new, complete JSON object representing the *fully updated* itinerary.

**REQUIRED JSON OUTPUT SCHEMA:**
${JSON.stringify(responseSchema, null, 2)}

User Preferences for this session:
- Dates: ${preferences.dates.start} to ${preferences.dates.end}
- Vibe: ${preferences.vibe}
- Budget: ${preferences.budget}
- Interests: ${preferences.interests.join(', ')}
- Group type: ${preferences.group}
- User's Location: ${preferences.location.address} (Lat: ${preferences.location.latitude}, Lng: ${preferences.location.longitude})
`;

/**
 * Creates a new chat session from scratch for a new plan.
 */
export const startItineraryChat = async (preferences: Preferences): Promise<{ chat: Chat, initialItinerary: Itinerary }> => {
    try {
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: getSystemInstruction(preferences),
                temperature: 0.2,
                tools: [{ googleSearch: {} }],
                maxOutputTokens: 16384,
            },
        });

        const response = await chat.sendMessage({
            message: "Please generate the initial itinerary based on my preferences.",
        });

        const text = response.text;
        if (!text) {
            console.error("Gemini API returned an empty text response.", { response });
            const finishReason = response.candidates?.[0]?.finishReason;
            if (finishReason && finishReason !== 'STOP') {
                throw new Error(`The AI's response was blocked due to: ${finishReason}.`);
            }
            throw new Error("The AI architect provided an empty response.");
        }

        const parsedData = cleanJsonText(text);
        const cleanedData = removeCitations(parsedData);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web) as GroundingMetadataSource[] || [];

        const initialItinerary = {
            ...cleanedData,
            preferences: preferences,
            sources: sources.filter(s => s && s.uri)
        } as Itinerary;

        return { chat, initialItinerary };

    } catch (error) {
        console.error("Error starting chat from Gemini API:", error);
        throw error;
    }
};

/**
 * Initializes a chat session from a plan that has already been created.
 */
export const initializeChatFromPlan = (plan: Itinerary | SavedPlan, history?: Content[]): Chat => {
    const chatHistory: Content[] = history || [
        { role: 'model', parts: [{ text: JSON.stringify(plan) }] }
    ];

    return ai.chats.create({
        model: "gemini-2.5-flash",
        history: chatHistory,
        config: {
            systemInstruction: getSystemInstruction(plan.preferences),
            temperature: 0.2,
            tools: [{ googleSearch: {} }],
            maxOutputTokens: 16384,
        },
    });
};

/**
 * Continues an existing chat session with a new user message.
 */
export const continueItineraryChat = async (chat: Chat, message: string, preferences: Preferences): Promise<{ updatedItinerary: Itinerary }> => {
    try {
        const response = await chat.sendMessage({
            message: message,
        });

        const text = response.text;
        if (!text) {
            console.error("Gemini API returned an empty text response during chat.", { response });
            const finishReason = response.candidates?.[0]?.finishReason;
            if (finishReason && finishReason !== 'STOP') {
                throw new Error(`The AI's response was blocked due to: ${finishReason}.`);
            }
            throw new Error("The AI architect provided an empty response.");
        }

        const parsedData = cleanJsonText(text);
        const cleanedData = removeCitations(parsedData);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web) as GroundingMetadataSource[] || [];

        const updatedItinerary = {
            ...cleanedData,
            preferences: preferences,
            sources: sources.filter(s => s && s.uri)
        } as Itinerary;

        return { updatedItinerary };

    } catch (error) {
        console.error("Error continuing chat from Gemini API:", error);
        throw error;
    }
};