const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

// API Configuration
const API_BASE_URL = "https://www.v-pedia.web.id"
const API_KEY = "V-Pedia-jv7pcuzlscb7ymhx"

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Helper function to make API requests
async function makeApiRequest(endpoint, params = {}) {
  try {
    const url = new URL(endpoint, API_BASE_URL)
    url.searchParams.append("apikey", API_KEY)

    // Add additional parameters
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        url.searchParams.append(key, params[key])
      }
    })

    console.log("Making request to:", url.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("API Response:", data)
    return data
  } catch (error) {
    console.error("API Request Error:", error)
    return {
      success: false,
      message: error.message || "Internal server error",
      data: [],
    }
  }
}

// Routes

// Get categories
app.get("/api/categories", async (req, res) => {
  const data = await makeApiRequest("/h2h/categor")
  res.json(data)
})

// Get providers
app.get("/api/providers", async (req, res) => {
  const data = await makeApiRequest("/h2h/providers")
  res.json(data)
})

// Get products
app.get("/api/products", async (req, res) => {
  const { category, provider } = req.query
  const params = {}

  if (category && category !== "Semua Kategori") {
    params.category = category
  }
  if (provider && provider !== "Semua Provider") {
    params.provider = provider
  }

  const data = await makeApiRequest("/h2h/price-list", params)
  res.json(data)
})

// Create order
app.post("/api/order/create", async (req, res) => {
  const { code, target } = req.body

  if (!code || !target) {
    return res.status(400).json({
      success: false,
      message: "Code dan target harus diisi",
    })
  }

  try {
    const url = new URL("/h2h/order/create", API_BASE_URL)
    url.searchParams.append("code", code)
    url.searchParams.append("target", target)
    url.searchParams.append("apikey", API_KEY)

    console.log("Creating order:", url.toString())

    const response = await fetch(url.toString())
    const data = await response.json()

    console.log("Order response:", data)
    res.json(data)
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

// Check order status
app.get("/api/order/check", async (req, res) => {
  const { trxid } = req.query

  if (!trxid) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID harus diisi",
    })
  }

  const data = await makeApiRequest("/h2h/order/check", { trxid })
  res.json(data)
})

// Create deposit
app.post("/api/deposit/create", async (req, res) => {
  const { nominal } = req.body

  if (!nominal || nominal < 500) {
    return res.status(400).json({
      success: false,
      message: "Nominal minimal Rp 500",
    })
  }

  const data = await makeApiRequest("/h2h/deposit/create", { nominal })
  res.json(data)
})

// Check deposit status
app.get("/api/deposit/status", async (req, res) => {
  const { trxid } = req.query

  if (!trxid) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID harus diisi",
    })
  }

  const data = await makeApiRequest("/h2h/deposit/status", { trxid })
  res.json(data)
})

// Cancel deposit
app.post("/api/deposit/cancel", async (req, res) => {
  const { trxid } = req.body

  if (!trxid) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID harus diisi",
    })
  }

  const data = await makeApiRequest("/h2h/deposit/cancel", { trxid })
  res.json(data)
})

// Get transaction history
app.get("/api/mutasi", async (req, res) => {
  const data = await makeApiRequest("/api/mutasi")
  res.json(data)
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    port: PORT,
  })
})

// Serve HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "Something went wrong!" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API Base URL: ${API_BASE_URL}`)
  console.log(`API Key: ${API_KEY}`)
})
