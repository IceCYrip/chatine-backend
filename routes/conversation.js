const express = require("express");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const router = express.Router();

// ROUTE 1: Create a User and send verification email using: POST "/api/auth/createuser".
router.post("/create", async (req, res) => {
  try {
    if (!!req.body.participant1 && !!req.body.participant2) {
      let conversationExists =
        (await Conversation.findOne({
          participants: [req.body.participant1, req.body.participant2],
        })) ??
        (await Conversation.findOne({
          participants: [req.body.participant2, req.body.participant1],
        }));

      if (!!conversationExists) {
        res.status(403).json({ message: "Conversation already exists" });
      } else {
        await Conversation.create({
          participants: [req.body.participant1, req.body.participant2],
        });
        res.status(201).json({ message: "Conversation created successfully" });
      }
    } else {
      res.status(406).json({ message: "Mandatory data not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Get conversation messages using: POST "/api/conversation/getUserConversations".
router.post("/getUserConversations", async (req, res) => {
  try {
    if (!!req.body.userId) {
      // Retrieve conversations for the user
      try {
        const userConversations = await Conversation.find({
          participants: req.body.userId,
        });
        res.status(200).json({ conversations: userConversations });
      } catch (error) {
        console.log(error);
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

module.exports = router;
