const cors = require("cors");

const corsMiddleware = cors({
  origin: "*", // update this later with frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

module.exports = corsMiddleware;
