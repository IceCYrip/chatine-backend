const express = require('express')
const User = require('../models/User')
const router = express.Router()
const nodemailer = require('nodemailer')

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
        // Create a new user
        user = await User.create({
          fullName: req.body.fullName,
          password: req.body.password,
          email: req.body.email,
        })
      }
      const userID = await User.findOne({ email: req.body.email })

      res
        .status(200)
        .json({ message: 'Account created successfully', id: userID._id })
    }
  } catch (error) {
    console.error(error.message)
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
          userType: user.userType,
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

router.get('/sendEmail', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'karansable16@gmail.com',
        pass: 'gsyx jpvm fjvb jeam',
      },
    })

    const mailOptions = {
      from: 'karansable16@gmail.com',
      to: 'karansable.probity@gmail.com',
      // to: 'karansable.probity@gmail.com',
      subject: 'Testing Email service',
      // text: 'Testing email integration.',
      html: '<div><label>Hello children,</label>  <br /><label>This is a test email sent after email integration. Please do not reply to it</label><br /><br /><b>If you receive this... YAY!</b> </div>',
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
        res
          .status(500)
          .json({ message: 'Something went wrong while sending email' })
      } else {
        console.log('Email sent: ' + info.response)
        res.status(200).json({ message: 'Email sent successfully' })
      }
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
