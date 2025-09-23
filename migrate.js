const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./src/models/userModel"); // your user model

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Update all users: add reset fields if missing
    const result = await User.updateMany(
      {
        $or: [
          { resetPasswordToken: { $exists: false } },
          { resetPasswordExpires: { $exists: false } },
        ],
      },
      {
        $set: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      }
    );

    console.log(`✅ Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
