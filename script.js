// Active link highlight
const links = document.querySelectorAll(".nav-link");
links.forEach((link) => {
  link.addEventListener("click", () => {
    links.forEach((l) => l.classList.remove("text-primary", "font-semibold"));
    link.classList.add("text-primary", "font-semibold");
  });
});

//  Fixed Auto Slide Banner
let slideIndex = 1;
const totalSlides = 4;

// get banner container (to scroll inside it)
const bannerContainer = document.querySelector("#banner");

setInterval(() => {
  slideIndex++;
  if (slideIndex > totalSlides) slideIndex = 1;

  const slide = document.querySelector(`#slide${slideIndex}`);

  if (bannerContainer && slide) {
    // Only scroll horizontally inside the banner — not the whole page
    bannerContainer.scrollTo({
      left: slide.offsetLeft,
      behavior: "smooth",
    });
  }
}, 5000);

// === Categories (with "All Products") ===
const categories = [
  {
    id: 0,
    category: "All Products",
    value: "all",
    category_icon: "https://cdn-icons-png.flaticon.com/512/992/992651.png",
  },
  {
    id: 1,
    category: "Men's Clothing",
    value: "men's clothing",
    category_icon: "https://cdn-icons-png.flaticon.com/512/892/892458.png",
  },
  {
    id: 2,
    category: "Women's Clothing",
    value: "women's clothing",
    category_icon: "https://cdn-icons-png.flaticon.com/512/892/892431.png",
  },
  {
    id: 3,
    category: "Jewelery",
    value: "jewelery",
    category_icon: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
  },
  {
    id: 4,
    category: "Electronics",
    value: "electronics",
    category_icon: "https://cdn-icons-png.flaticon.com/512/564/564441.png",
  },
];

const categoryButtons = document.getElementById("category-buttons");
const productContainer = document.getElementById("product-container");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const modalMessage = document.getElementById("modal-message");
const modalCheckbox = document.getElementById("notify-modal");
const couponInput = document.getElementById("coupon-input");
const applyCouponBtn = document.getElementById("apply-coupon");
const couponMessage = document.getElementById("coupon-message");
const grandTotal = document.getElementById("grand-total");
const totalMoney = document.getElementById("totalMoney");
const addMoneyBtn = document.getElementById("add-money-btn");
const checkOutBtn = document.getElementById("checkOutBtn");
const modalSubtext = document.getElementById("modal-subtext");

// === Render Category Buttons ===
categoryButtons.innerHTML = categories
  .map(
    (c, index) => `
    <button data-category="${c.value}"
      class="category-btn flex items-center bg-white shadow-md hover:shadow-lg text-gray-700 py-2 px-4 
      rounded-lg transition duration-300 hover:bg-primary hover:text-white gap-2 
      ">
      <img src="${c.category_icon}"  class="w-5 h-5">
      <span>${c.category}</span>
    </button>
  `
  )
  .join("");

// === Fetch and Display Products ===
let allProducts = [];
let currentProducts = []; // store currently displayed (filtered) products
let cart = [];

fetch("https://fakestoreapi.com/products")
  .then((res) => res.json())
  .then((data) => {
    allProducts = data;
    currentProducts = data;
    displayProducts(allProducts);
  })
  .catch((err) => console.error("Error fetching products:", err));

// === Function to Display Products ===
function displayProducts(products) {
  if (products.length === 0) {
    productContainer.innerHTML = `
      <div class="col-span-full text-center text-gray-500 py-10">
        <p class="text-lg font-semibold">No products found 😢</p>
      </div>`;
    return;
  }

  productContainer.innerHTML = products
    .map(
      (product) => `
  <div data-id="${product.id}" id="product-${
        product.id
      }" class="productCard bg-base-100 shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 hover:scale-105 duration-500 rounded-xl overflow-hidden border border-gray-200 flex flex-col h-[460px]">
    <!-- Image -->
    <figure class="relative h-1/2 bg-gray-50 flex items-center justify-center p-2">
      <img src="${product.image}" alt="${
        product.title
      }" class="object-contain w-full h-full">
      <span class="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-lg uppercase">
        ${product.category}
      </span>
    </figure>

    <!-- Body -->
    <div class="card-body p-3 flex flex-col justify-between flex-1">
      <h2 class="card-title text-sm md:text-base font-semibold line-clamp-2 flex items-center justify-between">
        ${product.title}
        <div class="badge badge-secondary text-xs py-1 px-2">NEW</div>
      </h2>

      <div>
        <div class="rating rating-sm mt-1">
        ${Array.from(
          { length: 5 },
          (_, i) => `
          <input type="radio" name="rating-${
            product.id
          }" class="mask mask-star-2 bg-yellow-400" ${
            i < Math.round(product.rating.rate) ? "checked" : ""
          } disabled />
        `
        ).join("")}
      </div>

      <p class="text-gray-800 font-bold text-base mt-1">$${product.price}</p>

      <div class="card-actions justify-between mt-3">
        <button id="add-${product.id}" data-id="${
        product.id
      }" class="add-to-cart border border-black w-full bg-white py-2 font-bold shadow-md transition-all duration-500 hover:bg-black hover:text-white">
          Add to Cart
        </button>
      </div>
      </div>
    </div>
  </div>
`
    )
    .join("");

  // Add click event listeners to "Add to Cart" buttons
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = parseInt(e.target.dataset.id);
      addToCart(productId);
    });
  });
  const productCards = document.querySelectorAll(".productCard");
  productCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // 🧠 Prevent "Add to Cart" button clicks from triggering modal
      if (e.target.classList.contains("add-to-cart")) return;

      const productId = parseInt(card.dataset.id);
      showProductDetails(productId);
    });
  });
}

