const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    eventId: { type: Number, required: true,unique:true},
    eventName: { type: String, require: true,unique:true },
    year:{type:String},
    semester:{type:String},
    description:{type:String},
    startDate:{type:String},
    endDate:{type:String},
    meetDay:{type:String},
    startTime:{type:String},
    endTime:{type:String},
    image:{type:String},
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
