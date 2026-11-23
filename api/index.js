import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import {
  createProduct,
  readProducts,
  readProductById,
  updateProductForm,
  updateProduct,
  deleteProduct,
  createProductForm,
} from "../controllers/productController.js";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9500;

// MongoDB connection caching
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME || "productsDB",
  });
  isConnected = true;
  console.log("Connected to MongoDB");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS view engine with absolute path to views folder
// (required for Vercel serverless — relative paths break at runtime)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Connect to DB before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(503).send(`<h1>Database unavailable</h1><p>${err.message}</p>`);
  }
});

// Routes
app.get("/product-form", createProductForm);
app.post("/add-product", createProduct);
app.get("/", readProducts);
app.get("/product/:id", readProductById);
app.get("/product-form/:id", updateProductForm);
app.post("/add-product/:id", updateProduct);
app.get("/delete-product/:id", deleteProduct);

// 404 fallback
app.use((req, res) => {
  res.status(404).send("<h1>404 - Not Found</h1>");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errror", { error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;
