// Demo Shop — zero-dependency Node server (static pages + JSON API).
// Start: node server.js   (PORT env var, default 3000)
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const PORT = Number(process.env.PORT) || 3000
const PUBLIC_DIR = path.join(__dirname, 'public')

const USERS = {
  standard_user: { password: 'secret_sauce', name: 'Standard User' },
  locked_user: { password: 'secret_sauce', name: 'Locked User', locked: true },
  slow_user: { password: 'secret_sauce', name: 'Slow User', delayMs: 3000 },
}

const PRODUCTS = [
  { id: 1, name: 'Backpack', price: 29.99, description: 'Carry everything, everywhere.' },
  { id: 2, name: 'Bike Light', price: 9.99, description: 'Be seen at night.' },
  { id: 3, name: 'Bolt T-Shirt', price: 15.99, description: 'Soft cotton, bold print.' },
  { id: 4, name: 'Fleece Jacket', price: 49.99, description: 'Warm and light.' },
  { id: 5, name: 'Onesie', price: 7.99, description: 'For the tiniest testers.' },
  { id: 6, name: 'Red T-Shirt', price: 15.99, description: 'Classic red, classic fit.' },
]

// sessionId -> username (in memory, reset on restart)
const sessions = new Map()
const orders = []

const PROTECTED_PAGES = new Set(['/inventory.html', '/cart.html', '/checkout.html', '/complete.html'])
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' }

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map((c) => c.trim().split('='))
      .filter(([k]) => k)
  )
}

function currentUser(req) {
  const sid = parseCookies(req).sid
  return sid && sessions.has(sid) ? sessions.get(sid) : null
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        resolve(null)
      }
    })
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function handleApi(req, res, url) {
  const username = currentUser(req)
  const user = username ? USERS[username] : null

  if (req.method === 'POST' && url.pathname === '/api/login') {
    const body = await readBody(req)
    if (!body || !body.username || !body.password) {
      return sendJson(res, 400, { error: 'Username and password are required' })
    }
    const found = USERS[body.username]
    if (!found || found.password !== body.password) {
      return sendJson(res, 401, { error: 'Username and password do not match any user' })
    }
    if (found.locked) {
      return sendJson(res, 403, { error: 'Sorry, this user has been locked out' })
    }
    const sid = crypto.randomUUID()
    sessions.set(sid, body.username)
    res.setHeader('Set-Cookie', `sid=${sid}; Path=/; HttpOnly; SameSite=Lax`)
    return sendJson(res, 200, { username: body.username, name: found.name })
  }

  if (req.method === 'POST' && url.pathname === '/api/logout') {
    sessions.delete(parseCookies(req).sid)
    res.setHeader('Set-Cookie', 'sid=; Path=/; Max-Age=0')
    return sendJson(res, 200, { ok: true })
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok' })
  }

  // Everything below requires a session
  if (!user) return sendJson(res, 401, { error: 'Not authenticated' })
  if (user.delayMs) await sleep(user.delayMs)

  if (req.method === 'GET' && url.pathname === '/api/me') {
    return sendJson(res, 200, { username, name: user.name })
  }

  if (req.method === 'GET' && url.pathname === '/api/products') {
    await sleep(400) // realistic latency: practise auto-waiting, never waitForTimeout
    return sendJson(res, 200, PRODUCTS)
  }

  const productMatch = url.pathname.match(/^\/api\/products\/(\d+)$/)
  if (req.method === 'GET' && productMatch) {
    const product = PRODUCTS.find((p) => p.id === Number(productMatch[1]))
    return product ? sendJson(res, 200, product) : sendJson(res, 404, { error: 'Product not found' })
  }

  if (req.method === 'POST' && url.pathname === '/api/orders') {
    const body = await readBody(req)
    const missing = ['firstName', 'lastName', 'postalCode'].filter((f) => !body?.shipping?.[f])
    if (missing.length) return sendJson(res, 400, { error: `Missing fields: ${missing.join(', ')}` })
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return sendJson(res, 400, { error: 'Cart is empty' })
    }
    const total = body.items.reduce((sum, id) => sum + (PRODUCTS.find((p) => p.id === id)?.price || 0), 0)
    const order = { id: orders.length + 1, username, items: body.items, shipping: body.shipping, total: Math.round(total * 100) / 100 }
    orders.push(order)
    return sendJson(res, 201, order)
  }

  return sendJson(res, 404, { error: 'Not found' })
}

function serveStatic(req, res, url) {
  let pathname = url.pathname === '/' ? '/index.html' : url.pathname

  if (PROTECTED_PAGES.has(pathname) && !currentUser(req)) {
    res.writeHead(302, { Location: '/?redirected=1' })
    return res.end()
  }
  if (pathname === '/index.html' && currentUser(req)) {
    res.writeHead(302, { Location: '/inventory.html' })
    return res.end()
  }

  const filePath = path.join(PUBLIC_DIR, path.normalize(pathname))
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403)
    return res.end()
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      return res.end('Not found')
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' })
    res.end(data)
  })
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    if (url.pathname.startsWith('/api/')) return handleApi(req, res, url)
    serveStatic(req, res, url)
  })
  .listen(PORT, () => console.log(`Demo Shop running on http://localhost:${PORT}`))
