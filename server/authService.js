const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Achievement = require('./models/Achievement');
const multer = require('multer');
const path = require('path');

const router = express.Router();
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
    if (!authHeader) {
        return res.status(403).json({ message: 'Токен отсутствует' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Ошибка аутентификации' });
        }
        req.userId = decoded.id;
        next();
    });
};

router.post('/register', async (req, res) => {
    const { firstName, lastName, birthDate, username, password } = req.body;

    if (!firstName || !lastName || !birthDate || !username || !password) {
        return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            birthDate,
            username,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (error) {
        console.error("Ошибка в /api/auth/register:", error.message);
        res.status(500).json({ message: 'Ошибка регистрации' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неправильный пароль' });
        }

        const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка авторизации' });
    }
});

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
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
                bestTime: user.bestTime,
            },
            avatarUrl: user.avatarUrl,
            registrationDate: user.registrationDate,
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении профиля' });
    }
});

router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        const avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        await User.findByIdAndUpdate(req.userId, { avatarUrl });
        res.json({ avatarUrl });
    } catch (error) {
        console.error("Ошибка загрузки аватара:", error);
        res.status(500).json({ message: 'Ошибка загрузки аватара' });
    }
});

router.post('/update-statistics', verifyToken, async (req, res) => {
    const { examplesSolved, levelsCompleted, perfectScores, levelTime } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }


        user.examplesSolved += examplesSolved || 0;
        user.levelsCompleted += levelsCompleted || 0;
        user.perfectScores += perfectScores || 0;

        if (perfectScores && (user.bestTime === null || levelTime < user.bestTime)) {
            user.bestTime = levelTime;
        }

        await user.save();
        res.json({ message: 'Статистика обновлена' });
    } catch (error) {
        console.error("Ошибка при обновлении статистики:", error);
        res.status(500).json({ message: 'Ошибка обновления статистики' });
    }
});

router.get('/check-achievements', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Токен отсутствует' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const achievements = await Achievement.find({});
        const unlockedAchievements = achievements.filter((achievement) => {
            switch (achievement.title) {
                case "Скоростной ум!":
                    return user.bestTime !== null && user.bestTime <= 60;
                case "Отличник":
                    return user.perfectScores >= 1;
                case "Первое решение!":
                    return user.examplesSolved >= 1;
                default:
                    return false;
            }
        });

        res.json({ achievements: unlockedAchievements });
    } catch (error) {
        console.error("Ошибка сервера:", error);
        res.status(500).json({ message: 'Ошибка проверки достижений' });
    }
});

router.get('/user', verifyToken, async (req, res) => {
    try {
        // Ищем пользователя в базе данных по ID, который мы получили из токена
        const user = await User.findById(req.userId).select('birthDate');  // Запрашиваем только дату рождения
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Отправляем ответ с датой рождения пользователя
        res.json({ birthDate: user.birthDate });
    } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error.message);
        res.status(500).json({ message: 'Ошибка при получении данных пользователя' });
    }
});


module.exports = router;
