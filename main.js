// --- 1. PRODUCT LOADING ---
let products = [];

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        window.products = products;

        if (document.getElementById('product-container')) {
            renderProducts('All');
        }

        // Trigger IS to re-read catalog data after products load
        if (window.SalesforceInteractions) {
            SalesforceInteractions.reinit();
        }
    } catch (err) {
        console.error("Could not load products:", err);
    }
}

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
        <div class="border p-4 group">
            <img src="${p.image}" class="w-full h-64 object-cover mb-4 cursor-pointer" onclick="window.location.href='pdp.html?id=${p.id}'">
            <h3 class="font-bold">${p.name}</h3>
            <p class="text-gold mb-4">$${p.price}</p>
            <button onclick="addToCart(${p.id})" class="w-full bg-dark text-white py-2 hover:bg-gold transition">Add to Cart</button>
        </div>
    `).join('');
}

function filterProducts(cat) {
    renderProducts(cat);

    // Reflect the selected category in the URL (no page reload)
    const url = new URL(window.location);
    if (cat === 'All') {
        url.searchParams.delete('category');
    } else {
        url.searchParams.set('category', cat);
    }
    window.history.replaceState({}, '', url);

    // Notify the Personalization sitemap that the category changed
    document.dispatchEvent(new CustomEvent("categoryChanged", { detail: { category: cat } }));
}

// --- 4. CART LOGIC ---
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

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem(`cart_${currentUser}`, JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

// --- 5. AUTH LOGIC (single, correct versions only) ---
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

// --- 6. INIT ---
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    initAuth();
});