const express = require('express')
const Conversation = require('../models/Conversation')
const User = require('../models/User')
const router = express.Router()

// ROUTE 1: Create a User and send verification email using: POST "/api/auth/createuser".
router.post('/create', async (req, res) => {
  try {
    if (
      //user
      !!req.body.participant1 &&
      //secondPerson
      !!req.body.participant2
    ) {
      let isSecondPerson = await User.findById(req.body.participant2)
      if (isSecondPerson.verified) {
        let conversationExists =
          (await Conversation.findOne({
            participants: [req.body.participant1, req.body.participant2],
          })) ??
          (await Conversation.findOne({
            participants: [req.body.participant2, req.body.participant1],
          }))

        if (!!conversationExists) {
          res.status(403).json({ message: 'Conversation already exists' })
        } else {
          let newConversation = await Conversation.create({
            participants: [req.body.participant1, req.body.participant2],
          })
          res.status(201).json({
            conversationID: newConversation._id,
            message: 'Conversation created successfully',
          })
        }
      } else {
        res.status(400).json({ message: 'No user found with this username' })
      }
    } else {
      res.status(406).json({ message: 'Mandatory data not found' })
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

// ROUTE 2: Get conversation messages using: POST "/api/conversation/getUserConversations".
router.post('/getUserConversations', async (req, res) => {
  try {
    if (!!req.body.userId) {
      // Retrieve conversations for the user
      try {
        const conversations = await Conversation.find({
          participants: req.body.userId,
        })

        // Map conversations to the desired response format
        const response = await Promise.all(
          conversations.map(async (conversation) => {
            // Find other participants in the conversation
            const otherParticipants = conversation.participants.filter(
              (id) => id !== req.body.userId
            )

            // Retrieve user information for other participants
            const participantsInfo = await User.find({
              _id: { $in: otherParticipants },
            })

            // Map user information to the desired format
            const participants = participantsInfo.map((user) => ({
              conversationID: conversation._id,
              userID: user._id,
              fullName: user.fullName,
              profilePicture: user.profilePicture,
            }))

            return participants
          })
        )

        // Flatten the array of arrays to a single array
        const flattenedResponse = response.flat()

        res.status(200).json({
          conversations: flattenedResponse,
        })
      } catch (error) {
        console.log(error)
        res.status(404).json({ message: 'No conversation found' })
      }
    } else {
      res.status(406).json({ message: 'Mandatory data not found' })
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
