const express = require('express')
const User = require('../models/User')
const router = express.Router()
const nodemailer = require('nodemailer')

const { frontendURL, backendURL } = require('../url')

// ROUTE 1: Create a User and send verification email using: POST "/api/auth/createuser".
router.post('/createuser', async (req, res) => {
  try {
    if (!!req.body.username && !!req.body.password && !!req.body.email) {
      // Check whether the user with this email exists already
      let emailExists = await User.findOne({ email: req.body.email })
      let usernameExists = await User.findOne({ username: req.body.username })

      if (emailExists || usernameExists) {
        let emailExistsErrorMessage =
          'Sorry! a user with this email already exists'
        let usernameExistsErrorMessage =
          'Sorry! a user with this username already exists'

        return res.status(400).json({
          errors: emailExists
            ? emailExistsErrorMessage
            : usernameExistsErrorMessage,
        })
      } else {
        // Create a new user
        let userID = await User.create({
          fullName: '',
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
          profilePicture: '',
          verified: false,
        })

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'chatinehelpdesk@gmail.com',
            pass: 'gwte eiyk lhzn tkcm',
          },
        })

        const mailOptions = {
          from: 'chatinehelpdesk@gmail.com',
          to: req.body.email,
          subject: 'Verify your email',
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
        }

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
            res
              .status(500)
              .json({ message: 'Something went wrong while sending email' })
          } else {
            console.log('Email sent: ', info.response)
            // res.status(200).json({ message: "Email sent successfully" });

            res.status(200).json({
              _id: userID._id,
              message:
                'An email has been sent to you for verification. Please verify your email to login',
            })
          }
        })

        // res.status(200).json({
        //   _id: userID._id,
        //   message:
        //     "An email has been sent to you for verification. Please verify your email to login",
        // });
      }
    } else {
      res.status(406).json({ message: 'Mandatory data not found' })
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 2: Verify the user using: POST "/api/auth/verify".
router.get('/verify/:_id', async (req, res) => {
  try {
    if (!!req.params._id) {
      try {
        let user = await User.findOne({ _id: req.params._id })
        if (!user.verified) {
          await User.findByIdAndUpdate(req.params._id, {
            verified: true,
          })
          console.log(
            'Email verified successfully. Redirecting to ',
            frontendURL
          )
        } else {
          console.log('Email already verified. Redirecting to ', frontendURL)
        }
        res.redirect(`${frontendURL}/verified/${user._id}`)
      } catch (error) {
        res.status(404).json({ message: 'Details not found' })
      }
    } else {
      console.log('Something went wrong while verifying user')
      res.status(404).json({ message: 'Details not found' })
    }
  } catch (error) {
    console.error('Error: ', error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 3: Check if the user is verified using: POST "/api/auth/checkVerification".
router.post('/checkVerification', async (req, res) => {
  try {
    if (!!req.body._id) {
      try {
        let user = await User.findOne({ _id: req.body._id })

        res.status(200).json({ verificationStatus: user.verified })
      } catch (error) {
        //User does not exist
        res.status(404).json({ message: 'Details not found' })
      }
    } else {
      //Details not found in API request
      res.status(404).json({ message: 'Details not found' })
    }
  } catch (error) {
    console.error('Error: ', error.message)
    res.status(500).send('Internal Server Error')
  }
})

//ROUTE 4: Login authentication using: POST "/api/auth/login"
router.post('/login', async (req, res) => {
  try {
    if (!!req.body.username && !!req.body.password) {
      let user = await User.findOne({ username: req.body.username })
      console.log(user)
      if (user) {
        if (user.password == req.body.password) {
          if (user.verified) {
            res.status(200).json({
              _id: user._id,
              message: 'Authentication Successful',
            })
          } else {
            res.status(400).json({
              message:
                'Please verify through your email address before logging in. The verification link was sent to you when you signed up',
            })
          }
        } else {
          //Wrong Password
          res.status(400).json({ message: 'Incorrect credentials' })
        }
      } else {
        //No user found
        res.status(400).json({ message: 'Incorrect credentials' })
      }
    } else {
      res.status(404).json({ message: 'Details not found' })
    }
  } catch (error) {
    console.error('Error: ', error.message)
    res.status(500).send('Internal Server Error')
  }
})

//ROUTE 5: Reset password using: POST: "/api/auth/resetPassword"
router.post('/resetPassword', async (req, res) => {
  try {
    // if (!!req.body._id && !!req.body.oldPassword && !!req.body.newPassword) {
    if (!!req.body._id && !!req.body.newPassword) {
      try {
        let user = await User.findOne({ _id: req.body._id })

        //User Logs in and tries to change password
        if (!!req.body.isLoggedIn) {
          if (user.password == req.body.oldPassword) {
            await User.findByIdAndUpdate(req.body._id, {
              password: req.body.newPassword,
            })

            res.status(200).json({ message: 'Password updated successfully' })
          } else {
            res
              .status(400)
              .json({ message: 'Incorrect old password. Please try again' })
          }
        } else {
          //User is not logged in and gets the ID from URL
          try {
            await User.findByIdAndUpdate(req.body._id, {
              password: req.body.newPassword,
            })
            res.status(200).json({ message: 'Password updated successfully' })
          } catch (error) {
            res.status(404).json({ message: 'Details not found' })
          }
        }
      } catch (error) {
        //user not found
        res.status(404).json({ message: 'Details not found' })
      }
    } else {
      //Details not found in API request
      res.status(406).json({ message: 'Mandatory data not found' })
    }
  } catch (error) {
    console.error('Error: ', error.message)
    res.status(500).send('Internal Server Error')
  }
})

//ROUTE 6: Forgot password using: GET: "/api/auth/forgotPassword"
router.post('/forgotPassword', async (req, res) => {
  try {
    if (!!req.body.email) {
      const userID = await User.findOne({ email: req.body.email })

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'chatinehelpdesk@gmail.com',
          pass: 'gwte eiyk lhzn tkcm',
        },
      })

      const mailOptions = {
        from: 'chatinehelpdesk@gmail.com',
        to: req.body.email,
        subject: 'Reset Password',
        html: `<div>
        <label>Hello user,</label> <br />
        <label>Please click on the link below to reset your password</label>
        <br />
        <br />
        <a href='${frontendURL}/reset-password/${userID._id}'>
          Reset Password
        </a>
        <br />
        <br />
        <b>PLEASE DO NOT SHARE THIS LINK WITH ANYONE YAY!</b>
      </div>`,
      }

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
          res
            .status(500)
            .json({ message: 'Something went wrong while sending email' })
        } else {
          console.log('Email sent: ', info.response)
          res.status(200).json({ message: 'Email sent successfully' })
        }
      })
    } else {
      //Details not recieved
      res.status(406).json({ message: 'Mandatory data not found' })
    }
  } catch (error) {
    console.error('Error: ', error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 7: Get user details using: GET "/api/auth/getUser".
router.get('/getUser/:_id', async (req, res) => {
  try {
    if (!!req.params._id) {
      try {
        let user = await User.findOne({ _id: req.params._id })
        if (user) {
          res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            profilePicture: user.profilePicture,
          })
        } else {
          res.status(404).json({ message: 'Details not found' })
        }
      } catch (error) {
        res.status(404).json({ message: 'Details not found' })
      }
    } else {
      res.status(406).json({ message: 'Mandatory data not found' })
    }
  } catch (error) {
    console.error('Error: ', error.message)
    res.status(500).send('Internal Server Error')
  }
})

// Timepass
// ROUTE 8: Get user details using: get "/api/auth/getAll".
router.get('/getAll', async (req, res) => {
  try {
    try {
      let users = await User.find().select('-password  -__v -_id')

      res.status(200).json(users)
    } catch (error) {
      res.status(404).json({ message: 'Details not found' })
    }
  } catch (error) {
    console.error('Error: ', error.message)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
