const mongoose = require('mongoose');

const LogSchema = mongoose.Schema({
    time: ""
}, {
    timestamps: true
});

module.exports = mongoose.model('log', LogSchema);