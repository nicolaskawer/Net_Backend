const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
    me: {
        type: String,
        required: true,
    },
    followME: {
        type: String,
        required: true,
    },

});
followSchema.index({ me: 1, followME: 1 }, { unique: true });
module.exports = mongoose.model("followers", followSchema);
