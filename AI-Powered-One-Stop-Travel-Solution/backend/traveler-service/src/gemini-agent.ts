import axios from 'axios';

export class ItineraryAgent {
  private apiKey: string;

  constructor(apiKey: string) {
    console.log("🔑 Traveler Service API KEY:", apiKey ? "LOADED" : "MISSING");
    this.apiKey = apiKey;
  }

  async generateItinerary(
    destination: string,
    days: number,
    budget: string,
    interests: string
  ) {
    const prompt = `
      Create a detailed ${days}-day travel itinerary for a trip to ${destination}.
      One day should have 3-4 blocks only.
      Budget: ${budget}.
      Interests: ${interests}.

      Respond ONLY with valid JSON:
      {
        "days": [
          {
            "day": 1,
            "title": "Theme of the day",
            "blocks": [
              { "time": "09:00", "activity": "Activity", "location": "Location" }
            ]
          }
        ]
      }
    `;

    try {
      

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

      const cleaned = text.replace(/```json|```/g, "").trim();

      return JSON.parse(cleaned);
    } catch (error) {
      console.error("Gemini generation error:", error);
      throw new Error("Failed to generate itinerary");
    }
  }
}
