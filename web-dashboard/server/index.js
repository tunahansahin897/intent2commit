const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data generator (would integrate with real Intent2Commit data)
const generateMockData = () => {
  return {
    projectName: 'Intent2Commit Demo',
    totalCommits: 156,
    avgAlignment: 82,
    excellentRate: 45,
    activeDevs: 8,
    alignmentDistribution: {
      excellent: 45,
      good: 30,
      fair: 15,
      poor: 10
    },
    recentIntents: [
      {
        id: '1',
        message: 'Optimize database queries',
        author: 'Developer A',
        score: 95,
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: '2',
        message: 'Fix memory leak in auth',
        author: 'Developer B',
        score: 78,
        timestamp: new Date(Date.now() - 5 * 3600000).toISOString()
      }
    ],
    trends: Array.from({ length: 30 }, (_, i) => ({
      day: i,
      score: 70 + Math.random() * 20,
      commits: Math.floor(Math.random() * 10)
    }))
  };
};

// API Routes
app.get('/api/stats', (req, res) => {
  res.json(generateMockData());
});

app.get('/api/intents', (req, res) => {
  // Would read from actual .intent-ledger
  res.json({
    intents: generateMockData().recentIntents
  });
});

app.get('/api/alignment/:intentId', (req, res) => {
  res.json({
    intentId: req.params.intentId,
    score: 85,
    status: 'excellent',
    breakdown: {
      intentClarity: 90,
      fileScope: 85,
      codeVolume: 80,
      riskPatterns: -5
    }
  });
});

app.listen(PORT, () => {
  console.log(`Intent2Commit Dashboard API running on http://localhost:${PORT}`);
});
