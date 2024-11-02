const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const router = express.Router();

const secretKey = 'yourSecretKey'; // Лучше вынести в .env

// Middleware для проверки токена
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Токен отсутствует');

    jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
        if (err) return res.status(401).send('Ошибка аутентификации');
        req.userId = decoded.id;
        next();
    });
};

// Регистрация
router.post('/register', async (req, res) => {
    const { firstName, lastName, birthDate, username, password } = req.body;

    if (!firstName || !lastName || !birthDate || !username || !password) {
        return res.status(400).send('Все поля обязательны для заполнения');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ firstName, lastName, birthDate, username, password: hashedPassword });
        await user.save();
        res.status(201).send('Пользователь успешно зарегистрирован');
    } catch (error) {
        console.error("Ошибка в /api/auth/register:", error.message);
        res.status(500).send('Ошибка регистрации');
    }
});

// Логин
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send('Пользователь не найден');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Неправильный пароль');

        const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).send('Ошибка авторизации');
    }
});
module.exports = router; // Убедитесь, что вы правильно экспортируете router
