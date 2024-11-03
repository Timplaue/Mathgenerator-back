const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const secretKey = 'yourSecretKey';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

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
            return res.status(404).send('Пользователь не найден');
        }
        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate,
            username: user.username,
            statistics: {
                examplesSolved: user.examplesSolved,
                levelsCompleted: user.levelsCompleted,
                perfectScores: user.perfectScores,
            },
            avatarUrl: user.avatarUrl,
        });
    } catch (error) {
        res.status(500).send('Ошибка при получении профиля');
    }
});
// Обработчик загрузки аватара
router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        const avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        await User.findByIdAndUpdate(req.userId, { avatarUrl });
        res.json({ avatarUrl });
    } catch (error) {
        console.error("Ошибка загрузки аватара:", error);
        res.status(500).send('Ошибка загрузки аватара');
    }
});

router.post('/update-statistics', verifyToken, async (req, res) => {
    const { examplesSolved, levelsCompleted, perfectScores } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).send('Пользователь не найден');

        user.examplesSolved += examplesSolved || 0;
        user.levelsCompleted += levelsCompleted || 0;
        user.perfectScores += perfectScores || 0;

        await user.save();
        res.json({ message: 'Статистика обновлена' });
    } catch (error) {
        console.error("Ошибка при обновлении статистики:", error);
        res.status(500).send('Ошибка обновления статистики');
    }
});

module.exports = router;
