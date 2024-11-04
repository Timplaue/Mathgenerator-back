const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    birthDate: Date,
    username: { type: String, unique: true },
    password: String,
    examplesSolved: { type: Number, default: 0 },
    levelsCompleted: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    bestTime: { type: Number, default: null },
    avatarUrl: String,
    registrationDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
