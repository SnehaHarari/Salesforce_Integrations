// --- 1. PRODUCT DATA ---
const products = [
    { id: 1, name: "Diamond Halo Ring", price: 1200, category: "Rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80" },
    { id: 2, name: "Gold Chain Pendant", price: 450, category: "Necklaces", image: "https://images.unsplash.com/photo-1599643477877-530eb63abc9e?auto=format&fit=crop&w=800&q=80" },
    { id: 3, name: "Pearl Drop Earrings", price: 220, category: "Earrings", image: "https://images.unsplash.com/photo-1535632787354-4e68ef0ac584?auto=format&fit=crop&w=800&q=80" },
    { id: 4, name: "Sapphire Tennis Bracelet", price: 800, category: "Bracelets", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80" }
];

// --- 2. STATE ---
let currentUser = localStorage.getItem('loggedInUser');
let cart = currentUser ? JSON.parse(localStorage.getItem(`cart_${currentUser}`)) || [] : [];
let users = JSON.parse(localStorage.getItem('users')) || [{ email: "test@example.com", password: "password123" }];

// --- 3. PRODUCT RENDERING ---
function renderProducts(category = 'All') {
    const container = document.getElementById('product-container');
    const title = document.getElementById('cat-title');
    if (!container) return;

    title.textContent = category === 'All' ? 'Our Collection' : category;
    const filtered = category === 'All' ? products : products.filter(p => p.category === category);
    
    container.innerHTML = filtered.map(p => `
        <div class="border p-4">
            <img src="${p.image}" class="w-full h-64 object-cover mb-4">
            <h3 class="font-bold">${p.name}</h3>
            <p class="text-gold mb-4">$${p.price}</p>
            <button onclick="addToCart(${p.id})" class="w-full bg-dark text-white py-2 hover:bg-gold transition">Add to Cart</button>
        </div>
    `).join('');
}

function filterProducts(cat) { renderProducts(cat); }

// --- 4. CART & AUTH LOGIC ---
function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = cart.length;
}

function addToCart(id) {
    if (!localStorage.getItem('loggedInUser')) {
        window.location.href = "login.html";
        return;
    }
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push(product);
        localStorage.setItem(`cart_${currentUser}`, JSON.stringify(cart));
        updateCartCount();
        alert(`${product.name} added to cart!`);
    }
}

function handleLogin(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('loggedInUser', email);
        window.location.href = "index.html";
    } else {
        throw new Error("Invalid email or password.");
    }
}

function handleSignup(email, password) {
    if (users.find(u => u.email === email)) throw new Error("Account already exists.");
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert("Account created! Please log in.");
    window.location.href = "login.html";
}

function initAuth() {
    const loginLink = document.querySelector('a[href="login.html"]');
    if (currentUser && loginLink) {
        loginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
        loginLink.onclick = () => { localStorage.removeItem('loggedInUser'); location.reload(); };
        loginLink.href = "#";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initAuth();
});
