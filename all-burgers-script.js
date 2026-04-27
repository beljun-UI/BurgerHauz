document.addEventListener('DOMContentLoaded', () => {

    // CRITICAL: Console log to confirm this script is successfully loaded and running
    console.log("all-burgers-script.js loaded and DOM is ready.");

    /* --- MODAL LOGIC FOR ALL-BURGERS.HTML --- */

    // Get product modal elements
    const modal = document.getElementById('productModal');
    if (!modal) {
        console.error("CRITICAL ERROR: Modal element (#productModal) not found.");
        return;
    }

    const closeBtn = document.querySelector('#productModal .close-btn');

    // Failsafe check for modal elements
    const modalTitle = document.getElementById('modal-product-title');
    if (!modalTitle) {
        console.error("CRITICAL ERROR: Modal title element not found.");
        return;
    }

    // Product Modal content elements
    const modalDesc = document.getElementById('modal-product-description');
    const modalImage = document.getElementById('modal-product-image');
    const modalPriceDisplay = document.getElementById('modal-product-price-display');
    const qtyInput = document.getElementById('qty-input');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');
    const cartCountElement = document.querySelector('.cart-count'); 

    // --- Success Modal Elements (Item Added) ---
    const successModal = document.getElementById('successModal');
    const successCloseBtns = document.querySelectorAll('#successModal .success-close-btn');
    const successMessageElement = document.getElementById('success-message');
    const viewCartBtn = document.getElementById('viewCartBtn');
    
    // --- Cart Sidebar Elements ---
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const headerCartIcon = document.querySelector('.menu-icon-btn.cart-icon'); 
    
    // --- NEW Checkout Success Modal Elements ---
    const checkoutSuccessModal = document.getElementById('checkoutSuccessModal');
    const checkoutSuccessCloseBtn = document.getElementById('checkoutSuccessCloseBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    // ------------------------------------

    let currentBasePrice = 0;
    let currentProductId = null; 
    let currentProductName = null; 
    let currentProductImg = null; 
    
    // Function to update the total price based on quantity (for the product modal)
    function updateTotalPrice() {
        const qty = parseInt(qtyInput.value);
        if (isNaN(currentBasePrice)) return;
        const totalPrice = (currentBasePrice * qty).toFixed(2);
        modalPriceDisplay.textContent = `₱${totalPrice}`;
    }

    // --- NEW CENTRALIZED SCROLL MANAGEMENT FUNCTION (FIXED) ---
    function manageBodyScroll() {
        // Check all potential elements that block the main view
        const isProductModalOpen = modal.style.display === 'flex'; // Check for 'flex'
        const isSuccessModalOpen = successModal.style.display === 'block';
        const isCheckoutSuccessModalOpen = checkoutSuccessModal.style.display === 'block';
        const isCartSidebarOpen = cartSidebar.classList.contains('open');

        const isAnyModalOpen = isProductModalOpen || isSuccessModalOpen || isCheckoutSuccessModalOpen || isCartSidebarOpen;

        if (isAnyModalOpen) {
            // Apply the 'no-scroll' CSS class to both html and body
            document.body.classList.add('no-scroll');
            document.documentElement.classList.add('no-scroll'); // Targets the html element
        } else {
            // Remove the 'no-scroll' CSS class from both html and body
            document.body.classList.remove('no-scroll');
            document.documentElement.classList.remove('no-scroll'); // Targets the html element
        }
    }
    // ----------------------------------------------------

    // --- Core function to open and populate the product modal ---
    function openModalWithData(btn) {
        const productCard = btn.closest('.product-card');
        if (!productCard) return;

        const name = productCard.getAttribute('data-name');
        const desc = productCard.getAttribute('data-desc');
        const price = parseFloat(productCard.getAttribute('data-price'));
        const img = productCard.getAttribute('data-img'); 
        const id = productCard.getAttribute('data-id');

        modalTitle.textContent = name;
        modalDesc.textContent = desc;
        modalImage.src = img;
        modalImage.alt = name;

        currentProductId = id;
        currentProductName = name;
        currentBasePrice = price;
        currentProductImg = img; 
        
        qtyInput.value = 1;
        updateTotalPrice();

        // FIX: Set display to 'flex' for CSS centering to work
        modal.style.display = 'flex'; 
        manageBodyScroll(); 
    }

    // --- ITEM ADDED SUCCESS MODAL FUNCTIONS ---

    function showSuccessModal(productName, quantity) {
        successMessageElement.textContent = `${quantity} x ${productName} successfully added to your order!`;
        successModal.style.display = 'block';
        manageBodyScroll();
    }
    
    function closeSuccessModal() {
        successModal.style.display = 'none';
        manageBodyScroll();
    }
    
    // --- NEW CHECKOUT SUCCESS MODAL FUNCTIONS ---

    function showCheckoutSuccessModal() {
        closeCartSidebar(); // Ensure cart sidebar is closed
        checkoutSuccessModal.style.display = 'block';
        manageBodyScroll();
    }

    function closeCheckoutSuccessModal() {
        checkoutSuccessModal.style.display = 'none';
        manageBodyScroll();
    }


    // === CART MANAGEMENT FUNCTIONS ===

    // 1. Load cart from Local Storage
    function loadCart() {
        const cartString = localStorage.getItem('burgerHauzCart');
        return cartString ? JSON.parse(cartString) : [];
    }

    // 2. Save cart to Local Storage
    function saveCart(cart) {
        localStorage.setItem('burgerHauzCart', JSON.stringify(cart));
    }

    // 3. Clear Cart (NEW FUNCTION)
    function clearCart() {
        localStorage.removeItem('burgerHauzCart');
        // Force update UI after clearing
        updateCartCountDisplay([]); 
        renderCart(); 
        console.log("Cart cleared from Local Storage.");
    }

    // 4. Update the cart count badge on the header
    function updateCartCountDisplay(cart) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    // 5. Main logic to add/update an item in the cart
    function addToCart(id, name, basePrice, quantity, img) { 
        let cart = loadCart();
        const existingItemIndex = cart.findIndex(item => item.id === id);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ id: id, name: name, basePrice: basePrice, quantity: quantity, img: img }); 
        }
        
        saveCart(cart);
        updateCartCountDisplay(cart);
        console.log(`Item added to cart: ${quantity} x ${name}. Current cart state:`, cart);
        return quantity;
    }
    
    // 6. Calculate Cart Total (For the sidebar)
    function calculateCartTotal(cart) {
        return cart.reduce((total, item) => total + (item.basePrice * item.quantity), 0).toFixed(2);
    }

    // 7. Main logic to remove an item from the cart
    function removeFromCart(id) {
        let cart = loadCart();
        cart = cart.filter(item => item.id !== id);
        saveCart(cart);
        updateCartCountDisplay(cart);
        renderCart(); 
        console.log(`Item ID ${id} removed from cart.`);
    }

    // 8. Main logic to change an item's quantity in the cart
    function changeCartItemQuantity(id, change) {
        let cart = loadCart();
        const existingItemIndex = cart.findIndex(item => item.id === id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += change;
            
            if (cart[existingItemIndex].quantity <= 0) {
                cart.splice(existingItemIndex, 1);
            }
            saveCart(cart);
            updateCartCountDisplay(cart);
            renderCart();
            console.log(`Item ID ${id} quantity changed by ${change}.`);
        }
    }
    
    // 9. Render Cart Sidebar Content
    function renderCart() {
        const cart = loadCart();
        cartItemsContainer.innerHTML = ''; 

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutBtn.disabled = true;
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutBtn.disabled = false;

            cart.forEach(item => {
                const itemTotal = (item.basePrice * item.quantity).toFixed(2);
                const cartItemHTML = `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.img}" alt="${item.name}" class="cart-item-image"> 
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">₱${itemTotal} (@ ₱${item.basePrice.toFixed(2)})</div>
                            <div class="cart-item-controls">
                                <div class="item-quantity-control">
                                    <button class="item-qty-btn qty-minus-btn" data-id="${item.id}">-</button>
                                    <span class="item-qty-value">${item.quantity}</span>
                                    <button class="item-qty-btn qty-plus-btn" data-id="${item.id}">+</button>
                                </div>
                                <button class="remove-item-btn" data-id="${item.id}" title="Remove Item">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
            });
        }
        
        const total = calculateCartTotal(cart);
        cartTotalPrice.textContent = `₱${total}`;
    }

    // 10. CART SIDEBAR OPEN/CLOSE FUNCTIONS
    function openCartSidebar() {
        renderCart(); 
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
        manageBodyScroll(); 
    }

    function closeCartSidebar() {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('active');
        manageBodyScroll();
    }


    // === EVENT LISTENERS ===

    // 1. Product Card Click (Delegation)
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.product-card'); // Note: targeting the card itself to open the modal
        if (btn) {
            openModalWithData(btn);
        }
    });

    // 2. Product Modal Close
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        manageBodyScroll();
    });
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            manageBodyScroll();
        }
    });

    // 3. Quantity controls logic
    qtyMinus.addEventListener('click', () => {
        let qty = parseInt(qtyInput.value);
        if (qty > 1) {
            qtyInput.value = qty - 1;
            updateTotalPrice();
        }
    });
    qtyPlus.addEventListener('click', () => {
        let qty = parseInt(qtyInput.value);
        qtyInput.value = qty + 1;
        updateTotalPrice();
    });

    // 4. Add to Cart handler
    modalAddToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(qtyInput.value);

        if (currentProductId && currentProductName && currentBasePrice && currentProductImg) {
            addToCart(currentProductId, currentProductName, currentBasePrice, quantity, currentProductImg); 

            modal.style.display = 'none';
            showSuccessModal(currentProductName, quantity);

        } else {
            console.error("Missing product data for cart operation.");
            alert("Error: Could not add item to cart.");
        }
    });

    // 5. Item Added Success Modal Close
    successCloseBtns.forEach(btn => {
        btn.addEventListener('click', closeSuccessModal);
    });
    window.addEventListener('click', (event) => {
        if (event.target === successModal) {
            closeSuccessModal();
        }
    });

    // 6. View Cart button handler
    viewCartBtn.addEventListener('click', () => {
        closeSuccessModal(); 
        openCartSidebar(); 
    });
    
    // 7. Header Cart Icon Click 
    headerCartIcon.addEventListener('click', (e) => {
        e.preventDefault(); 
        openCartSidebar();
    });

    // 8. Sidebar Close (X button and Overlay click)
    cartCloseBtn.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);

    // 9. Item quantity and remove button delegation 
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const removeBtn = target.closest('.remove-item-btn');
        const qtyMinusBtn = target.closest('.qty-minus-btn');
        const qtyPlusBtn = target.closest('.qty-plus-btn');

        if (removeBtn) {
            const itemId = removeBtn.dataset.id;
            removeFromCart(itemId);
        } else if (qtyMinusBtn) {
            const itemId = qtyMinusBtn.dataset.id;
            changeCartItemQuantity(itemId, -1);
        } else if (qtyPlusBtn) {
            const itemId = qtyPlusBtn.dataset.id;
            changeCartItemQuantity(itemId, 1);
        }
    });

    // 10. CHECKOUT BUTTON HANDLER (UPDATED)
    checkoutBtn.addEventListener('click', () => {
        const cart = loadCart();
        if (cart.length > 0) {
            // 1. Clear the cart data from Local Storage
            clearCart(); 
            
            // 2. Display the success message
            showCheckoutSuccessModal();
           
        }
    });

    // 11. CHECKOUT SUCCESS MODAL CLOSING
    checkoutSuccessCloseBtn.addEventListener('click', closeCheckoutSuccessModal);
    continueShoppingBtn.addEventListener('click', closeCheckoutSuccessModal);
    window.addEventListener('click', (event) => {
        if (event.target === checkoutSuccessModal) {
            closeCheckoutSuccessModal();
        }
    });
    
    // Initialize cart count on page load
    updateCartCountDisplay(loadCart());
});