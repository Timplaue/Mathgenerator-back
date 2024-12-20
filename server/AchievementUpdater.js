const mongoose = require('mongoose');
const Achievement = require('./models/Achievement');

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/math-generator', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Подключение к MongoDB успешно"))
    .catch(err => console.error("Ошибка подключения к MongoDB:", err));

// Данные для загрузки
const achievementsData = [
    {
        title: "Первое решение!",
        description: "Решите свой первый пример",
        icon: "http://localhost:5000/uploads/achiv/first-comleted.svg",
        condition: "user.examplesSolved >= 1",
        rewardPoints: 10
    },
    {
        title: "Отличник",
        description: "Получите 10/10 на любом уровне",
        icon: "http://localhost:5000/uploads/achiv/trophy10.svg",
        condition: "user.perfectScores >= 1",
        rewardPoints: 50
    },
    {
        title: "Скоростной ум!",
        description: "Пройдите уровень за менее чем 60 секунд",
        icon: "http://localhost:5000/uploads/achiv/trophytime.svg",
        condition: "user.bestTime <= 60",
        rewardPoints: 100
    }
];

// Функция загрузки данных
const loadAchievements = async () => {
    try {
        // Очистка предыдущих данных (опционально)
        await Achievement.deleteMany({});
        console.log("Старые достижения удалены.");

        // Загрузка новых данных
        await Achievement.insertMany(achievementsData);
        console.log("Достижения успешно загружены.");
        mongoose.connection.close();
    } catch (error) {
        console.error("Ошибка загрузки достижений:", error);
        mongoose.connection.close();
    }
};

// Запуск загрузки
loadAchievements();
