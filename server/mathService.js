const express = require('express');
const router = express.Router();

const generateExample = (numbers, operations) => {
    let exampleParts = [];
    let answer = numbers[0];
    let stack = [numbers[0].toString()];

    for (let i = 1; i < numbers.length; i++) {
        let operation = operations[Math.floor(Math.random() * operations.length)];
        let currentNum = numbers[i];

        if (operation === '/') {
            while (answer % currentNum !== 0 || currentNum === 0) {
                currentNum = Math.floor(Math.random() * 9) + 1;
            }
            answer = answer / currentNum;
        } else if (operation === '*') {
            answer *= currentNum;
        } else if (operation === '+') {
            answer += currentNum;
        } else if (operation === '-') {
            answer -= currentNum;
        } else if (operation === '^') {
            currentNum = Math.floor(Math.random() * 6);
            answer = Math.pow(answer, currentNum);
        } else if (operation === '√') {
            const perfectSquares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 900, 1024, 1600, 2025, 2500];
            currentNum = perfectSquares[Math.floor(Math.random() * perfectSquares.length)];
            stack = [`√${currentNum}`];
            answer = Math.sqrt(currentNum);
            continue;
        }

        // Решаем, ставить ли скобки
        if (Math.random() > 0.5 && i < numbers.length - 1) {
            stack.unshift('(');
            stack.push(`${operation} ${currentNum})`);
        } else {
            stack.push(`${operation} ${currentNum}`);
        }
    }

    return { example: stack.join(' '), answer };
};

router.get('/generate', (req, res) => {
    const { min = 1, max = 99, count = 2, operations = '+,-,*,/,^,√' } = req.query;

    const minNum = parseInt(min, 10);
    const maxNum = parseInt(max, 10);
    const numCount = Math.max(2, parseInt(count, 10));
    const operationList = operations.split(',');

    if (minNum >= maxNum) {
        return res.status(400).json({ error: 'Неверный диапазон чисел' });
    }

    const numbers = Array.from(
        { length: numCount },
        () => Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
    );

    const result = generateExample(numbers, operationList);
    res.json({ example: result.example, answer: result.answer });
});

module.exports = router;


router.get('/generate-quadratic', (req, res) => {
    const minValue = -10;
    const maxValue = 10;

    const x1 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    const x2 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

    const a = Math.floor(Math.random() * 5) + 1;
    const b = -a * (x1 + x2);
    const c = a * x1 * x2;

    const example = `${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} = 0`;

    res.json({
        example,
        answer: Math.max(x1, x2),
    });
});

router.get('/generate-log', (req, res) => {
    const base = Math.floor(Math.random() * 9) + 2; // Основание от 2 до 10
    const exponent = Math.floor(Math.random() * 4) + 1; // Степень от 1 до 4
    const value = Math.pow(base, exponent); // Значение как степень основания

    const example = `log_${base}(${value})`;
    const answer = Math.log(value) / Math.log(base);

    res.json({
        example,
        answer
    });
});

module.exports = router;
