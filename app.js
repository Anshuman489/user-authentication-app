require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middleware/authMiddleware");

const app = express();

// middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set("view engine", "ejs");

// database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then((result) =>{
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    })}
  )
  .catch((err) => console.log(err));

// routes
app.get("*", checkUser);
app.get("/",  (req, res) => res.render("home"));
app.get("/smoothies", requireAuth, (req, res) => res.render("smoothies"));

app.use(authRoutes);