// === Category Filter Logic ===
categoryButtons.addEventListener("click", (e) => {
  const button = e.target.closest(".category-btn");
  if (!button) return;

  const selectedCategory = button.dataset.category;

  // Highlight active button
  document
    .querySelectorAll(".category-btn")
    .forEach((btn) => btn.classList.remove("bg-blue-700", "text-white"));
  button.classList.add("bg-blue-700", "text-white");

  // Filter products
  const filtered =
    selectedCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  displayProducts(filtered);
});

// === Price Sorting Logic ===
document.getElementById("low-to-high").addEventListener("click", (e) => {
  e.preventDefault();
  const sorted = [...currentProducts].sort((a, b) => a.price - b.price);
  displayProducts(sorted);
});

document.getElementById("high-to-low").addEventListener("click", (e) => {
  e.preventDefault();
  const sorted = [...currentProducts].sort((a, b) => b.price - a.price);
  displayProducts(sorted);
});

// === Cart Functions ===
function addToCart(product_id) {
  const existing = cart.find((p) => p.id === product_id);
  if (existing) {
    alert("Item already in cart!");
    return;
  }

  let item = currentProducts.find((p) => p.id === product_id);
  cart.push(item);
  const button = document.getElementById(`add-${product_id}`);
  button.disabled = true;
  button.textContent = "Added ✅";
  button.classList.add("btn-disabled");

  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter((p) => p.id !== id);

  // Re-enable button
  const button = document.getElementById(`add-${id}`);
  if (button) {
    button.disabled = false;
    button.textContent = "Add to Cart";
    button.classList.remove("btn-disabled");
  }
  //  Show modal message (reusable)
  showModal(
    " product has been removed from your cart.",
    " Your cart has been updated."
  );
  updateCartUI();
}

function updateCartUI() {
  cartItemsContainer.innerHTML = cart
    .map(
      (p) => `
      <div class="flex justify-between items-center bg-base-100 p-2 rounded-lg shadow-sm">
        <div class="flex gap-2 items-center">
        <div class="h-12 w-12">
        <img src="${p.image}" alt="${
        p.title
      }" class="w-full h-full object-contain ">
        </div>
         <div>
          <p class="font-medium">${p.title}</p>
          <p class="text-sm text-gray-500">$${p.price.toFixed(2)}</p>
         </div>
        </div>
        <button onclick="removeFromCart(${
          p.id
        })" class="btn btn-xs btn-error text-white">Remove</button>
      </div>
    `
    )
    .join("");

  const total = cart.reduce((sum, p) => sum + p.price, 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartCount.textContent = cart.length;
  grandTotal.textContent = `$${total.toFixed(2)}`;
  updateTotals();
}

// Update Total & Grand Total
function updateTotals() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;

  let grand = total;
  if (discountApplied) {
    grand = total * 0.9; // 10% discount
  }

  grandTotal.textContent = `$${grand.toFixed(2)}`;
}

// Apply Coupon
applyCouponBtn.addEventListener("click", () => {
  const code = couponInput.value.trim().toUpperCase();

  if (code === "SMART10") {
    discountApplied = true;
    couponMessage.textContent = "🎉 Coupon applied! 10% discount granted.";
    showModal(
      "🎉 Coupon applied! 10% discount granted.",
      " Your price has been updated."
    );
    couponInput.value = "";
  } else {
    discountApplied = false;
    couponMessage.textContent = "❌ Invalid coupon code.";
    showModal("❌ Invalid coupon code.", "try again.");
    couponInput.value = "";
  }

  updateTotals();
});

