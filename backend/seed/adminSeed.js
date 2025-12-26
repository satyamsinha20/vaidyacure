const mongoose = require("mongoose");
const Admin = require("../models/Admin");
require("dotenv").config({ path: "../.env" });

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Admin.create({
      name: "Satyam Sinha",
      email: "admin@vaidya.com",
      password: "123456",
      userPin: "9999",
    });

    console.log("Admin Seeded Successfully");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
