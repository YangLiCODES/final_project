const router = require("express").Router();
const Event = require("../models/event.model");
const UserSchema = require("../models/user.model");
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
router.route("/").get((req, res) => {
  Event.find()
    .then((events) => res.json(events))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/get_event/:eventName").get((request,response)=>{
  Event.findOne({eventName:request.params.eventName},(err,res)=>{
    if (err) throw "Error when finding a document with a event";
    response.send(res);
  })
})

router.route("/add").post(
  multer({
    limits: { fieldSize: 25 * 1024 * 1024 },
  }).any(),
  (req, response) => {
    const requestBody = req.body;
    const users = JSON.parse(req.body.users);
    Event.findOne({ eventName: requestBody.eventName }, function (err, res) {
      if (err) throw "Error when finding a document with a event";
      console.log(res);
      if (!res) {
        delete requestBody.users;
        requestBody.eventId = Date.now();
        if (req.files[0]) {
          fs.writeFileSync(
            `./react/src/images/${req.files[0].originalname}`,
            req.files[0].buffer
          );
          requestBody.image = `${req.files[0].originalname}`;
        }

        const UserModel = mongoose.model(
          `event_${requestBody.eventName}`,
          UserSchema
        );
        UserModel.insertMany(users, (err, docs) => {
          console.log(err);
          console.log(docs);
        });

        const newEvent = new Event(requestBody);

        newEvent
          .save()
          .then(() => response.json("Event added!"))
          .catch((err) => response.status(400).json("Error: " + err));
      } else {
        response.json("event name exists");
      }
    });
  }
);

module.exports = router;
