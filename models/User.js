const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  surname: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }, ],
});

// Specify User/Task relationship
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner"
})

// Generate token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const payload = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(payload, config.get("jwtSecret"), {
    expiresIn: "7 days"
  });
  user.tokens = user.tokens.concat({
    token,
  });

  await user.save();

  return token;
};

// Check credentials
userSchema.statics.findByCredentials = async ({
  email,
  password
}) => {
  const user = await User.findOne({
    email
  });
  if (!user) {
    const err = new Error()
    err.error = {
      errors: [{
        msg: "Invalid credentials"
      }]
    }
    throw err
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error()
    err.error = {
      errors: [{
        msg: "Invalid credentials"
      }]
    }
    throw err
  }

  return user
}

// Hide sensitive data
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// Hash password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

module.exports = User = mongoose.model("User", userSchema);