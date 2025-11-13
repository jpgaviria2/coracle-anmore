import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const DOMAIN = process.env.DOMAIN || 'anmore.me'
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'change-this-in-production'
const DATA_DIR = path.resolve(__dirname, process.env.DATA_DIR || './data')

const NOSTR_JSON_PATH = path.join(DATA_DIR, 'nostr.json')
const PENDING_JSON_PATH = path.join(DATA_DIR, 'pending.json')

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
  
  // Initialize files if they don't exist
  try {
    await fs.access(NOSTR_JSON_PATH)
  } catch {
    await fs.writeFile(NOSTR_JSON_PATH, JSON.stringify({ names: {} }, null, 2))
  }
  
  try {
    await fs.access(PENDING_JSON_PATH)
  } catch {
    await fs.writeFile(PENDING_JSON_PATH, JSON.stringify([], null, 2))
  }
}

// Helper functions
async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    throw error
  }
}

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
    throw error
  }
}

function validateUsername(username) {
  // Username should be lowercase alphanumeric, underscore, or hyphen
  // Length between 1 and 64 characters
  if (!username || typeof username !== 'string') {
    return false
  }
  const usernameRegex = /^[a-z0-9_-]{1,64}$/
  return usernameRegex.test(username)
}

function validatePubkey(pubkey) {
  // Pubkey should be 64 character hex string
  if (!pubkey || typeof pubkey !== 'string') {
    return false
  }
  const hexRegex = /^[0-9a-f]{64}$/i
  return hexRegex.test(pubkey)
}

function validateApiKey(req) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return false
  }
  
  // Support both "Bearer <key>" and direct key
  const key = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader
  
  return key === ADMIN_API_KEY
}

// Public Endpoints

// Serve .well-known/nostr.json
app.get('/.well-known/nostr.json', async (req, res) => {
  try {
    const data = await readJsonFile(NOSTR_JSON_PATH)
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=300') // Cache for 5 minutes
    
    res.json(data)
  } catch (error) {
    console.error('Error serving nostr.json:', error)
    res.status(500).json({ error: 'Failed to serve NIP-05 mapping' })
  }
})

// Register new NIP-05 request
app.post('/api/register', async (req, res) => {
  try {
    const { username, pubkey, domain } = req.body
    
    // Validation
    if (!username || !pubkey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and pubkey are required' 
      })
    }
    
    if (!validateUsername(username)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid username format. Username must be 1-64 characters, lowercase alphanumeric, underscore, or hyphen only.' 
      })
    }
    
    if (!validatePubkey(pubkey)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid pubkey format. Pubkey must be a 64-character hexadecimal string.' 
      })
    }
    
    // Normalize pubkey to lowercase
    const normalizedPubkey = pubkey.toLowerCase()
    
    // Check if username already exists in active registrations
    const nostrData = await readJsonFile(NOSTR_JSON_PATH)
    if (nostrData.names && nostrData.names[username]) {
      return res.status(409).json({ 
        success: false, 
        error: 'Username already registered' 
      })
    }
    
    // Check if username is already pending
    const pendingData = await readJsonFile(PENDING_JSON_PATH)
    const existingPending = pendingData.find(
      req => req.username === username && req.status === 'pending'
    )
    
    if (existingPending) {
      return res.status(409).json({ 
        success: false, 
        error: 'Registration request already pending approval' 
      })
    }
    
    // Add to pending requests
    const newRequest = {
      username,
      pubkey: normalizedPubkey,
      domain: domain || DOMAIN,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }
    
    pendingData.push(newRequest)
    await writeJsonFile(PENDING_JSON_PATH, pendingData)
    
    console.log(`New registration request: ${username}@${domain || DOMAIN}`)
    
    res.json({ 
      success: true, 
      message: 'Registration submitted successfully. Awaiting admin approval.' 
    })
  } catch (error) {
    console.error('Error processing registration:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process registration request' 
    })
  }
})

// Admin Endpoints

// Middleware to check admin API key
function requireAdmin(req, res, next) {
  if (!validateApiKey(req)) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized. Valid API key required.' 
    })
  }
  next()
}

