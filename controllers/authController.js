require('dotenv').config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// handle errors for signup and login
// this function will be used to handle errors that occur during signup and login
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  //incorrect email
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
    return errors;
  }
  //incorrect password
  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
    return errors;
  }

  //duplicate email error
  if (err.code === 11000) {
    errors.email = "That email is already registered";
    return errors;
  }

  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};


// create json web token
const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds
// this function will be used to create a token when a user signs up
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};



module.exports.signup_get = (__, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });

    // create a token for the user after successful signup
    // this token will be used to authenticate the user in subsequent requests
    const token = createToken(user._id);
    // set the token as a cookie in the response
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000, // convert seconds to milliseconds
    });

    // send the user id in the response
    // this can be used to identify the user in the frontend
    res.status(201).json({user: user._id });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  //handle user login logic here
  try{
    const user = await User.login(email, password);

    // create a token for the user after successful login
    const token = createToken(user._id);
    // set the token as a cookie in the response
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000, // convert seconds to milliseconds
    });

    res.status(200).json({ user: user._id });
  }
  catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};


module.exports.logout_get = (req, res) => {
  // clear the cookie by setting its maxAge to 0
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
}