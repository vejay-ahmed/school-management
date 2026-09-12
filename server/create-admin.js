const mongoose = require("mongoose");
const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect("mongodb://localhost:27017/school_management");
    console.log("Connected to MongoDB");

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: "admin@school.com" });
    if (existingAdmin) {
      console.log("Admin already exists");
      console.log("Email: admin@school.com");
      console.log("Password: admin123");
      return;
    }

    // Create admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@school.com",
      password: "admin123",
      role: "admin",
      phone: "1234567890"
    });

    await admin.save();
    console.log("Admin created successfully!");
    console.log("Email: admin@school.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
