const mongoose = require("mongoose");
// password hashing library
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide employee name."],
    minLength: 3,
    maxLength: 30,
    unique: false,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide employee email."],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email address.",
    ],
  },
  password: {
    type: String,
    required: [true, "Please enter a valid password."],
    minLength: 8,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  avatarUrl: {
    type: String,
    default: "NoAvatar",
  },
});
// Before saving the new user to the db use bcrypt on the the password and create a hash
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  const data = this.getUpdate();
  const salt = await bcrypt.genSalt(10);
  data.password = await bcrypt.hash(data.password, salt);
  next();
});

// Schema instance methods

// Generate a new JWT token when the user registers
UserSchema.methods.generateToken = function () {
  return jwt.sign({ UserId: this._id, name: this.name }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

// Check if users password match
UserSchema.methods.comparePassword = async function (passwordInput) {
  return await bcrypt.compare(passwordInput, this.password);
};

module.exports = mongoose.model("User", UserSchema);
