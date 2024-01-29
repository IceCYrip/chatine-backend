const mongoose = require("mongoose");
const { Schema } = mongoose;

const ConversationSchema = new Schema({
  participants: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});
const Conversation = mongoose.model("conversation", ConversationSchema);
module.exports = Conversation;
