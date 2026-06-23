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
    
    // In main.js
container.innerHTML = filtered.map(p => `
    <div class="border p-4 group">
        <img src="${p.image}" class="w-full h-64 object-cover mb-4 cursor-pointer" onclick="window.location.href='pdp.html?id=${p.id}'">
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
// Add this to main.js
function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic">Your cart is empty.</p>';
        totalEl.textContent = "$0";
    } else {
        container.innerHTML = cart.map((p, index) => `
            <div class="flex items-center justify-between border-b pb-4">
                <div class="flex items-center gap-4">
                    <img src="${p.image}" class="w-16 h-16 object-cover">
                    <p class="font-medium">${p.name}</p>
                </div>
                <p class="font-bold">$${p.price}</p>
                <button onclick="removeFromCart(${index})" class="text-red-500 text-xs hover:underline">Remove</button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, p) => sum + p.price, 0);
        totalEl.textContent = `$${total}`;
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

function handleSignup(email, password, name, phone) {
    if (users.find(u => u.email === email)) throw new Error("Account already exists.");
    
    // Store the new fields
    users.push({ email, password, name, phone }); 
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

// In main.js - Add this at the bottom
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initAuth();

    // Signup form listener
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
       signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-pass').value;
    handleSignup(email, pass, name, phone); // Pass new variables
});
    }

    // Login form listener
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                handleLogin(email, password);
            } catch (err) {
                alert(err.message);
            }
        });
    }
});