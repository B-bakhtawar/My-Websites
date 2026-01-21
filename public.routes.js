const express = require("express");
const router = express.Router();
const MENU = require("../data/menu");
console.log("✅ public.routes.js loaded");
const Reservation = require("../models/Reservation");
const Message = require("../models/Message");

function getCart(req) {
  if (!req.session.cart) {
    req.session.cart = { items: {}, totalQty: 0, totalPrice: 0 };
  }
  return req.session.cart;
}

/* Pages */
router.get("/", (req, res) =>
  res.render("index", {
    title: "Home",
    activePage: "home",
    cart: getCart(req),
    cartCount: getCart(req).totalQty,
  })
);

router.get("/menu", (req, res) =>
  res.render("menu", {
    title: "Menu",
    activePage: "menu",
    items: MENU,
    cart: getCart(req),
    cartCount: getCart(req).totalQty,
  })
);

router.get("/offers", (req, res) =>
  res.render("offers", {
    title: "Special Offers",
    activePage: "offers",
    cart: getCart(req),
    cartCount: getCart(req).totalQty,
  })
);
const Order = require("../models/Order");

router.post("/checkout", async (req, res) => {
  try {
    console.log("✅ POST /checkout", req.body);

    const cart = req.session.cart;
    if (!cart || cart.totalQty === 0) return res.redirect("/cart");

    const { fullName, phone, address } = req.body;

    const items = Object.values(cart.items).map(i => ({
      name: i.name,
      price: i.price,
      qty: i.qty,
    }));

    const order = await Order.create({
      fullName,
      phone,
      address,
      items,
      totalQty: cart.totalQty,
      totalPrice: cart.totalPrice,
    });

    console.log("✅ Order saved:", order._id);

    req.session.cart = null;

    res.render("checkout", {
      title: "Checkout",
      ok: true,
      cart: null,
      cartItems: [],
      cartCount: 0,
    });
  } catch (err) {
    console.error("❌ Order error:", err);
    res.status(500).send("Checkout failed");
  }
});

router.get("/experience", (req, res) =>
  res.render("experience", {
    title: "Experiences",
    activePage: "experience",
    cart: getCart(req),
    cartCount: getCart(req).totalQty,
  })
);

router.get("/events", (req, res) =>
  res.render("events", {
    title: "Events",
    activePage: "events",
    cart: getCart(req),
    cartCount: getCart(req).totalQty,
  })
);

router.get("/contact", (req, res) =>
  res.render("contact", {
    title: "Contact",
    activePage: "contact",
    cart: getCart(req),
    cartCount: getCart(req).totalQty,
    ok: false,
  })
);
router.post("/contact", async (req, res) => {
  try {
    // log the incoming request body to check the data
    console.log("✅ contact form body =", req.body);

    // create and save the contact message
    const message = await Message.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || "",  // optional field
      message: req.body.message,
    });

    console.log("✅ Message saved:", message._id);

    // After saving, redirect to a confirmation page or show a success message
    res.render("contact", {
      title: "Contact",
      ok: true,    // Display success on the page
      cart: getCart(req),
    });
  } catch (err) {
    console.error("❌ Contact message save error:", err);
    res.status(500).send("Error saving contact message.");
  }
});

router.get("/reservation", (req, res) =>
  res.render("reservation", {
    title: "Reserve Table",
    activePage: "reservation",
    cart: getCart(req),
    cartCount: getCart(req).totalQty,
    ok: false,
  })
);

router.get("/cart", (req, res) =>
  res.render("cart", {
    title: "Your Cart",
    activePage: "cart",
    cart: getCart(req),
    cartCount: getCart(req).totalQty,
  })
);

/* Cart pages */
router.get("/cart", (req, res) => res.render("cart", { title: "Your Cart", cart: getCart(req) }));
router.get("/checkout", (req, res) => {
  const cart = getCart(req);

  const cartItems = Object.values(cart.items || {}).map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    qty: i.qty,
  }));

  res.render("checkout", {
    title: "Checkout",
    activePage: "checkout",
    cart,
    cartItems,
    cartCount: cart.totalQty,
    ok: false,
  });
});


/* ✅ Add to cart (FIXED) */
router.post("/cart/add/:id", (req, res) => {
  const cart = getCart(req);
  const item = MENU.find((i) => i.id === req.params.id);
  if (!item) return res.redirect("/menu");

  if (!cart.items[item.id]) {
    cart.items[item.id] = { ...item, qty: 0 };
  }

  cart.items[item.id].qty += 1;
  cart.totalQty += 1;
  cart.totalPrice += item.price;

  // ✅ ONLY ONE redirect 
  const backURL = req.get("referer");
  return res.redirect(backURL || "/menu");
});

