const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const router = express.Router();

const secretKey = 'yourSecretKey';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Заголовок Authorization:', authHeader);
    if (!authHeader) {
        console.log('Токен отсутствует');
        return res.status(403).send('Токен отсутствует');
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.log('Ошибка при верификации токена:', err.message);
            return res.status(401).send('Ошибка аутентификации');
        }
        req.userId = decoded.id;
        next();
    });
};

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

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            console.log('Пользователь не найден:', req.userId);
            return res.status(404).send('Пользователь не найден');
        }
        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate,
            username: user.username,
        });
    } catch (error) {
        res.status(500).send('Ошибка при получении профиля');
    }
});

module.exports = router;
