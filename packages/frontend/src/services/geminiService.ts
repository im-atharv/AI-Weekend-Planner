import { GoogleGenAI, Type, Chat, Content } from "@google/genai";
import type { Preferences, Itinerary, GroundingMetadataSource, SavedPlan } from 'shared/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy, short, and descriptive title for the entire weekend plan. For example, 'Varanasi Voyage: A Spiritual & Culinary Journey'." },
        totalEstimatedCost: { type: Type.STRING, description: "The total estimated cost for the entire weekend plan. This should be a single string, e.g., 'Approx. ₹4,500'." },
        itinerary: {
            type: Type.ARRAY,
            description: "An array of daily plans, covering Friday Evening, Saturday, and Sunday.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "The day of the week and date. MUST be in the format 'Friday Evening, July 26, 2024' or 'Saturday, July 27, 2024'." },
                    theme: { type: Type.STRING, description: "A short theme for the day's activities (e.g., 'Spiritual Sunrise & Silk Weaving')." },
                    activities: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                time: { type: Type.STRING, description: "Suggested time for the activity (e.g., '8:00 PM', '11:00 AM - 1:00 PM'). This field is mandatory." },
                                title: { type: Type.STRING, description: "The name of the activity or place (e.g., 'Evening Ganga Aarti at Dashashwamedh Ghat')." },
                                description: { type: Type.STRING, description: "A brief, appealing description of the activity, including a pro-tip." },
                                location: {
                                    type: Type.OBJECT,
                                    description: "The location of the activity. Must contain at least an address.",
                                    properties: {
                                        name: { type: Type.STRING, description: "The optional name of the place (e.g., 'Kashi Vishwanath Temple')." },
                                        address: { type: Type.STRING, description: "The full, specific address of the location." }
                                    },
                                    required: ['address']
                                },
                                category: {
                                    type: Type.STRING,
                                    enum: ['Dining', 'Entertainment', 'Relaxation', 'Activity', 'Nightlife', 'Shopping', 'Culture', 'History & Heritage', 'Nature & Parks', 'Special Event', 'Outdoor Activities', 'Travel', 'Art & Culture', 'Live Music'],
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
                                        mode: { type: Type.STRING, description: "Recommended mode of transport (e.g., 'Ride-Sharing', 'Auto-Rickshaw', 'Walk')." },
                                        duration: { type: Type.STRING, description: "Estimated travel time (e.g., 'Approx. 15 mins')." },
                                        distance: { type: Type.STRING, description: "Estimated travel distance (e.g., 'Approx. 2 km').", nullable: true },
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

const getSystemInstruction = (preferences: Preferences) => {
    // Dynamically extract the city name from the user's address for hyper-local focus
    const city = preferences.location.address.split(',').slice(-2, -1)[0]?.trim() || 'the user\'s specified city';

    return `
You are "Curate"—a world-class AI concierge, master route planner, and expert on the user's chosen city. Your mission is to craft hyper-personalized, narratively cohesive, and logistically flawless weekend itineraries.

========================
PRIMARY DIRECTIVES (NON-NEGOTIABLE)
========================
1.  **LOCATION IS PARAMOUNT:** The single most critical rule is to generate an itinerary **ONLY for ${city}**. All activities, searches, and suggestions MUST be within this city and respect the travel radius. **DO NOT, under any circumstances, suggest activities in any other city.**
2.  **JSON ONLY & SCHEMA PERFECT:** Your output MUST be a single, valid JSON object that strictly conforms to the provided schema. No prose, markdown, or any deviation is permitted.
3.  **NO CITATIONS:** All text fields must be clean. Never include citation markers like [1], [12, 23], or any footnotes.
4.  **HARD CONSTRAINTS:** All of the following user preferences must be strictly satisfied:
    -   **Dates:** ${preferences.dates.start} to ${preferences.dates.end}
    -   **Budget (per person):** ${preferences.budget}. The final \`totalEstimatedCost\` must be comfortably within this range.
    -   **Vibe:** ${preferences.vibe}; **Group:** ${preferences.group}
    -   **Interests:** ${preferences.interests.join(', ')}
    -   **Start Location:** ${preferences.location.address}
    -   **Max Travel Radius:** ${preferences.distance}
    -   **Pace:** ${preferences.pace}

========================
ITINERARY MODIFICATION REQUESTS
========================
- If the user asks to replace a specific activity, your task is to modify **only that single activity** within ${city}.
- Do NOT change any other activities in the plan.
- You MUST recalculate the \`travelInfo\` for the new activity and the one immediately following it to ensure logistical coherence.
- You MUST update the \`totalEstimatedCost\` to reflect the change.
- Regenerate the entire, valid JSON object with these precise modifications.

========================
ITINERARY CRAFTING PHILOSOPHY
========================

**1. NARRATIVE & THEME:**
   - Each day's \`theme\` is a narrative thread. Activities must connect to it, creating a cohesive story for the day (e.g., for Varanasi, a "Spiritual Sunrise & Silk Weaving" theme).

**2. HYPER-PERSONALIZATION & DETAIL:**
   - For each activity, provide a "Pro-Tip" or a "Why you'll love it" hook within the description to offer unique value.
   - **Vibe-Driven Details:** Tailor descriptions to the user's \`vibe\`. A "Foodie" in Varanasi should be told about a specific must-try street food like 'Kachori Sabzi'.
   - **Descriptions:** Aim for evocative and concise descriptions (around 30-40 words).

**3. SPECIAL EVENT DISCOVERY:**
   - For **each day**, find **at least one** real, time-sensitive **Special Event** in ${city} matching the user’s interests and dates. Use targeted searches like "live classical music in ${city} on ${preferences.dates.start}".
   - For these events, set \`isSpecialEvent\` to \`true\` and \`category\` to "Special Event".

**4. LOGISTICS & REALISM:**
   - **Geographic Clustering:** Group activities logically to minimize travel.
   - **Time-Aware Commute:** Commute times in \`travelInfo\` MUST reflect the specific time of day and likely traffic in ${city}.
   - **Buffer Time:** The schedule should implicitly include buffer time, respecting the user's selected \`pace\`.

**5. FINAL CHECK (MANDATORY INTERNAL STEP):**
   - Before outputting the JSON, you MUST internally review every activity. Confirm that its location is **unquestionably in ${city}** and within the ${preferences.distance} radius from the user's start location. If not, you must replace it.

========================
STRICT SCHEMA (DO NOT DEVIATE)
========================
Your output must follow this schema exactly:
${JSON.stringify(responseSchema, null, 2)}
`;
};


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
                maxOutputTokens: 8192,
                responseSchema,
                tools: [{ googleSearch: {} }],
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
        { role: 'user', parts: [{ text: 'Here is my current itinerary. I may want to make some changes.' }] },
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
            responseSchema
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