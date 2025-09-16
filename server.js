const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./src/dbConnection/mongo");

const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
