import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name!"],
        unique: false,
        maxLength: 100,
    },
    descr: {
        type: String,
        required: [true, "Please provide a description!"],
        unique: false,
        maxLength: 2000,
    },
    _creator: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    address: {
        type: String,
        maxLength: 200,
        unique: false,
        required: false
    }
})

module.exports = mongoose.model("Jobs", JobSchema);