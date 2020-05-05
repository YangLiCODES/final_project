const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    pantherId: { type: Number, required: true },
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    department: { type: String, require: true },
    level: { type: String, require: true },
    campus: { type: String, require: true },
    degree: { type: String, require: true },
    email: { type: String, require: true },
    college: { type: String, require: true },
    year: { type: String, require: true },
    checkIn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);



module.exports = userSchema;
