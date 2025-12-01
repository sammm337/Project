import { GoogleGenerativeAI } from '@google/generative-ai';

export class ItineraryAgent {
  private model;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateItinerary(destination: string, days: number, budget: string, interests: string) {
    const prompt = `
      Create a detailed ${days}-day travel itinerary for a trip to ${destination}.
      Budget: ${budget}.
      Interests: ${interests}.
      
      Return ONLY a valid JSON object with the following structure, no markdown formatting or backticks:
      {
        "days": [
          {
            "day": 1,
            "title": "Theme of the day",
            "blocks": [
              {
                "time": "09:00 AM",
                "activity": "Activity description",
                "location": "Location name"
              }
            ]
          }
        ]
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up potential markdown code blocks if Gemini adds them
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new Error('Failed to generate itinerary');
    }
  }
}