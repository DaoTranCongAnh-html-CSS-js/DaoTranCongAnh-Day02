const CART_KEY = 'minishop_cart';

const PRODUCTS = {
    mouse: { name: 'Chuột Logitech', price: 499000, image: 'images/sp01.png' },
    keyboard: { name: 'Bàn phím cơ', price: 899000, image: 'images/sp02.png' },
    headphones: { name: 'Tai nghe Bluetooth', price: 699000, image: 'images/sp03.png' },
    laptop: { name: 'Laptop ASUS Vivobook', price: 18990000, image: 'images/sp04.png' }
};

// 1. Tien ich
const formatPrice = (price) => `${price.toLocaleString('vi-VN')}đ`;

// 2. Gio hang
function getCart() {
    const savedCart = localStorage.getItem(CART_KEY);
    if (!savedCart) {
        return [];
    }

    const cart = JSON.parse(savedCart);
    if (!Array.isArray(cart)) {
        throw new TypeError('Dữ liệu giỏ hàng không hợp lệ.');
    }
    return cart.filter((item) =>
        item &&
        Object.prototype.hasOwnProperty.call(PRODUCTS, item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach((element) => {
        element.textContent = String(count);
    });
}

function addToCart(productId) {
    const cart = getCart();
    const item = cart.find((cartItem) => cartItem.id === productId);

    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    saveCart(cart);
}

function renderCart() {
    const tbody = document.querySelector('#cart-items');
    if (!tbody) {
        return;
    }

    const cart = getCart();
    tbody.replaceChildren();

    cart.forEach((item) => {
        const product = PRODUCTS[item.id];
        const lineTotal = product.price * item.quantity;

        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const priceCell = document.createElement('td');
        const quantityCell = document.createElement('td');
        const totalCell = document.createElement('td');
        const quantityInput = document.createElement('input');

        nameCell.textContent = product.name;
        priceCell.textContent = formatPrice(product.price);
        quantityInput.type = 'number';
        quantityInput.min = '1';
        quantityInput.value = String(item.quantity);
        quantityInput.setAttribute('aria-label', `Số lượng ${product.name}`);
        quantityInput.addEventListener('change', () => {
            const nextQuantity = Math.max(1, Number(quantityInput.value) || 1);
            const nextCart = getCart();
            const currentItem = nextCart.find((cartItem) => cartItem.id === item.id);
            if (currentItem) {
                currentItem.quantity = nextQuantity;
                saveCart(nextCart);
                renderCart();
            }
        });
        quantityCell.append(quantityInput);
        totalCell.textContent = formatPrice(lineTotal);
        row.append(nameCell, priceCell, quantityCell, totalCell);
        tbody.append(row);
    });

    document.querySelector('#cart-total').textContent = formatPrice(calculateCartTotal(cart));
    const message = document.querySelector('#cart-message');
    message.textContent = cart.length ? '' : 'Giỏ hàng đang trống.';
}

function clearCart() {
    if (!window.confirm('Xóa toàn bộ giỏ hàng?')) {
        return;
    }
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCart();
}

function checkout() {
    if (!getCart().length) {
        document.querySelector('#cart-message').textContent = 'Giỏ hàng đang trống.';
        return;
    }

    if (!window.confirm('Xác nhận đặt hàng?')) {
        return;
    }
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCart();
    document.querySelector('#cart-message').textContent = 'Đặt hàng thành công. Cảm ơn bạn!';
}

// 3. Tinh tien
function calculateCartTotal(cart) {
    return cart.reduce((sum, item) => sum + PRODUCTS[item.id].price * item.quantity, 0);
}

// 4. Kiem tra form
function setupForms() {
    document.querySelectorAll('form[data-validate]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!form.reportValidity()) {
                return;
            }
            form.querySelector('.form-message').textContent =
                form.dataset.validate === 'register'
                    ? 'Đăng ký thành công!'
                    : 'Đăng nhập thành công!';
        });
    });

    const contactForm = document.querySelector('#contact-form');
    if (!contactForm) {
        return;
    }

    const message = contactForm.querySelector('#message');
    const feedback = contactForm.querySelector('.form-message');
    message.addEventListener('input', () => {
        if (message.value.trim().length >= 10) {
            feedback.textContent = '';
            feedback.classList.remove('error');
        }
    });
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!contactForm.reportValidity()) {
            return;
        }
        if (message.value.trim().length < 10) {
            feedback.textContent = 'Nội dung liên hệ phải có ít nhất 10 ký tự.';
            feedback.classList.add('error');
            message.focus();
            return;
        }
        feedback.textContent = 'Đã gửi liên hệ thành công!';
        feedback.classList.remove('error');
        contactForm.reset();
    });
}

document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', () => {
        addToCart(button.dataset.addToCart);
        button.textContent = 'Đã thêm vào giỏ';
    });
});

document.querySelector('#clear-cart')?.addEventListener('click', clearCart);
document.querySelector('#checkout')?.addEventListener('click', checkout);
updateCartCount();
renderCart();
setupForms();
