const express = require('express');
const router = express.Router();

// Генерация примера с целочисленным делением
const generateExample = (numbers, operations) => {
    let example = `${numbers[0]}`;
    let answer = numbers[0];

    for (let i = 1; i < numbers.length; i++) {
        let operation = operations[Math.floor(Math.random() * operations.length)];
        let currentNum = numbers[i];

        if (operation === '/') {
            // Проверяем делимость нацело, если не делится, находим подходящее число
            while (answer % currentNum !== 0 || currentNum === 0) {
                currentNum = Math.floor(Math.random() * 9) + 1; // подбираем число от 1 до 9
            }
            answer = answer / currentNum;
        } else if (operation === '*') {
            answer *= currentNum;
        } else if (operation === '+') {
            answer += currentNum;
        } else if (operation === '-') {
            answer -= currentNum;
        }

        // Формируем строку примера с правильным порядком операций
        example += ` ${operation} ${currentNum}`;
    }

    return { example, answer };
};

// Маршрут генерации примеров
router.get('/generate', (req, res) => {
    const { difficulty, count = 2, operations = '+,-,*,/' } = req.query;
    const operationList = operations.split(',');
    const numCount = Math.max(2, parseInt(count, 10));

    let min, max;

    switch (difficulty) {
        case 'easy':
            min = 1;
            max = 9;
            break;
        case 'normal':
            min = 1;
            max = 99;
            break;
        case 'hard':
            min = 10;
            max = 99;
            break;
        default:
            return res.status(400).json({ error: 'Неверная сложность' });
    }

    let numbers = Array.from({ length: numCount }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    const result = generateExample(numbers, operationList);
    res.json({ example: result.example, answer: result.answer });
});

module.exports = router;
