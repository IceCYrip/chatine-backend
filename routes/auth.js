const express = require('express')
const User = require('../models/User')
const router = express.Router()
const nodemailer = require('nodemailer')

const frontendURL = require('../urls')

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
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
        const otp = 176425
        // Create a new user
        user = await User.create({
          fullName: req.body.fullName,
          email: req.body.email,
          password: req.body.password,
          profilePicture: '',
          verified: false,
          otp: otp,
        })
        const userID = await User.findOne({ email: req.body.email })

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'karansable16@gmail.com',
            pass: 'gsyx jpvm fjvb jeam',
          },
        })

        const mailOptions = {
          from: 'karansable16@gmail.com',
          to: req.body.email,
          subject: 'Verify your email',
          html: `<div>
          <label>Hello children,</label> <br />
          <label>Please click on the link below to verify you email address</label>
          <br />
          <br />
          <a
            style={{
              textTransform: 'uppercase',
              padding: '5px 10px',
              border: '1px solid black',
              backgroundColor: 'whitesmoke',
            }}
            href='http://localhost:5000/api/auth/verify?otp=${userID.otp}&id=${userID._id}'
          >
            Verify
          </a>
          <br />
          <br />
          <b>PLEASE DO NOT SHARE THE OTP WITH ANYONE YAY!</b>{' '}
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
      }

      res.status(200).json({ message: 'Please verify your email' })
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})
// ROUTE 1: Create a User using: POST "/api/auth/verify". No login required
router.get('/verify', async (req, res) => {
  try {
    if (!!req.query.otp && !!req.query.id) {
      let user = await User.findById(req.query.id)

      const newBody = {
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        profilePicture: user.profilePicture,
        verified: true,
        otp: null,
      }

      await User.findByIdAndUpdate(req.query.id, newBody)
      console.log('Email verified successfully. Redirecting to ', frontendURL)
      res.redirect(frontendURL)
    } else {
      res.status(404).json({ message: 'Details not found' })
    }
  } catch (error) {
    console.error('Error: ', error.message)
    res.status(500).send('Internal Server Error')
  }
})

//Route 2: Login authentication
router.post('/login', async (req, res) => {
  if (!!req.body.email && !!req.body.password) {
    let user = await User.findOne({ email: req.body.email })

    if (user) {
      if (user.password == req.body.password) {
        const data = {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        }
        res.status(200).json(data)
      } else {
        res.status(400).json({ message: 'Incorrect credentials' })
      }
    } else {
      res.status(400).json({ message: 'Incorrect credentials' })
    }
  } else {
    res.status(400).json({ message: 'Incorrect credentials' })
  }
})

module.exports = router
