const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  conversationId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Conversation",
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Message = mongoose.model("message", MessageSchema);
module.exports = Message;
