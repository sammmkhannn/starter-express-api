import mongoose from "mongoose";


const fileSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Types.ObjectId,
        ref:"User"
    },
    receiverId: {
        type: mongoose.Types.ObjectId,
        ref:"User"
    },
    title: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required:true,
    }
}, { timestamps: true });


export default mongoose.model('File', fileSchema);