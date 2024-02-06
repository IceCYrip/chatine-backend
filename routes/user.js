const express = require("express");
const User = require("../models/User");
const router = express.Router();
const nodemailer = require("nodemailer");

const multer = require("multer"); // Multer is used for handling multipart/form-data (e.g., file uploads)
const storage = multer.memoryStorage(); // Use memory storage for base64 data
const limits = {
  fieldSize: 25 * 1024 * 1024, // 25 MB (adjust as needed)
};
const upload = multer({ storage, limits }); // Create a Multer instance without storage

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});

const { backendURL } = require("../url");

// ROUTE 1: Create a User and send verification email using: POST "/api/auth/createuser".
router.post("/createuser", async (req, res) => {
  try {
    if (!!req.body.username && !!req.body.password && !!req.body.email) {
      // Check whether the user with this email exists already
      let emailExists = await User.findOne({ email: req.body.email });
      let usernameExists = await User.findOne({ username: req.body.username });

      if (emailExists || usernameExists) {
        let errorMessage = `Sorry! a user with this ${
          emailExists ? "email" : "username"
        } already exists`;

        return res.status(400).json({
          error: errorMessage,
        });
      } else {
        // Create a new user
        let userID = await User.create({
          fullName: "",
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
          profilePicture: "",
          verified: false,
        });

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "chatinehelpdesk@gmail.com",
            pass: "gwte eiyk lhzn tkcm",
          },
        });

        const mailOptions = {
          from: "chatinehelpdesk@gmail.com",
          to: req.body.email,
          subject: "Verify your email",
          html: `<div>
          <label>Dear user,</label> <br />
          <label>Please click on the link below to verify you email address</label>
          <br />
          <br />
          <a href='${backendURL}/api/auth/verify/${userID._id}' >
            Verify
          </a>
          <br />
          <br />
          <b>PLEASE DO NOT SHARE THIS LINK WITH ANYONE YAY!</b>
        </div>`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            res
              .status(500)
              .json({ message: "Something went wrong while sending email" });
          } else {
            console.log("Email sent: ", info.response);
            // res.status(200).json({ message: "Email sent successfully" });

            res.status(200).json({
              _id: userID._id,
              message:
                "An email has been sent to you for verification. Please verify your email to login",
            });
          }
        });
      }
    } else {
      res.status(406).json({ message: "Mandatory data not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Get user details using: GET "/api/auth/getUser".
router.get("/getUser/:_id", async (req, res) => {
  try {
    if (!!req.params._id) {
      try {
        let user = await User.findOne({ _id: req.params._id });
        if (user) {
          res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            profilePicture: user.profilePicture,
            about: user.about,
          });
        } else {
          res.status(404).json({ message: "Details not found" });
        }
      } catch (error) {
        res.status(404).json({ message: "Details not found" });
      }
    } else {
      res.status(406).json({ message: "Mandatory data not found" });
    }
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 3: Update profile picture of the user using: POST "/api/user/update/profilePicture".
router.post(
  "/update/profilePicture",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!!req.body.image && !!req.body._id) {
        try {
          let user = await User.findOne({ _id: req.body._id });

          if (!!user) {
            try {
              await User.findByIdAndUpdate(req.body._id, {
                profilePicture: req.body.image,
              });
              res
                .status(200)
                .json({ message: "Profile Picture updated successfully" });
            } catch (error) {
              res.status(500).json({
                message: "Something went wrong while updating profile picture",
              });
            }
          } else {
            res.status(404).json({ message: "Details not found" });
          }
        } catch (error) {
          res.status(404).json({ message: "Details not found" });
        }
      } else {
        res.status(406).json({ message: "Mandatory data not found" });
      }
    } catch (error) {
      console.log("Error: ", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 4: Update about of the user using: POST "/api/user/update/about".
router.post("/update/about", async (req, res) => {
  try {
    if (!!req.body.about && !!req.body._id) {
      try {
        let user = await User.findOne({ _id: req.body._id });

        if (!!user) {
          try {
            await User.findByIdAndUpdate(req.body._id, {
              about: req.body.about,
            });
            res.status(200).json({ message: "About updated successfully" });
          } catch (error) {
            res.status(500).json({
              message: "Something went wrong while updating about",
            });
          }
        } else {
          res.status(404).json({ message: "Details not found" });
        }
      } catch (error) {
        res.status(404).json({ message: "Details not found" });
      }
    } else {
      res.status(406).json({ message: "Mandatory data not found" });
    }
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4: Update fullName of the user using: POST "/api/user/update/fullName".
router.post("/update/fullName", async (req, res) => {
  try {
    if (!!req.body.fullName && !!req.body._id) {
      try {
        let user = await User.findOne({ _id: req.body._id });

        if (!!user) {
          try {
            await User.findByIdAndUpdate(req.body._id, {
              fullName: req.body.fullName,
            });
            res.status(200).json({ message: "Full name updated successfully" });
          } catch (error) {
            res.status(500).json({
              message: "Something went wrong while updating fullName",
            });
          }
        } else {
          res.status(404).json({ message: "Details not found" });
        }
      } catch (error) {
        res.status(404).json({ message: "Details not found" });
      }
    } else {
      res.status(406).json({ message: "Mandatory data not found" });
    }
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send("Internal Server Error");
  }
});
// ROUTE 4: Update fullName of the user using: POST "/api/user/generate".
router.post("/generate", async (req, res) => {
  try {
    if (!!req.body.prompt) {
      const image = await openai.images.generate({
        prompt: req.body.prompt,
      });

      res.status(200).send(image.data[0]);
    } else {
      res.status(400).json({ mesage: "Details not found" });
    }
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// Timepass
// ROUTE 6: Get user details using: get "/api/auth/getAll".
router.get("/getAll", async (req, res) => {
  try {
    try {
      let users = await User.find().select("-password  -__v -_id");

      res.status(200).json(users);
    } catch (error) {
      res.status(404).json({ message: "Details not found" });
    }
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
