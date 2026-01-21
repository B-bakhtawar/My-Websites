const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

router.get("/register", (req, res) => res.render("register", { title:"Register", error:"", cart: req.session.cart || { totalQty:0 } }));
router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.render("register", { title:"Register", error:"Email already used", cart: req.session.cart || { totalQty:0 } });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, passwordHash });

  req.session.user = { id: user._id.toString(), email: user.email, fullName: user.fullName };
  res.redirect("/menu");
});

router.get("/user-login", (req, res) => res.render("user-login", { title:"Login", error:"", cart: req.session.cart || { totalQty:0 } }));
router.post("/user-login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.render("user-login", { title:"Login", error:"Invalid login", cart: req.session.cart || { totalQty:0 } });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.render("user-login", { title:"Login", error:"Invalid login", cart: req.session.cart || { totalQty:0 } });

  req.session.user = { id: user._id.toString(), email: user.email, fullName: user.fullName };
  res.redirect("/menu");
});

router.post("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/");
});

module.exports = router;
