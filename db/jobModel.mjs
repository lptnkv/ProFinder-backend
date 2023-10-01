import mongoose from "mongoose";
const {Schema} = mongoose;

const JobSchema = new Schema({
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
    price: {
        type: Number,
        required: true,
    }
})

export default mongoose.model.Jobs || mongoose.model("Jobs", JobSchema)