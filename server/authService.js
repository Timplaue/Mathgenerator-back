const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const router = express.Router();

const secretKey = 'yourSecretKey'; // Лучше вынести в .env

// Middleware для проверки токена
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log('Получен токен:', token); // Логируем полученный токен
    if (!token) {
        console.log('Токен отсутствует');
        return res.status(403).send('Токен отсутствует');
    }

    jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
        if (err) {
            console.log('Ошибка при верификации токена:', err.message); // Логируем ошибку
            return res.status(401).send('Ошибка аутентификации');
        }
        console.log('Токен успешно проверен, данные пользователя:', decoded); // Логируем данные пользователя из токена
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

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            console.log('Пользователь не найден:', req.userId); // Логируем, если пользователь не найден
            return res.status(404).send('Пользователь не найден');
        }
        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate,
            username: user.username,
        });
    } catch (error) {
        console.error('Ошибка при получении профиля:', error.message); // Логируем ошибки
        res.status(500).send('Ошибка получения профиля');
    }
});

module.exports = router; // Убедитесь, что вы правильно экспортируете router
