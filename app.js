// ===== Storage =====
const STORAGE_KEY = 'fly-counter-friends';
const PIN_KEY = 'fly-counter-pin';

function loadFriends() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFriends(friends) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(friends));
}

// ===== Admin Mode =====
let isAdmin = false;

function getStoredPin() {
  return localStorage.getItem(PIN_KEY);
}

function setStoredPin(pin) {
  localStorage.setItem(PIN_KEY, pin);
}

function applyAdminMode() {
  if (isAdmin) {
    document.body.classList.add('admin-mode');
    adminToggle.textContent = '🔓';
    adminToggle.classList.add('unlocked');
  } else {
    document.body.classList.remove('admin-mode');
    adminToggle.textContent = '🔒';
    adminToggle.classList.remove('unlocked');
  }
  render();
}

function handleAdminToggle() {
  if (isAdmin) {
    // Log out of admin
    isAdmin = false;
    sessionStorage.removeItem('fly-admin-session');
    applyAdminMode();
    return;
  }

  const storedPin = getStoredPin();

  if (!storedPin) {
    // First time: set a new PIN
    const newPin = prompt('Set your admin PIN (4+ digits):');
    if (!newPin || newPin.length < 4) {
      alert('PIN must be at least 4 characters.');
      return;
    }
    const confirmPin = prompt('Confirm your PIN:');
    if (newPin !== confirmPin) {
      alert('PINs don\'t match. Try again.');
      return;
    }
    setStoredPin(newPin);
    isAdmin = true;
    sessionStorage.setItem('fly-admin-session', '1');
    applyAdminMode();
  } else {
    // PIN exists: ask for it
    const entered = prompt('Enter admin PIN:');
    if (entered === storedPin) {
      isAdmin = true;
      sessionStorage.setItem('fly-admin-session', '1');
      applyAdminMode();
    } else if (entered !== null) {
      alert('Wrong PIN!');
    }
  }
}

// ===== State =====
let friends = loadFriends();

// ===== DOM References =====
const form = document.getElementById('add-friend-form');
const nameInput = document.getElementById('friend-name');
const grid = document.getElementById('friends-grid');
const emptyState = document.getElementById('empty-state');
const clearAllBtn = document.getElementById('clear-all-btn');
const adminToggle = document.getElementById('admin-toggle');

