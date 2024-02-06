const connectToMongo = require("./db");

const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

require("dotenv").config();

app.use(express.json());
app.use(cors());

// Available Routes

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/conversation", require("./routes/conversation"));
app.use("/api/message", require("./routes/message"));
app.use("/api/user", require("./routes/user"));

app.listen(port, () => {
  console.log(`Chatine - AI chat app listening on port ${port}`);
});
connectToMongo();
