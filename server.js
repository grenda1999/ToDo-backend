const express = require("express");
const connectDB = require("./config/db");
const infoColors = require("./config/chalk/variables");
const app = express();

// Connect database
connectDB();

// Init Middleware
app.use(express.json());

// Define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/tasks", require("./routes/api/tasks"));
app.use("/api/auth", require("./routes/api/auth"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(infoColors.success(`Server started on port ${PORT}`));
});