const router = require("express").Router();
let userSchema = require("../models/user.model");
const mongoose = require("mongoose");
//const UserS = mongoose.model("User", userSchema);

router.route("/get_user").get((req, res) => {
  User.findById(req.params.id)
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/add").post((req, res) => {
  const PantherId = req.body.PantherId;
  const FirstName = req.body.FirstName;
  const LastName = req.body.LastName;
  const Department = req.body.Department;
  const Level = req.body.Level;
  const Campus = req.body.Campus;
  const Degree = req.body.Degree;
  const Email = req.body.Email;
  const College = req.body.College;
  const Year = req.body.Year;
  const CheckIn = req.body.CheckIn;

  const newUser = new User({
    PantherId,
    FirstName,
    LastName,
    Department,
    Level,
    Campus,
    Degree,
    Email,
    College,
    Year,
    CheckIn,
  });

  newUser
    .save()
    .then(() => res.json("User added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").get((req, res) => {
  User.findById(req.params.id)
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").delete((req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json("User deleted."))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/update/:id").post((req, res) => {
  User.findById(req.params.id)
    .then((users) => {
      users.CheckIn = req.body.CheckIn;

      users
        .save()
        .then(() => res.json("User updated!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/get_users/:eventName").get((req, res) => {
  const Users = mongoose.model(`event_${req.params.eventName}`, userSchema);
  Users.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/update_checkIn").post((request, response) => {
  const Users = mongoose.model(`event_${request.body.eventName}`, userSchema);

  Users.findOne({ pantherId: request.body.pantherId }).then((user) => {
    user.checkIn = request.body.checkIn;
    user
      .save()
      .then(() => response.json("User updated!"))
      .catch((err) => response.status(400).json("Error: " + err));
  });
});

module.exports = router;
