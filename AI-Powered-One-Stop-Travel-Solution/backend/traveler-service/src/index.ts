import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { ItineraryAgent } from './gemini-agent';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(express.json());

const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://search-service:3007';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let agent: ItineraryAgent | null = null;
if (GEMINI_API_KEY) {
  agent = new ItineraryAgent(GEMINI_API_KEY);
} else {
  console.warn('GEMINI_API_KEY is not set. Itinerary generation will fail.');
}

app.post('/api/traveler/search', async (req, res) => {
  try {
    const { q, filters, mode } = req.body;
    const response = await axios.post(`${SEARCH_SERVICE_URL}/search/semantic`, {
      q,
      filters,
      mode
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/traveler/recommend', async (req, res) => {
  res.json({
    success: true,
    data: { recommendations: [], message: 'Recommendations feature coming soon' }
  });
});

app.post('/api/traveler/itinerary', async (req, res) => {
  try {
    console.log("📥 Received itinerary request:", req.body); 
    const { destination, days, budget, interests } = req.body;

    if (!agent) {
      return res.status(503).json({ success: false, error: 'AI Agent not configured (Missing API Key)' });
    }

    if (!destination || !days) {
      return res.status(400).json({ success: false, error: 'Destination and number of days are required' });
    }

    const itinerary = await agent.generateItinerary(destination, Number(days), budget || 'Moderate', interests || 'General sightseeing');

    res.json({
      success: true,
      days: itinerary.days
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to generate itinerary' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'traveler-service' });
});

app.listen(PORT, () => {
  console.log(`Traveler service running on port ${PORT}`);
});