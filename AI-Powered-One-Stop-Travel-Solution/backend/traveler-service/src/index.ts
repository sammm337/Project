import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(express.json());

const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://search-service:3007';

// This service acts as a proxy to the traveler agent
// In production, this would call the actual traveler agent service

app.post('/api/traveler/search', async (req, res) => {
  try {
    const { q, filters, mode, userId } = req.body;
    
    // Proxy to search service
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
  try {
    const { userId, mode } = req.body;
    
    // Stub implementation - in production, this would call the traveler agent
    res.json({
      success: true,
      data: {
        recommendations: [],
        message: 'Recommendations feature - integrate with traveler agent'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/traveler/itinerary', async (req, res) => {
  try {
    const { userId, selectionId, nights } = req.body;
    
    // Stub implementation - in production, this would call the traveler agent
    res.json({
      success: true,
      data: {
        itinerary: [],
        message: 'Itinerary feature - integrate with traveler agent'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'traveler-service' });
});

app.listen(PORT, () => {
  console.log(`Traveler service running on port ${PORT}`);
});