// Get pending registration requests
app.get('/api/admin/pending', requireAdmin, async (req, res) => {
  try {
    const pendingData = await readJsonFile(PENDING_JSON_PATH)
    const pending = pendingData.filter(req => req.status === 'pending')
    
    res.json({ 
      success: true, 
      pending: pending.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
    })
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pending requests' 
    })
  }
})

// Approve a registration
app.post('/api/admin/approve', requireAdmin, async (req, res) => {
  try {
    const { username, pubkey } = req.body
    
    if (!username || !pubkey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and pubkey are required' 
      })
    }
    
    if (!validateUsername(username) || !validatePubkey(pubkey)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid username or pubkey format' 
      })
    }
    
    const normalizedPubkey = pubkey.toLowerCase()
    
    // Read current data
    const nostrData = await readJsonFile(NOSTR_JSON_PATH)
    const pendingData = await readJsonFile(PENDING_JSON_PATH)
    
    // Check if username already exists
    if (nostrData.names && nostrData.names[username]) {
      return res.status(409).json({ 
        success: false, 
        error: 'Username already registered' 
      })
    }
    
    // Find and update pending request
    const pendingIndex = pendingData.findIndex(
      req => req.username === username && req.status === 'pending'
    )
    
    if (pendingIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pending request not found' 
      })
    }
    
    // Verify pubkey matches
    if (pendingData[pendingIndex].pubkey.toLowerCase() !== normalizedPubkey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Pubkey does not match pending request' 
      })
    }
    
    // Add to nostr.json
    if (!nostrData.names) {
      nostrData.names = {}
    }
    nostrData.names[username] = normalizedPubkey
    
    // Update pending request status
    pendingData[pendingIndex].status = 'approved'
    pendingData[pendingIndex].approvedAt = new Date().toISOString()
    
    // Write files
    await writeJsonFile(NOSTR_JSON_PATH, nostrData)
    await writeJsonFile(PENDING_JSON_PATH, pendingData)
    
    console.log(`Approved registration: ${username}@${DOMAIN}`)
    
    res.json({ 
      success: true, 
      message: `Registration approved for ${username}@${DOMAIN}` 
    })
  } catch (error) {
    console.error('Error approving registration:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to approve registration' 
    })
  }
})

// Reject a registration
app.post('/api/admin/reject', requireAdmin, async (req, res) => {
  try {
    const { username } = req.body
    
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username is required' 
      })
    }
    
    const pendingData = await readJsonFile(PENDING_JSON_PATH)
    
    const pendingIndex = pendingData.findIndex(
      req => req.username === username && req.status === 'pending'
    )
    
    if (pendingIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pending request not found' 
      })
    }
    
    // Update pending request status
    pendingData[pendingIndex].status = 'rejected'
    pendingData[pendingIndex].rejectedAt = new Date().toISOString()
    
    await writeJsonFile(PENDING_JSON_PATH, pendingData)
    
    console.log(`Rejected registration: ${username}@${DOMAIN}`)
    
    res.json({ 
      success: true, 
      message: `Registration rejected for ${username}@${DOMAIN}` 
    })
  } catch (error) {
    console.error('Error rejecting registration:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reject registration' 
    })
  }
})

// Get all active registrations
app.get('/api/admin/registrations', requireAdmin, async (req, res) => {
  try {
    const nostrData = await readJsonFile(NOSTR_JSON_PATH)
    
    const registrations = Object.entries(nostrData.names || {}).map(
      ([username, pubkey]) => ({
        username,
        pubkey,
        nip05: `${username}@${DOMAIN}`
      })
    )
    
    res.json({ 
      success: true, 
      registrations: registrations.sort((a, b) => 
        a.username.localeCompare(b.username)
      )
    })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch registrations' 
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'anmore-nip05-backend' })
})

// Initialize and start server
async function start() {
  await ensureDataDir()
  
  app.listen(PORT, () => {
    console.log(`NIP-05 Backend Service running on port ${PORT}`)
    console.log(`Domain: ${DOMAIN}`)
    console.log(`NIP-05 endpoint: http://localhost:${PORT}/.well-known/nostr.json`)
    console.log(`Admin API endpoints available at /api/admin/*`)
  })
}

start().catch(error => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

