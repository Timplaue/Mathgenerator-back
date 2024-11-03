const express = require('express');
const router = express.Router();

// Генерация примера с произвольным количеством чисел
const generateExample = (numbers, operations) => {
    let example = '';
    let answer = numbers[0];

    for (let i = 1; i < numbers.length; i++) {
        const operation = operations[Math.floor(Math.random() * operations.length)];
        const formattedNum = numbers[i] < 0 ? `(${numbers[i]})` : numbers[i];

        example += `${operation} ${formattedNum} `;

        switch (operation) {
            case '+': answer += numbers[i]; break;
            case '-': answer -= numbers[i]; break;
            case '*': answer *= numbers[i]; break;
            case '/': answer = answer % numbers[i] === 0 ? answer / numbers[i] : answer; break;
            default: break;
        }
    }

    return { example: `${numbers[0]} ${example.trim()}`, answer };
};

// Маршрут генерации примеров
router.get('/generate', (req, res) => {
    const { difficulty, count = 2, operations = '+,-,*,/' } = req.query;
    const operationList = operations.split(',');
    const numCount = Math.max(2, parseInt(count, 10));

    let min, max;

    // Определяем диапазоны в зависимости от сложности
    switch (difficulty) {
        case 'easy':
            min = 0;
            max = 9;
            break;
        case 'normal':
            min = 0;
            max = 99;
            break;
        case 'hard':
            min = 10;
            max = 999;
            break;
        default:
            return res.status(400).json({ error: 'Неверная сложность' });
    }

    // Генерируем случайные числа в указанном диапазоне
    let numbers = Array.from({ length: numCount }, () => Math.floor(Math.random() * (max - min + 1)) + min);

    const result = generateExample(numbers, operationList);
    res.json({ example: result.example, answer: result.answer });
});

module.exports = router;