// Initial money
let money = 0;

// Add money button
addMoneyBtn.addEventListener("click", () => {
  money += 1000;
  totalMoney.textContent = `$${money.toFixed(2)}`;
  showModal(" Money added successfully!", " Your balance has been updated.");
});

// Checkout button
checkOutBtn.addEventListener("click", () => {
  // Get grand total as number
  const grandTotalValue = parseFloat(
    document.getElementById("grand-total").textContent.replace("$", "")
  );
  if (cart.length === 0) {
    showModal(
      "❌ Your cart is empty!",
      " Please add some products to checkout."
    );
    return;
  }

  if (money < grandTotalValue) {
    showModal(
      "❌ Sorry! You don't have enough money to checkout.",
      " Please add more money."
    );
  } else {
    money -= grandTotalValue;
    totalMoney.textContent = `$${money.toFixed(2)}`;
    const buttons = document.querySelectorAll(".add-to-cart");
    buttons.forEach((button) => {
      button.disabled = false;
      button.textContent = "Add to Cart";
      button.classList.remove("btn-disabled");
    });
    showModal(
      "✅ Checkout successful! Your cart has been cleared.",
      "thank you for shopping with us."
    );
    cart = [];
    updateCartUI();
  }
});

// === Fetch and Display Customer Reviews ===
async function loadReviews() {
  try {
    const response = await fetch("reviews.json"); // make sure path is correct
    const reviews = await response.json();
    displayReviews(reviews);
  } catch (error) {
    console.error("Error loading reviews:", error);
  }
}

function displayReviews(reviews) {
  const container = document.getElementById("reviews-container");

  container.innerHTML = reviews
    .map(
      (r) => `
      <div class="card bg-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-2xl">
        <div class="card-body items-start text-left space-y-3">
          <!-- User Info -->
          <div class="flex items-center gap-4">
            <img src="${r.image}" alt="${
        r.name
      }" class="w-16 h-16 rounded-full border-2 border-primary object-cover" />
            <div>
              <h3 class="font-semibold text-lg text-gray-800">${r.name}</h3>
              <p class="text-sm text-gray-500">${r.profession}</p>
              <p class="text-xs text-gray-400">${new Date(
                r.date
              ).toDateString()}</p>
            </div>
          </div>

          <!-- Review Text -->
          <p class="text-gray-600 text-sm leading-relaxed italic">"${
            r.review
          }"</p>

          <!-- Rating -->
          <div class="rating rating-sm">
            ${Array.from({ length: r.rating })
              .map(
                (_, i) => `
                <input type="radio" name="rating-${
                  r.id
                }" class="mask mask-star-2 bg-yellow-400" ${
                  i < r.rating ? "checked" : ""
                } disabled />
              `
              )
              .join("")}
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// Load reviews on page load
loadReviews();

//  Contact Form Validation and Message Display
const contactForm = document.getElementById("contactForm");
const thankYouMessage = document.getElementById("thankYouMessage");

contactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  // Basic Validation
  if (name === "" || email === "" || message === "") {
    showModal("Please fill out all fields!", "try again.");
    return;
  }

  // Simple Email Validation
  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!email.match(emailPattern)) {
    showModal("Please enter a valid email address!", "try again.");
    return;
  }

  // Display Thank You Message
  thankYouMessage.textContent = "Thank you for your message!";
  showModal("Thank you for your message!", "We will get back to you soon.");
});

// Reusable Modal Function
function showModal(message, subtext) {
  modalMessage.textContent = message;
  modalCheckbox.checked = true;

  if (subtext) {
    modalSubtext.textContent = subtext;
  }
}

//show product details modal

function showProductDetails(productId) {
  const product = currentProducts.find((p) => p.id === productId);

  // Fill modal with product details
  document.getElementById("modal-image").src = product.image;
  document.getElementById("modal-title").textContent = product.title;
  document.getElementById(
    "modal-category"
  ).textContent = `Category: ${product.category}`;
  document.getElementById("modal-description").textContent =
    product.description || "No description available.";
  document.getElementById(
    "modal-price"
  ).textContent = `Price: $${product.price.toFixed(2)}`;

  // Handle "Add to Cart" from modal
  const modalAddBtn = document.getElementById("modal-add-to-cart");
  modalAddBtn.onclick = () => {
    addToCart(productId);
    document.getElementById("product-details-modal").checked = false; // Close modal after adding
  };

  // Open modal
  document.getElementById("product-details-modal").checked = true;
}

// Make removeFromCart globally accessible
window.removeFromCart = removeFromCart;
