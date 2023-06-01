import mongoose from "mongoose";
const {Schema} = mongoose;

const UserSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
    },
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
    },

    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
    role: {
        type: String,
        required: [true, "Please provide a role!"],
        unique: false, 
    },
})

module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);