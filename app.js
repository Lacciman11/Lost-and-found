const express = require("express");

// Middlewares
const corsMiddleware = require("./src/middlewares/corsMiddleware");
const helmetMiddleware = require("./src/middlewares/helmetMiddleware");
const loggerMiddleware = require("./src/middlewares/loggerMiddleware");
const rateLimiter = require("./src/middlewares/rateLimiter");
const errorHandler = require("./src/middlewares/errorHandler");
const lostItemRoutes = require("./src/routes/lostItemRoutes");
const foundItemRoutes = require("./src/routes/foundItemRoutes")
const itemsRoutes = require("./src/routes/getItems.js");
 
// Routes
const authRoutes = require("./src/routes/authRoute");

const app = express();

// Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(loggerMiddleware);
app.use(rateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/lost-items", lostItemRoutes);
app.use("/api/found-items", foundItemRoutes);
app.use("/api/items", itemsRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
