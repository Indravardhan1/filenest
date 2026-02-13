const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    size: Number,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("File", fileSchema);
