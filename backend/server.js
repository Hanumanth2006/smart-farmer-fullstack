const express = require("express");
const crypto = require("crypto");
const app = express();
const PORT = 5000;
const crops = require("./crops");
let farmerCrops = [];

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// Allow JSON data
app.use(express.json());

// Home route
app.get("/", (req, res) => {
   res.send("Smart Farmer Backend is Running 🌾");
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        message: "Smart Farmer Backend is Connected! 🌾"
    });
});

// Crops API
app.get("/api/crops", (req, res) => {


    res.json(crops);
});
let users = [];
// Admin Account
const admin = {
    name: "Smart Farmer Admin",
    email: "admin@smartfarmer.com",
    password: "Admin@123"
};
// Store active Admin tokens
const adminTokens = new Set();
// Admin Authentication Middleware
function verifyAdmin(req, res, next) {

    const token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
        return res.status(403).json({
            message: "Admin access denied."
        });
    }

    const actualToken = token.split(" ")[1];

    if (!adminTokens.has(actualToken)) {
        return res.status(403).json({
            message: "Invalid Admin token."
        });
    }

    next();
}
app.post("/api/register", (req, res) => {
    const { name, email, phone, location, password, accountType } = req.body;
const existingUser = users.find(u => u.email === email);

if (existingUser) {
    return res.status(400).json({
        message: "Email already registered. Please login."
    });
}

    users.push({
    name,
    email,
    phone,
    location,
    password,
    accountType
});

    res.json({
        message: "Registration successful! 🌾"
    });
});
app.post("/api/login", (req, res) => {

    const { email, password, accountType } = req.body;

    // Admin Login
    if (accountType === "admin") {

    if (
        email === admin.email &&
        password === admin.password
    ) {

        const token = crypto.randomBytes(32).toString("hex");

        adminTokens.add(token);

        return res.json({
            message: "Admin login successful!",
            token: token,
            user: {
                name: admin.name,
                email: admin.email,
                accountType: "admin"
            }
        });
    }

        return res.status(401).json({
            message: "Invalid admin credentials."
        });
    }

    // Farmer and Buyer Login
    const user = users.find(
        u =>
            u.email === email &&
            u.password === password &&
            u.accountType === accountType
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid email, password, or account type."
        });
    }

    res.json({
        message: "Login successful! 🌾",
        user: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            accountType: user.accountType
        }
    });

});
app.put("/api/profile", (req, res) => {

    const { email, name, phone, location } = req.body;

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({
            message: "User not found."
        });
    }

    user.name = name;
    user.phone = phone;
    user.location = location;

    res.json({
        message: "Profile updated successfully! 🌾"
    });
});
// Admin Dashboard Statistics
app.get("/api/admin/stats", verifyAdmin, (req, res) => {

    const totalUsers = users.length;

    const totalFarmers = users.filter(
        user => user.accountType === "farmer"
    ).length;

    const totalBuyers = users.filter(
        user => user.accountType === "buyer"
    ).length;

    const totalCrops = crops.length + farmerCrops.length;

    res.json({
        totalUsers,
        totalFarmers,
        totalBuyers,
        totalCrops
    });

});
// Add Farmer Crop
app.post("/api/crops", (req, res) => {

const { name, price, quantity, category, farmerEmail } = req.body;

    if (!name || !price || !quantity || !category) {
        return res.status(400).json({
            message: "Please fill all crop details."
        });
  
}

   farmerCrops.push({
        name: name,
         farmerEmail: farmerEmail,
        price: Number(price),
        quantity: Number(quantity),
        category: category,
        icon: "🌾",
        market: "Local Market",
        location: "India",
        farmer: "Farmer"
    });

    res.json({
        message: "🌾 Crop added successfully!"
    });
});
// Get Farmer Added Crops
app.get("/api/farmer-crops", (req, res) => {

    const farmerEmail = req.query.email;

    const myCrops = farmerCrops.filter(
        crop => crop.farmerEmail === farmerEmail
    );

    res.json(myCrops);
});
// UPDATE CROP
app.put("/api/crops/:name", (req, res) => {
    const cropName = req.params.name;
    const farmerEmail = req.query.email;

    const { price, quantity } = req.body;

   const crop = farmerCrops.find(
    crop =>
        crop.name.trim().toLowerCase() === cropName.trim().toLowerCase() &&
        crop.farmerEmail === farmerEmail
);

    if (!crop) {
        return res.status(404).json({
            message: "Crop not found."
        });
    }

    crop.price = Number(price);
    crop.quantity = Number(quantity);

    res.json({
        message: "🌾 Crop updated successfully!"
    });
});

// Remove Farmer Crop
app.delete("/api/crops/:name", (req, res) => {

    const cropName = req.params.name;
    const farmerEmail = req.query.email;

    const oldLength = farmerCrops.length;

    farmerCrops = farmerCrops.filter(
        crop =>
            !(crop.name === cropName &&
              crop.farmerEmail === farmerEmail)
    );

    if (farmerCrops.length === oldLength) {
        return res.status(404).json({
            message: "Crop not found."
        });
    }

    res.json({
        message: "🌾 Crop removed successfully!"
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});