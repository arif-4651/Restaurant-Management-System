// Navigation
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Smooth scrolling
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
        
        // Close mobile menu
        navMenu.classList.remove('active');
    });
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Active section highlighting on scroll
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Dashboard Counter Animation
const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    };

    updateCounter();
};

// Intersection Observer for counter animation
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                if (!stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    animateCounter(stat);
                }
            });
        }
    });
}, observerOptions);

const dashboardSection = document.querySelector('.dashboard-section');
if (dashboardSection) {
    observer.observe(dashboardSection);
}

// Menu Filter
const filterButtons = document.querySelectorAll('.filter-btn');
const menuItems = document.querySelectorAll('.menu-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active filter button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Filter menu items
        const filter = button.getAttribute('data-filter');
        
        menuItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
                item.style.animation = 'fadeIn 0.5s ease';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Cart Management
let cart = [];
const cartButton = document.getElementById('cartButton');
const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');

// Add to cart
const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
addToCartButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        const menuItem = button.closest('.menu-item');
        const name = menuItem.querySelector('.menu-name').textContent;
        const price = parseInt(menuItem.querySelector('.menu-price').textContent.replace('₹', ''));
        
        // Check if item already in cart
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        updateCart();
        showNotification(`${name} added to cart!`);
        
        // Animate cart button
        cartButton.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartButton.style.transform = 'scale(1)';
        }, 200);
    });
});

// Open/Close cart
cartButton.addEventListener('click', () => {
    cartSidebar.classList.add('open');
});

cartClose.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
});

// Close cart when clicking outside
document.addEventListener('click', (e) => {
    if (!cartSidebar.contains(e.target) && !cartButton.contains(e.target)) {
        cartSidebar.classList.remove('open');
    }
});

// Update cart display
function updateCart() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
        cartTotal.textContent = '0';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price} each</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toLocaleString();
}

// Update quantity
window.updateQuantity = function(name, change) {
    const item = cart.find(i => i.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
        updateCart();
    }
};

// Checkout
const checkoutButton = document.querySelector('.btn-checkout');
checkoutButton.addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`Order placed! Total: ₹${total.toLocaleString()}`, 'success');
    cart = [];
    updateCart();
    cartSidebar.classList.remove('open');
});

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        background: ${type === 'success' ? '#51CF66' : type === 'warning' ? '#FFD43B' : '#FF6B6B'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Table Reservation
const reserveButtons = document.querySelectorAll('.btn-reserve:not(:disabled)');
reserveButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tableCard = button.closest('.table-card');
        const tableNumber = tableCard.querySelector('.table-number').textContent;
        
        if (button.textContent === 'Reserve') {
            tableCard.classList.remove('available');
            tableCard.classList.add('reserved');
            tableCard.querySelector('.table-status').textContent = 'Reserved';
            button.textContent = 'Cancel';
            button.style.background = '#FFD43B';
            showNotification(`${tableNumber} reserved successfully!`, 'success');
        } else {
            tableCard.classList.remove('reserved');
            tableCard.classList.add('available');
            tableCard.querySelector('.table-status').textContent = 'Available';
            button.textContent = 'Reserve';
            button.style.background = '';
            showNotification(`${tableNumber} reservation cancelled!`, 'warning');
        }
    });
});

// Order Processing
const processButtons = document.querySelectorAll('.btn-process');
processButtons.forEach(button => {
    button.addEventListener('click', () => {
        const orderCard = button.closest('.order-card');
        const orderStatus = orderCard.querySelector('.order-status');
        const currentStatus = orderStatus.textContent.trim();
        
        if (currentStatus === 'Pending') {
            orderStatus.textContent = 'Preparing';
            orderStatus.className = 'order-status status-preparing';
            button.textContent = 'Ready';
            showNotification('Order is being prepared!', 'success');
        } else if (currentStatus === 'Preparing') {
            orderStatus.textContent = 'Ready';
            orderStatus.className = 'order-status status-ready';
            button.textContent = 'Complete';
            showNotification('Order is ready!', 'success');
        } else if (currentStatus === 'Ready') {
            orderCard.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => {
                orderCard.remove();
                showNotification('Order completed!', 'success');
            }, 500);
        }
    });
});

// Add fadeOut animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100px);
        }
    }
`;
document.head.appendChild(fadeOutStyle);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Initialize
updateCart();
