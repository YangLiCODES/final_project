const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require('path');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

const uri = process.env.ATLAS_URI;

mongoose.set("useCreateIndex", true);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

const usersRouter = require("./routes/users");
const eventsRouter = require("./routes/events");

app.use("/users", usersRouter);
app.use("/events", eventsRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
