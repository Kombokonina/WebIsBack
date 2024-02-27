const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    pictures: [String],
    names: [{
        lang: String,
        name: String
    }],
    descriptions: [{
        lang: String,
        description: String
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    deletedAt: Date
});

module.exports = mongoose.model('Item', itemSchema);
