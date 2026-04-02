// ===== Firebase Setup =====
const firebaseConfig = {
  apiKey: "AIzaSyBc9VFC5_UBl_qg6lM2xftWpClcK5QAAuw",
  authDomain: "fly-app-2e202.firebaseapp.com",
  databaseURL: "https://fly-app-2e202-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fly-app-2e202",
  storageBucket: "fly-app-2e202.firebasestorage.app",
  messagingSenderId: "1061102905067",
  appId: "1:1061102905067:web:9da0a1f2138e58e09880ae",
  measurementId: "G-7ZMY7WEK46"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const friendsRef = db.ref('friends');

// ===== Local Storage (PIN only — stays per device) =====
const PIN_KEY = 'fly-counter-pin';

function getStoredPin() {
  return localStorage.getItem(PIN_KEY);
}

function setStoredPin(pin) {
  localStorage.setItem(PIN_KEY, pin);
}

// ===== Admin Mode =====
let isAdmin = false;
let modalStep = null;
let pendingPin = '';

function applyAdminMode() {
  const adminToggle = document.getElementById('admin-toggle');
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

// ===== PIN Modal =====
function showModal(title, subtitle) {
  const modal = document.getElementById('pin-modal');
  const pinInput = document.getElementById('pin-input');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-subtitle').textContent = subtitle || '';
  document.getElementById('modal-error').hidden = true;
  pinInput.value = '';
  modal.hidden = false;
  setTimeout(() => pinInput.focus(), 50);
}

function hideModal() {
  document.getElementById('pin-modal').hidden = true;
  modalStep = null;
  pendingPin = '';
}

function handleAdminToggle() {
  if (isAdmin) {
    isAdmin = false;
    sessionStorage.removeItem('fly-admin-session');
    applyAdminMode();
    return;
  }

  const storedPin = getStoredPin();

  if (!storedPin) {
    modalStep = 'set-pin';
    showModal('Set Admin PIN', 'Choose a PIN (4+ characters)');
  } else {
    modalStep = 'enter-pin';
    showModal('Enter Admin PIN', 'Type your PIN to unlock');
  }
}

function handleModalConfirm() {
  const pinInput = document.getElementById('pin-input');
  const errorEl = document.getElementById('modal-error');
  const value = pinInput.value;

  if (modalStep === 'set-pin') {
    if (value.length < 4) {
      errorEl.textContent = 'PIN must be at least 4 characters!';
      errorEl.hidden = false;
      return;
    }
    pendingPin = value;
    modalStep = 'confirm-pin';
    showModal('Confirm PIN', 'Type it again to confirm');

  } else if (modalStep === 'confirm-pin') {
    if (value !== pendingPin) {
      errorEl.textContent = 'PINs don\'t match! Try again.';
      errorEl.hidden = false;
      pinInput.value = '';
      return;
    }
    setStoredPin(pendingPin);
    isAdmin = true;
    sessionStorage.setItem('fly-admin-session', '1');
    hideModal();
    applyAdminMode();

  } else if (modalStep === 'enter-pin') {
    if (value === getStoredPin()) {
      isAdmin = true;
      sessionStorage.setItem('fly-admin-session', '1');
      hideModal();
      applyAdminMode();
    } else {
      errorEl.textContent = 'Wrong PIN!';
      errorEl.hidden = false;
      pinInput.value = '';
    }
  }
}

// ===== State =====
let friends = [];

// ===== DOM References =====
const form = document.getElementById('add-friend-form');
const nameInput = document.getElementById('friend-name');
const grid = document.getElementById('friends-grid');
const emptyState = document.getElementById('empty-state');
const clearAllBtn = document.getElementById('clear-all-btn');

// ===== Firebase → Render (real-time listener) =====
friendsRef.on('value', (snapshot) => {
  const data = snapshot.val();
  // Firebase stores objects, convert to array
  if (data) {
    friends = Object.keys(data).map(key => ({
      id: key,
      name: data[key].name,
      count: data[key].count || 0
    }));
  } else {
    friends = [];
  }
  render();
});

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

  const flyCount = 1 + Math.floor(Math.random() * 2);

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

  const edge = Math.floor(Math.random() * 4);
  let startX, startY;
  switch (edge) {
    case 0: startX = Math.random() * window.innerWidth; startY = -40; break;
    case 1: startX = window.innerWidth + 40; startY = Math.random() * window.innerHeight; break;
    case 2: startX = Math.random() * window.innerWidth; startY = window.innerHeight + 40; break;
    case 3: startX = -40; startY = Math.random() * window.innerHeight; break;
  }

  fly.style.left = startX + 'px';
  fly.style.top = startY + 'px';
  document.body.appendChild(fly);

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

    const splat = document.createElement('span');
    splat.className = 'fly-splat';
    splat.textContent = '💥';
    splat.style.left = (targetX - 12) + 'px';
    splat.style.top = (targetY - 12) + 'px';
    document.body.appendChild(splat);
    setTimeout(() => splat.remove(), 500);

    cardEl.classList.remove('card-hit');
    void cardEl.offsetWidth;
    cardEl.classList.add('card-hit');

    const countEl = cardEl.querySelector('.count');
    if (countEl) {
      countEl.classList.remove('count-pop');
      void countEl.offsetWidth;
      countEl.classList.add('count-pop');
    }
  };
}

// ===== Actions (write to Firebase) =====
function addFriend(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const id = generateId();
  friendsRef.child(id).set({ name: trimmed, count: 0 });
}

function increment(id) {
  const friend = friends.find(f => f.id === id);
  if (!friend) return;

  // Trigger animation on the current card
  const card = grid.querySelector(`[data-id="${id}"]`)?.closest('.friend-card');
  if (card) spawnFlyAnimation(card);

  // Update Firebase (the real-time listener will re-render)
  friendsRef.child(id).update({ count: friend.count + 1 });
}

function decrement(id) {
  const friend = friends.find(f => f.id === id);
  if (friend && friend.count > 0) {
    friendsRef.child(id).update({ count: friend.count - 1 });
  }
}

function resetCount(id) {
  const friend = friends.find(f => f.id === id);
  if (!friend) return;
  if (friend.count === 0) return;
  if (!confirm(`Reset ${friend.name}'s fly count to 0?`)) return;
  friendsRef.child(id).update({ count: 0 });
}

function removeFriend(id) {
  const friend = friends.find(f => f.id === id);
  if (!friend) return;
  if (!confirm(`Remove ${friend.name}?`)) return;
  friendsRef.child(id).remove();
}

function clearAll() {
  if (!confirm('Remove ALL friends and reset everything?')) return;
  friendsRef.remove();
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

document.getElementById('admin-toggle').addEventListener('click', handleAdminToggle);
document.getElementById('modal-cancel').addEventListener('click', hideModal);
document.getElementById('modal-confirm').addEventListener('click', handleModalConfirm);
document.getElementById('pin-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleModalConfirm();
  if (e.key === 'Escape') hideModal();
});
document.getElementById('pin-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) hideModal();
});

// ===== Init =====
if (sessionStorage.getItem('fly-admin-session') === '1' && getStoredPin()) {
  isAdmin = true;
}
applyAdminMode();
