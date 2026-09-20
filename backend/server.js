const express = require("express");

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

app.post("/api/register", (req, res) => {
    const { name, email, phone, password, accountType } = req.body;
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
        password,
        accountType
    });

    res.json({
        message: "Registration successful! 🌾"
    });
});
app.post("/api/login", (req, res) => {
    const { email, password, accountType } = req.body;

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
            accountType: user.accountType
        }
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