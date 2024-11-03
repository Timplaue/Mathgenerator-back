// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    birthDate: Date,
    username: { type: String, unique: true },
    password: String,
    avatarUrl: String,
    examplesSolved: { type: Number, default: 0 },
    levelsCompleted: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    registrationDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
