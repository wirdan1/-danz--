import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = 'V-Pedia-jv7pcuzlscb7ymhx';
const API_BASE_URL = 'https://www.v-pedia.web.id';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper function untuk API calls
async function callAPI(endpoint, params = {}) {
  const queryParams = new URLSearchParams({ ...params, apikey: API_KEY }).toString();
  const url = `${API_BASE_URL}${endpoint}?${queryParams}`;
  
  console.log(`Calling API: ${url}`);
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    console.log(`API Response:`, result);
    return result;
  } catch (error) {
    console.error(`Error calling API ${endpoint}:`, error);
    return { success: false, message: 'Gagal terhubung ke server API' };
  }
}

// API Routes
app.get('/api/categories', async (req, res) => {
  console.log('Getting categories...');
  const result = await callAPI('/h2h/categor');
  res.json(result);
});

app.get('/api/providers', async (req, res) => {
  console.log('Getting providers...');
  const result = await callAPI('/h2h/providers');
  res.json(result);
});

app.get('/api/products', async (req, res) => {
  console.log('Getting products with filters:', req.query);
  const params = {};
  if (req.query.category) params.category = req.query.category;
  if (req.query.provider) params.provider = req.query.provider;
  
  const result = await callAPI('/h2h/price-list', params);
  res.json(result);
});

app.post('/api/order', async (req, res) => {
  console.log('Creating order:', req.body);
  const { code, target } = req.body;
  
  if (!code || !target) {
    return res.status(400).json({ 
      success: false, 
      message: 'Code dan target harus diisi' 
    });
  }
  
  const result = await callAPI('/h2h/order/create', { code, target });
  res.json(result);
});

app.get('/api/order/status', async (req, res) => {
  console.log('Checking order status:', req.query.trxid);
  const { trxid } = req.query;
  
  if (!trxid) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID Transaksi harus diisi' 
    });
  }
  
  const result = await callAPI('/h2h/order/check', { trxid });
  res.json(result);
});

app.post('/api/deposit/create', async (req, res) => {
  console.log('Creating deposit:', req.body);
  const { nominal } = req.body;
  
  if (!nominal || nominal < 500) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nominal harus minimal 500' 
    });
  }
  
  const result = await callAPI('/h2h/deposit/create', { nominal });
  res.json(result);
});

app.get('/api/deposit/status', async (req, res) => {
  console.log('Checking deposit status:', req.query.trxid);
  const { trxid } = req.query;
  
  if (!trxid) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID Transaksi harus diisi' 
    });
  }
  
  const result = await callAPI('/h2h/deposit/status', { trxid });
  res.json(result);
});

app.post('/api/deposit/cancel', async (req, res) => {
  console.log('Cancelling deposit:', req.body);
  const { trxid } = req.body;
  
  if (!trxid) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID Transaksi harus diisi' 
    });
  }
  
  const result = await callAPI('/h2h/deposit/cancel', { trxid });
  res.json(result);
});

app.get('/api/history', async (req, res) => {
  console.log('Getting transaction history...');
  const result = await callAPI('/api/mutasi');
  res.json(result);
});

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Terjadi kesalahan server internal' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint tidak ditemukan' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
  console.log(`📱 Buka browser dan akses: http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${API_KEY}`);
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
});
