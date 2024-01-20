const express = require('express')
const User = require('../models/User')
const router = express.Router()
const nodemailer = require('nodemailer')

const frontendURL = require('../urls')

// ROUTE 1: Create a User and send verification email using: POST "/api/auth/createuser".
router.post('/createuser', async (req, res) => {
  try {
    if (!!req.body.fullName && !!req.body.email && !!req.body.password) {
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email })
      if (user) {
        return res
          .status(400)
          .json({ error: 'Sorry a user with this email already exists' })
      } else {
        // Create a new user
        user = await User.create({
          fullName: req.body.fullName,
          email: req.body.email,
          password: req.body.password,
          profilePicture: '',
          verified: false,
        })
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
          subject: 'Verify your email',
          html: `<div>
          <label>Hello children,</label> <br />
          <label>Please click on the link below to verify you email address</label>
          <br />
          <br />
          <a href='http://localhost:5000/api/auth/verify?_id=${userID._id}' >
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
            res.status(200).json({ message: 'Email sent successfully' })
          }
        })
        res.status(200).json({
          _id: userID._id,
          message: 'Please verify your email',
        })
      }
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 2: Verify the user using: POST "/api/auth/verify".
router.get('/verify', async (req, res) => {
  try {
    if (!!req.query._id) {
      let user = await User.findById(req.query._id)

      const newBody = {
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        profilePicture: user.profilePicture ?? '',
        verified: true,
      }

      try {
        await User.findByIdAndUpdate(req.query._id, newBody)
        console.log('Email verified successfully. Redirecting to ', frontendURL)
      } catch (error) {
        console.log('Something went wrong while verifying user', error)
      }

      res.redirect(frontendURL)
    } else {
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
      let user = await User.findById(req.body._id)
      if (user) {
        res.status(200).json({ verificationStatus: user.verified })
      } else {
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
    if (!!req.body.email && !!req.body.password) {
      let user = await User.findOne({ email: req.body.email })

      if (user) {
        if (user.password == req.body.password) {
          res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            message: 'Authentication Successful',
          })
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
    if (!!req.body._id && !!req.body.oldPassword && !!req.body.newPassword) {
      let user = await User.findById(req.body._id)

      if (user.password == req.body.oldPassword) {
        const newBody = {
          fullName: user.fullName,
          email: user.email,
          password: req.body.newPassword,
          profilePicture: user.profilePicture,
          verified: true,
        }

        await User.findByIdAndUpdate(req.body._id, newBody)

        res.status(200).json({ message: 'Password updated successfully' })
      } else {
        res
          .status(400)
          .json({ message: 'Incorrect old password. Please try again' })
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
        <label>Hello,</label> <br />
        <label>Please click on the link below to reset your password</label>
        <br />
        <br />
        <a href='${frontendURL}/changePassword/${userID._id}'>
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
      //user not found
      res.status(404).json({ message: 'Details not found' })
    }
  } catch (error) {
    console.error('Error: ', error.message)
    res.status(500).send('Internal Server Error')
  }
})
module.exports = router
