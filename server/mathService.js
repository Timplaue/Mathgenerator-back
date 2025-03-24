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
    const operations = req.query.operations ? req.query.operations.split(',') : ['+', '-'];

    const base1 = Math.floor(Math.random() * 9) + 2; // случайное основание логарифма (2-10)
    const base2 = Math.floor(Math.random() * 9) + 2;

    const exponent1 = Math.floor(Math.random() * 4) + 1;
    const exponent2 = Math.floor(Math.random() * 4) + 1;

    const num1 = Math.pow(base1, exponent1);
    const num2 = Math.pow(base2, exponent2);

    let expression;
    let answer;

    const operation = operations[Math.floor(Math.random() * operations.length)];

    switch (operation) {
        case '+':
            expression = `log_${base1}(${num1}) + log_${base1}(${num2})`;
            answer = exponent1 + exponent2; // log_a(A) + log_a(B) = log_a(A*B)
            break;
        case '-':
            expression = `log_${base1}(${num1}) - log_${base1}(${num2})`;
            answer = exponent1 - exponent2; // log_a(A) - log_a(B) = log_a(A/B)
            break;
        case '*':
            expression = `log_${base1}(${num1}) * log_${base2}(${num2})`;
            answer = (Math.log(num1) / Math.log(base1)) * (Math.log(num2) / Math.log(base2));
            break;
        case '/':
            expression = `log_${base1}(${num1}) / log_${base2}(${num2})`;
            answer = (Math.log(num1) / Math.log(base1)) / (Math.log(num2) / Math.log(base2));
            break;
        case 'log_change_base':
            expression = `log_${base1}(${num1}) в другой системе log_${base2}`;
            answer = (Math.log(num1) / Math.log(base1)) / (Math.log(base2) / Math.log(base1));
            break;
        default:
            expression = `log_${base1}(${num1}) + log_${base1}(${num2})`;
            answer = exponent1 + exponent2;
    }

    res.json({ example: expression, answer });
});

module.exports = router;
