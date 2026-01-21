require("dotenv").config();
const bcrypt = require("bcrypt");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    const email = "admin@restaurant.com";
    const password = "Admin@123";

    const passwordHash = await bcrypt.hash(password, 10);

    await Admin.deleteMany({ email });
    await Admin.create({ email, passwordHash });

    console.log("✅ Admin created successfully");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
})();
