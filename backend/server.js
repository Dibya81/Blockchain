// backend/server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('🚀 Stellar Balance Checker Backend is Running!');
});

// GET route for frontend
app.get('/balance/:address', async (req, res) => {
  try {
    const address = req.params.address;
    const horizonURL = req.query.network || 'https://horizon-testnet.stellar.org';

    if (!address) {
      return res.status(400).json({ error: 'Missing Stellar public key' });
    }

    // Validate address format
    if (!/^G[A-Z2-7]{55}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Stellar public key' });
    }

    // Fetch account data from Horizon
    const response = await fetch(`${horizonURL}/accounts/${address}`);

    if (response.status === 404) {
      return res.status(404).json({ error: 'Account not found or not funded' });
    }

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();

    const balances = data.balances.map(b => ({
      asset: b.asset_type === 'native' ? 'XLM' : b.asset_code,
      issuer: b.asset_issuer || 'Stellar Network',
      balance: b.balance,
    }));

    res.json({
      account_id: data.account_id,
      sequence: data.sequence,
      balances,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 5001;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
