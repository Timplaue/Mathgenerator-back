const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    birthDate: Date,
    username: { type: String, unique: true },
    password: String,
    avatarUrl: { type: String } // Добавьте поле для аватара
});

module.exports = mongoose.model('User', UserSchema);
