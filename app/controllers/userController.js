const User = require("../models/userModel.js");
const { hashPassword, comparePassword } = require("../middleware/auth.js");
const generatedToken = require("../middleware/jwt.js");

// Create User
const createUser = async (req, res) => {
  const { name: userName, email: userEmail, password: userPassword } = req.body;

  try {
    if (!userName || !userEmail || !userPassword) {
      res.status(400).json({ msg: "kindly fill all required fields" });
    }
    if (userPassword.length < 8) {
      res
        .status(400)
        .json({ msg: "password must not be less than 8 characters" });
    }
    const findUserEmail = await User.findOne({ email });
    if (findUserEmail) {
      res.status(400).json({ msg: "email already exists" });
    }

    const createdUser = await User.create({
      name: userName,
      email: userEmail,
      password: hashPassword(userPassword),
    });

    if (!createdUser) {
      return res.status(400).json({
        msg: "error creating user profile.",
      });
    }

    return res.status(201).json({ msg: "account creation successful" });
  } catch (error) {
    return res.status(500).json({ msg: "internal server error", error });
  }
};

// log user in
const logUserIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "Kindly enter your email and password" });
    }

    const userExist = await userModel.findOne({ email });

    if (!userExist) {
      return res.status(400).json({ msg: "user not found. Kindly register" });
    }
    const isPasswordCorrect = await comparePassword(
      password,
      userExist.password
    );

    const token = generatedToken(userExist._id);

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });

    if (userExist && isPasswordCorrect) {
      const { _id, name, email } = userExist;
      res.status(200).json({ msg: { _id, name, email }, token });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// log user out
const logUserOut = async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // for mobile, it is advisable to delete the token instead
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ msg: "logout successful" });
};

module.exports = { createUser, logUserIn, logUserOut };
