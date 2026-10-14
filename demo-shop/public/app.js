// Shared helpers for every page: cart (localStorage), header, API calls.
const CART_KEY = 'cart'

const Cart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || []
    } catch {
      return []
    }
  },
  set(ids) {
    localStorage.setItem(CART_KEY, JSON.stringify(ids))
    renderCartBadge()
  },
  has(id) {
    return Cart.get().includes(id)
  },
  add(id) {
    if (!Cart.has(id)) Cart.set([...Cart.get(), id])
  },
  remove(id) {
    Cart.set(Cart.get().filter((x) => x !== id))
  },
  clear() {
    Cart.set([])
  },
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { status: res.status })
  return data
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value)
    else if (value !== false && value != null) node.setAttribute(key, value === true ? '' : value)
  }
  node.append(...children.filter((c) => c != null))
  return node
}

const formatPrice = (n) => `$${n.toFixed(2)}`

function renderCartBadge() {
  const badge = document.querySelector('[data-testid="cart-badge"]')
  if (!badge) return
  const count = Cart.get().length
  badge.textContent = String(count)
  badge.hidden = count === 0
}

function renderHeader() {
  const header = document.querySelector('header.app-header')
  if (!header) return
  const nav = el(
    'nav',
    { id: 'main-nav', class: 'app-nav', 'aria-label': 'Main' },
    el('a', { href: '/inventory.html' }, 'Products'),
    el(
      'a',
      { href: '/cart.html', class: 'cart-link' },
      'Cart ',
      el('span', { class: 'badge', 'data-testid': 'cart-badge', hidden: true })
    ),
    el(
      'button',
      {
        type: 'button',
        class: 'link-button',
        onClick: async () => {
          await api('/api/logout', { method: 'POST' })
          localStorage.removeItem(CART_KEY)
          location.href = '/'
        },
      },
      'Logout'
    )
  )
  const burger = el(
    'button',
    {
      type: 'button',
      class: 'burger',
      'aria-label': 'Open menu',
      'aria-expanded': 'false',
      'aria-controls': 'main-nav',
      onClick: () => {
        const open = nav.classList.toggle('open')
        burger.setAttribute('aria-expanded', String(open))
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
      },
    },
    '☰'
  )
  header.append(el('a', { href: '/inventory.html', class: 'logo' }, 'Demo Shop'), burger, nav)
  renderCartBadge()
}

document.addEventListener('DOMContentLoaded', renderHeader)
