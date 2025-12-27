
import { GoogleGenAI, Type } from "@google/genai";
import { Channel } from "../types";

export const getAIRecommendations = async (channels: Channel[], userMood?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const channelList = channels.map(c => `ID: ${c.id}, Name: ${c.name}, Category: ${c.category}`).join('\n');
  
  const prompt = `
    Based on the following IPTV channel list:
    ${channelList}
    
    ${userMood ? `The user says they are feeling: "${userMood}".` : "Provide 3 random but interesting channel recommendations for the user."}
    
    Return 3 recommendations as a JSON array. Each recommendation must include the channel ID and a short catchy reason why they should watch it.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["id", "reason"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const parseM3UWithAI = async (m3uContent: string) => {
    // This is a complex task, usually we do basic regex, 
    // but we can use AI to clean up messy names and categories.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
        Parse this snippet of an M3U IPTV list and return a clean JSON array of channels.
        M3U Content:
        ${m3uContent.slice(0, 2000)}...
        
        Focus on extracting: channel name, logo URL (if available), category (group-title), and stream URL.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            logo: { type: Type.STRING },
                            category: { type: Type.STRING },
                            url: { type: Type.STRING }
                        },
                        required: ["name", "url"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Gemini Parsing Error:", error);
        return [];
    }
};
