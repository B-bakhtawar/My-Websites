const express = require("express");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { title: "Admin Login", error: "" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) return res.render("login", { title: "Admin Login", error: "Invalid credentials." });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.render("login", { title: "Admin Login", error: "Invalid credentials." });

  req.session.adminId = admin._id.toString();
  res.redirect("/admin");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