// ===== Render =====
function render() {
  grid.innerHTML = '';

  if (friends.length === 0) {
    emptyState.hidden = false;
    clearAllBtn.hidden = true;
    return;
  }

  emptyState.hidden = true;
  clearAllBtn.hidden = false;

  friends.forEach((friend) => {
    const card = document.createElement('div');
    card.className = 'friend-card';
    card.innerHTML = `
      <span class="fly-deco">🪰</span>
      <span class="name">${escapeHTML(friend.name)}</span>
      <span class="count">${friend.count}</span>
      <div class="counter-controls">
        <button class="btn btn-count minus" data-id="${friend.id}" data-action="minus" aria-label="Decrement">−</button>
        <button class="btn btn-count plus" data-id="${friend.id}" data-action="plus" aria-label="Increment">+</button>
      </div>
      <div class="card-actions">
        <button class="btn btn-small btn-reset" data-id="${friend.id}" data-action="reset">Reset</button>
        <button class="btn btn-small btn-remove" data-id="${friend.id}" data-action="remove">Remove</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ===== Helpers =====
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ===== Fly Animation =====
function spawnFlyAnimation(cardEl) {
  const cardRect = cardEl.getBoundingClientRect();
  const targetX = cardRect.left + cardRect.width / 2;
  const targetY = cardRect.top + cardRect.height / 3;

  const flyCount = 1 + Math.floor(Math.random() * 2); // 1-2 flies

  document.body.classList.add('fly-animating');

  for (let i = 0; i < flyCount; i++) {
    setTimeout(() => launchOneFly(targetX, targetY, cardEl), i * 120);
  }

  setTimeout(() => document.body.classList.remove('fly-animating'), 1200);
}

function launchOneFly(targetX, targetY, cardEl) {
  const fly = document.createElement('span');
  fly.className = 'flying-fly';
  fly.textContent = '🪰';

  // Pick a random edge to start from
  const edge = Math.floor(Math.random() * 4);
  let startX, startY;
  switch (edge) {
    case 0: // top
      startX = Math.random() * window.innerWidth;
      startY = -40;
      break;
    case 1: // right
      startX = window.innerWidth + 40;
      startY = Math.random() * window.innerHeight;
      break;
    case 2: // bottom
      startX = Math.random() * window.innerWidth;
      startY = window.innerHeight + 40;
      break;
    case 3: // left
      startX = -40;
      startY = Math.random() * window.innerHeight;
      break;
  }

  fly.style.left = startX + 'px';
  fly.style.top = startY + 'px';
  document.body.appendChild(fly);

  // Build a zigzag path with 3-4 waypoints
  const steps = 3 + Math.floor(Math.random() * 2);
  const keyframes = [{ left: startX + 'px', top: startY + 'px', offset: 0 }];

  for (let s = 1; s <= steps; s++) {
    const progress = s / (steps + 1);
    const midX = startX + (targetX - startX) * progress + (Math.random() - 0.5) * 160;
    const midY = startY + (targetY - startY) * progress + (Math.random() - 0.5) * 120;
    keyframes.push({ left: midX + 'px', top: midY + 'px', offset: progress * 0.85 });
  }

  keyframes.push({ left: targetX + 'px', top: targetY + 'px', offset: 1 });

  const duration = 500 + Math.random() * 300;

  const anim = fly.animate(keyframes, {
    duration,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    fill: 'forwards',
  });

  anim.onfinish = () => {
    fly.remove();

    // Splat effect
    const splat = document.createElement('span');
    splat.className = 'fly-splat';
    splat.textContent = '💥';
    splat.style.left = (targetX - 12) + 'px';
    splat.style.top = (targetY - 12) + 'px';
    document.body.appendChild(splat);
    setTimeout(() => splat.remove(), 500);

    // Card wiggle
    cardEl.classList.remove('card-hit');
    void cardEl.offsetWidth; // reflow to restart animation
    cardEl.classList.add('card-hit');

    // Count pop
    const countEl = cardEl.querySelector('.count');
    if (countEl) {
      countEl.classList.remove('count-pop');
      void countEl.offsetWidth;
      countEl.classList.add('count-pop');
    }
  };
}

// ===== Actions =====
function addFriend(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  friends.push({ id: generateId(), name: trimmed, count: 0 });
  saveFriends(friends);
  render();
}

function increment(id) {
  const friend = friends.find(f => f.id === id);
  if (!friend) return;

  // Find the card element before re-rendering
  const card = grid.querySelector(`[data-id="${id}"]`)?.closest('.friend-card');
  if (card) spawnFlyAnimation(card);

  friend.count++;
  saveFriends(friends);
  render();
}

function decrement(id) {
  const friend = friends.find(f => f.id === id);
  if (friend && friend.count > 0) {
    friend.count--;
    saveFriends(friends);
    render();
  }
}

function resetCount(id) {
  const friend = friends.find(f => f.id === id);
  if (!friend) return;
  if (friend.count === 0) return;
  if (!confirm(`Reset ${friend.name}'s fly count to 0?`)) return;
  friend.count = 0;
  saveFriends(friends);
  render();
}

function removeFriend(id) {
  const friend = friends.find(f => f.id === id);
  if (!friend) return;
  if (!confirm(`Remove ${friend.name}?`)) return;
  friends = friends.filter(f => f.id !== id);
  saveFriends(friends);
  render();
}

function clearAll() {
  if (!confirm('Remove ALL friends and reset everything?')) return;
  friends = [];
  saveFriends(friends);
  render();
}

// ===== Event Listeners =====
form.addEventListener('submit', (e) => {
  e.preventDefault();
  addFriend(nameInput.value);
  nameInput.value = '';
  nameInput.focus();
});

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const { id, action } = btn.dataset;
  switch (action) {
    case 'plus':  increment(id); break;
    case 'minus': decrement(id); break;
    case 'reset': resetCount(id); break;
    case 'remove': removeFriend(id); break;
  }
});

clearAllBtn.addEventListener('click', clearAll);
adminToggle.addEventListener('click', handleAdminToggle);

// ===== Init =====
// Restore admin session if still active in this tab
if (sessionStorage.getItem('fly-admin-session') === '1' && getStoredPin()) {
  isAdmin = true;
}
applyAdminMode();
