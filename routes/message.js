const express = require("express");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const router = express.Router();

// ROUTE 1: Get conversation messages using: POST "/api/message/getByUser".
router.post("/getMessages", async (req, res) => {
  try {
    if (!!req.body.conversationId) {
      let conversation = Conversation.findById(req.body.conversationId);

      if (!!conversation) {
        try {
          let messages = await Message.find({
            conversationId: req.body.conversationId,
          }).sort({ createdAt: 1 });

          res.status(200).json({ messages: messages });
        } catch (error) {
          res.status(500).json("Something went wrong while getting messages");
        }
      } else {
        res.status(404).json({ message: "No conversation found" });
      }
    } else {
      res.status(406).json({ message: "Mandatory data not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Send a message using: POST "/api/message/send".
router.post("/send", async (req, res) => {
  try {
    if (
      !!req.body.senderId &&
      !!req.body.conversationId &&
      !!req.body.content
    ) {
      const { senderId, conversationId, content } = req.body;
      // Check if the user is a participant in the conversation
      const isParticipant = await Conversation.exists({
        _id: conversationId,
        participants: senderId,
      });

      if (!!isParticipant) {
        try {
          // Create a new message
          await Message.create({
            conversationId,
            senderId,
            content,
          });
          res.status(200).json({ message: "Message sent successfully" });
        } catch (error) {
          res.status(500).send("Something went wrong while sending message");
        }
      } else {
        return res
          .status(403)
          .json({ error: "You are not a participant in this conversation" });
      }
    } else {
      res.status(406).json({ message: "Mandatory data not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
