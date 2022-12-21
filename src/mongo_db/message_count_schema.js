const { Schema, model, models } = require("mongoose");

const messageCountSchema = new Schema({
    _id: {
        // Store the user ID
        type: String,
        required: true
    },
    _serverid: {
        // Store the server ID
        type: String,
        required: true
    },
    messageCount: {
        // Store the message count
        type: Number,
        required: true
    }
});

const name = "MessageCount";
module.exports = models[name] || model(name, messageCountSchema);