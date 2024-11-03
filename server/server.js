const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouter = require('./authService');
const mathService = require('./mathService');
const path = require('path'); // Импортируем path для работы с путями
const app = express();
const PORT = 5000;

mongoose.connect('mongodb://localhost:27017/math-generator', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB подключено")).catch(err => console.error("Ошибка:", err));

app.use(cors());
app.use(express.json());

// Настройка раздачи статических файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключаем маршруты аутентификации
app.use('/api/auth', authRouter);

// Генерация математического примера
app.use('/api/math', mathService);

// Проверка ответа пользователя
app.post('/api/check-answer', (req, res) => {
    const { userAnswer, correctAnswer } = req.body;
    res.json({ correct: parseInt(userAnswer) === correctAnswer });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
