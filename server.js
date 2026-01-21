require("dotenv").config();

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const session = require("express-session");
const methodOverride = require("method-override");

const connectDB = require("./config/db");

const MongoStorePkg = require("connect-mongo");
const MongoStore = MongoStorePkg.default || MongoStorePkg;

const publicRoutes = require("./routes/public.routes");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const adminRoutes = require("./routes/admin.routes");
app.use(adminRoutes);

connectDB(process.env.MONGO_URI);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


app.use(helmet());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "luxury-restaurant-secret",
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: "luxury_restaurant",
      collectionName: "sessions",
    }),

    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

app.use((req, res, next) => {
  // admin flag (update later when login implemented)
  res.locals.isAdmin = !!req.session.isAdmin;

  // cart default
  const cart = req.session.cart || { totalQty: 0, totalPrice: 0, items: {} };
  res.locals.cart = cart;

  // cart count badge
  const items = cart.items || {};
  res.locals.cartCount = Object.values(items).reduce(
    (sum, item) => sum + (item.qty || 0),
    0
  );

  next();
});

app.use("/", publicRoutes);

app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});