/* ✅ Increase quantity */
router.post("/cart/inc/:id", (req, res) => {
  const cart = getCart(req);
  const id = req.params.id;

  if (!cart.items[id]) return res.sendStatus(404);

  cart.items[id].qty += 1;
  cart.totalQty += 1;
  cart.totalPrice += cart.items[id].price;

  return res.json({
    success: true,
    totalQty: cart.totalQty,
    totalPrice: cart.totalPrice,
    itemQty: cart.items[id].qty,
  });
});

/* ✅ Decrease quantity */
router.post("/cart/dec/:id", (req, res) => {
  const cart = getCart(req);
  const id = req.params.id;

  if (!cart.items[id]) return res.sendStatus(404);

  cart.items[id].qty -= 1;
  cart.totalQty -= 1;
  cart.totalPrice -= cart.items[id].price;

  // remove item if qty becomes 0
  if (cart.items[id].qty <= 0) {
    delete cart.items[id];
    return res.json({
      success: true,
      removed: true,
      totalQty: cart.totalQty,
      totalPrice: cart.totalPrice,
    });
  }

  return res.json({
    success: true,
    totalQty: cart.totalQty,
    totalPrice: cart.totalPrice,
    itemQty: cart.items[id].qty,
  });
});

/* Remove item */
router.post("/cart/remove/:id", (req, res) => {
  const cart = getCart(req);
  const item = cart.items[req.params.id];

  if (item) {
    cart.totalQty -= item.qty;
    cart.totalPrice -= item.qty * item.price;
    delete cart.items[req.params.id];
  }

  return res.redirect("/cart");
});




router.post("/reservation", async (req, res) => {
  try {
    console.log("✅ POST /reservation", req.body);
console.log("✅ reservation body =", req.body);
    const { name, phone, date, time, guests, notes } = req.body;

    const reservation = await Reservation.create({
      name,
      phone,
      date,
      time,
      guests,
      notes,
    });

    console.log("✅ Reservation saved:", reservation._id);

    res.render("reservation", {
      title: "Reservation",
      ok: true,
      cart: getCart(req),
    });
  } catch (err) {
    console.error("❌ Reservation save error:", err);
    res.status(500).send("Reservation failed");
  }
});




/* Checkout submit (later we will save to MongoDB) */
router.post("/checkout", async (req, res) => {
  try {
    const cart = getCart(req);
    if (!cart.totalQty) return res.redirect("/cart");

    const { fullName, phone, address } = req.body;

    const items = Object.values(cart.items).map((i) => ({
      name: i.name,
      price: i.price,
      qty: i.qty,
    }));

    const order = await Order.create({
      fullName,
      phone,
      address,
      items,
      totalQty: cart.totalQty,
      totalPrice: cart.totalPrice,
      status: "Placed",
    });

    console.log("✅ Order saved:", order._id);

    // clear cart
    req.session.cart = { items: {}, totalQty: 0, totalPrice: 0 };

    return res.render("checkout", {
      title: "Checkout",
      activePage: "checkout",
      cart: req.session.cart,
      cartItems: [],
      cartCount: 0,
      ok: true,
    });
  } catch (err) {
    console.error("❌ Order save error:", err);

    const cart = getCart(req);
    return res.render("checkout", {
      title: "Checkout",
      activePage: "checkout",
      cart,
      cartItems: Object.values(cart.items || {}),
      cartCount: cart.totalQty,
      ok: false,
      error: "Order failed. Please try again.",
    });
  }
});

/* =========================
   AUTH (simple admin login)
========================= */

// show login page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", cart: getCart(req), error: null });
});

// handle login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // change these to whatever you want
  const ADMIN_EMAIL = "admin@grand.com";
  const ADMIN_PASSWORD = "admin123";

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect("/admin");
  }

  return res.status(401).render("login", {
    title: "Login",
    cart: getCart(req),
    error: "Invalid email or password",
  });
});

// logout
router.post("/logout", (req, res) => {
  req.session.isAdmin = false;
  return res.redirect("/");
});

// admin page (simple)
router.get("/admin", (req, res) => {
  if (!req.session.isAdmin) return res.redirect("/login");
  res.send("<h1>Admin Panel (coming soon)</h1><p><a href='/'>Go Home</a></p>");
});

module.exports = router;



