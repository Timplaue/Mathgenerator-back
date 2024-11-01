const express = require('express');
const router = express.Router();

// Генерация математического примера
const generateExample = (num1, num2, operations) => {
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const formattedNum2 = num2 < 0 ? `(${num2})` : num2;

    switch (operation) {
        case '+':
            return { example: `${num1} + ${formattedNum2}`, answer: num1 + num2 };
        case '-':
            return { example: `${num1} - ${formattedNum2}`, answer: num1 - num2 };
        case '*':
            return { example: `${num1} * ${formattedNum2}`, answer: num1 * num2 };
        case '/':
            if (num2 !== 0 && num1 % num2 === 0) {
                return { example: `${num1} / ${formattedNum2}`, answer: num1 / num2 };
            } else {
                return generateExample(num1, num2, operations.filter(op => op !== '/'));
            }
        default:
            return { example: `${num1} + ${formattedNum2}`, answer: num1 + num2 };
    }
};

// Маршрут генерации примеров
router.get('/generate', (req, res) => {
    const { difficulty } = req.query;
    let example, answer;

    switch (difficulty) {
        case 'easy': {
            const num1 = Math.floor(Math.random() * 10);
            const num2 = Math.floor(Math.random() * 10);
            const operations = ['+', '-', '*', '/'];
            const result = generateExample(num1, num2, operations);
            example = result.example;
            answer = result.answer;
            break;
        }
        case 'normal': {
            const num1 = Math.floor(Math.random() * 100) - 50;
            const num2 = Math.floor(Math.random() * 100) - 50;
            const operations = ['+', '-', '*', '/'];
            const result = generateExample(num1, num2, operations);
            example = result.example;
            answer = result.answer;
            break;
        }
        case 'hard': {
            const num1 = Math.floor(Math.random() * 200) - 100;
            const num2 = Math.floor(Math.random() * 200) - 100;
            const operations = ['+', '-', '*', '/'];
            const result = generateExample(num1, num2, operations);
            example = result.example;
            answer = result.answer;
            break;
        }
        default:
            return res.status(400).send('Неверная сложность');
    }

    res.json({ example, answer });
});

module.exports = router;
