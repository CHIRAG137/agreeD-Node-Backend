const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  googleId: { type: String },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (!this.password) {
      throw new Error("Password is required for hashing");
    }
  }
  next();
});

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
