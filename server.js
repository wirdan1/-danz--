require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// V-Pedia API configuration
const VPEDIA_API_URL = 'https://www.v-pedia.web.id';
const VPEDIA_API_KEY = process.env.VPEDIA_API_KEY || 'V-Pedia-jv7pcuzlscb7ymhx';

// Proxy endpoints to V-Pedia API
app.get('/api/categories', async (req, res) => {
  try {
    const response = await axios.get(`${VPEDIA_API_URL}/h2h/categor?apikey=${VPEDIA_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

app.get('/api/providers', async (req, res) => {
  try {
    const response = await axios.get(`${VPEDIA_API_URL}/h2h/providers?apikey=${VPEDIA_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch providers' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, provider } = req.query;
    let url = `${VPEDIA_API_URL}/h2h/price-list?apikey=${VPEDIA_API_KEY}`;
    
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (provider) url += `&provider=${encodeURIComponent(provider)}`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

app.post('/api/order', async (req, res) => {
  try {
    const { code, target } = req.body;
    const response = await axios.get(`${VPEDIA_API_URL}/h2h/order/create?code=${code}&target=${target}&apikey=${VPEDIA_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

app.get('/api/order/status', async (req, res) => {
  try {
    const { trxid } = req.query;
    const response = await axios.get(`${VPEDIA_API_URL}/h2h/order/check?trxid=${trxid}&apikey=${VPEDIA_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error checking order status:', error);
    res.status(500).json({ success: false, message: 'Failed to check order status' });
  }
});

app.post('/api/deposit', async (req, res) => {
  try {
    const { nominal } = req.body;
    const response = await axios.get(`${VPEDIA_API_URL}/h2h/deposit/create?nominal=${nominal}&apikey=${VPEDIA_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating deposit:', error);
    res.status(500).json({ success: false, message: 'Failed to create deposit' });
  }
});

app.get('/api/deposit/status', async (req, res) => {
  try {
    const { trxid } = req.query;
    const response = await axios.get(`${VPEDIA_API_URL}/h2h/deposit/status?trxid=${trxid}&apikey=${VPEDIA_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error checking deposit status:', error);
    res.status(500).json({ success: false, message: 'Failed to check deposit status' });
  }
});

app.post('/api/deposit/cancel', async (req, res) => {
  try {
    const { trxid } = req.body;
    const response = await axios.get(`${VPEDIA_API_URL}/h2h/deposit/cancel?trxid=${trxid}&apikey=${VPEDIA_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error canceling deposit:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel deposit' });
  }
});

app.get('/api/mutasi', async (req, res) => {
  try {
    const response = await axios.get(`${VPEDIA_API_URL}/api/mutasi?apikey=${VPEDIA_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transaction history' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
