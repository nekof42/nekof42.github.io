// ==================== Custom Cursor System ====================
// Linear interpolation function for smooth movement
Math.lerp = function (start, end, amount) {
  return (1 - amount) * start + amount * end
}

// Get computed style property of an element
function getStyle (el, prop) {
  return window.getComputedStyle ? window.getComputedStyle(el)[prop] : el.currentStyle[prop]
}

// Main cursor class: creates a custom cursor #cursor and hides the system cursor
class Cursor {
  constructor () {
    this.pos = { curr: null, prev: null }
    this.hoverTargets = [] // Elements that need special highlighting
    this.createCursor()
    this.initEvents()
    this.render()
  }

  // Create cursor element and override system cursor
  createCursor () {
    if (!this.cursor) {
      this.cursor = document.createElement('div')
      this.cursor.id = 'cursor'
      this.cursor.classList.add('hidden')
      document.body.appendChild(this.cursor)
    }

    // Collect all elements with CSS cursor "cursor" (for highlighting)
    const allElements = document.getElementsByTagName('*')
    for (let el of allElements) {
      if (getStyle(el, 'cursor') === 'cursor') {
        this.hoverTargets.push(el.outerHTML)
      }
    }

    // Hide system cursor and use custom cursor
    const style = document.createElement('style')
    style.innerHTML = `* { cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='8px' height='8px'><circle cx='4' cy='4' r='4' fill='white' fill-opacity='0.5'/></svg>") 4 4, auto !important; }`
    document.body.appendChild(style)
  }

  // Initialize mouse move event
  initEvents () {
    document.onmousemove = (e) => {
      if (this.pos.curr === null) {
        this.move(e.clientX - 8, e.clientY - 8)
      }
      this.pos.curr = { x: e.clientX - 8, y: e.clientY - 8 }
      this.cursor.classList.remove('hidden')
    }
  }

  // Move cursor to given coordinates
  move (x, y) {
    this.cursor.style.left = x + 'px'
    this.cursor.style.top = y + 'px'
  }

  // Render loop: smooth interpolation
  render () {
    if (this.pos.prev) {
      this.pos.prev.x = Math.lerp(this.pos.prev.x, this.pos.curr.x, 0.15)
      this.pos.prev.y = Math.lerp(this.pos.prev.y, this.pos.curr.y, 0.15)
      this.move(this.pos.prev.x, this.pos.prev.y)
    } else {
      this.pos.prev = this.pos.curr
    }
    requestAnimationFrame(() => this.render())
  }
}

// Initialize custom cursor
const CURSOR = new Cursor()

// ==================== Dual Cursor Coordination: #pointer and #cursor ====================
const htmlEl = document.documentElement
const cursorEl = document.getElementById('cursor')
const pointerEl = document.getElementById('pointer')
let isHovering = false

// Store last mouse position for sync updates
let lastMouseX = 0, lastMouseY = 0

// Synchronously set positions (no rAF, for immediate updates)
function setPositionSync (clientX, clientY) {
  const currentHalfCursor = cursorEl.offsetWidth / 2
  const currentHalfPointer = pointerEl.offsetWidth / 2

  cursorEl.style.transform = `translate(${clientX - currentHalfCursor}px, ${clientY - currentHalfCursor}px)`

  if (!isHovering) {
    pointerEl.style.transform = `translate(${clientX - currentHalfPointer}px, ${clientY - currentHalfPointer}px)`
  }
}

// Asynchronously set positions (with rAF, for mousemove)
function setPosition (clientX, clientY) {
  requestAnimationFrame(() => {
    setPositionSync(clientX, clientY)
  })
}

// Highlight functionality
window.addEventListener('mouseover', (e) => {
  if (e.target.classList.contains('highlight')) {
    isHovering = true
    const rect = e.target.getBoundingClientRect()
    const style = window.getComputedStyle(e.target)
    pointerEl.style.width = rect.width + 'px'
    pointerEl.style.height = rect.height + 'px'
    pointerEl.style.borderRadius = style.borderRadius
    pointerEl.style.transform = `translate(${rect.left}px, ${rect.top}px)`
  }
})

window.addEventListener('mouseout', (e) => {
  if (e.target.classList.contains('highlight')) {
    isHovering = false
    pointerEl.style.width = '42px'
    pointerEl.style.height = '42px'
    pointerEl.style.borderRadius = '50%'
    // After leaving highlight, immediately position pointer at last mouse coordinates
    if (window.innerWidth > 768) {
      setPositionSync(lastMouseX, lastMouseY)
    }
  }
})

// Global mouse move, update position and record last coordinates
htmlEl.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  setPosition(e.clientX, e.clientY)
})
