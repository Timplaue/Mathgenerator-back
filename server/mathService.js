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
            stack = [`\\sqrt[2]${currentNum}`];
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

    let expression;
    let answer;
    let validExpressionFound = false;
    let attempts = 0;
    const maxAttempts = 20;

    // Пробуем сгенерировать выражение с целым ответом
    while (!validExpressionFound && attempts < maxAttempts) {
        attempts++;

        // Выбираем случайную операцию
        const operation = operations[Math.floor(Math.random() * operations.length)];

        // Генерируем основание логарифма (не может быть 1)
        const base1 = Math.floor(Math.random() * 8) + 2; // основание от 2 до 9
        const base2 = operation === '+' || operation === '-' ?
            base1 : // для сложения и вычитания основания должны быть одинаковые
            Math.floor(Math.random() * 8) + 2; // для других операций - другое основание

        // Выбираем показатели, чтобы получить целые логарифмы
        const exponent1 = Math.floor(Math.random() * 3) + 1; // от 1 до 3
        const exponent2 = Math.floor(Math.random() * 3) + 1; // от 1 до 3

        // Генерируем числа, которые являются степенями основания
        const num1 = Math.pow(base1, exponent1);
        const num2 = Math.pow(base2, exponent2);

        switch (operation) {
            case '+':
                // log_a(M) + log_a(N) = log_a(M * N)
                expression = `log_{${base1}}(${num1}) + log_{${base1}}(${num2})`;
                answer = exponent1 + exponent2; // Это будет целое число, т.к. log_a(a^n) = n
                validExpressionFound = true;
                break;

            case '-':
                // log_a(M) - log_a(N) = log_a(M / N)
                // Убедимся, что первое число больше, чтобы получить положительный ответ
                if (exponent1 > exponent2) {
                    expression = `log_{${base1}}(${num1}) - log_{${base1}}(${num2})`;
                    answer = exponent1 - exponent2; // Это будет целое число
                    validExpressionFound = true;
                }
                break;

            case '*':
                // log_a(M) * n = log_a(M^n)
                // Для простоты умножим логарифм на целое число
                const multiplier = Math.floor(Math.random() * 3) + 2; // множитель от 2 до 4
                expression = `log_{${base1}}(${num1}) * ${multiplier}`;
                answer = exponent1 * multiplier;
                validExpressionFound = true;
                break;

            case '/':
                // log_a(M) / log_a(N) = log_N(M)
                expression = `log_{${base1}}(${num1}) / log_{${base1}}(${base2})`;
                // Проверяем, будет ли результат целым числом
                const divResult = Math.log(num1) / Math.log(base2);
                if (Math.abs(divResult - Math.round(divResult)) < 0.0001) {
                    answer = Math.round(divResult);
                    validExpressionFound = true;
                }
                break;

            case 'log_change_base':
                // log_a(b^n) = n * log_a(b)
                expression = `log_{${base1}}(${Math.pow(base2, exponent2)})`;
                // Для некоторых комбинаций оснований ответ может быть целым
                const changeBaseResult = exponent2 * (Math.log(base2) / Math.log(base1));
                if (Math.abs(changeBaseResult - Math.round(changeBaseResult)) < 0.0001) {
                    answer = Math.round(changeBaseResult);
                    validExpressionFound = true;
                }
                break;

            default:
                // Стандартный случай: простой логарифм
                expression = `log_{${base1}}(${num1})`;
                answer = exponent1;
                validExpressionFound = true;
        }
    }

    // Если после нескольких попыток не нашли выражение с целым ответом, создаем простой пример
    if (!validExpressionFound) {
        const base = Math.floor(Math.random() * 8) + 2;
        const exponent = Math.floor(Math.random() * 3) + 1;
        const num = Math.pow(base, exponent);
        expression = `log_{${base}}(${num})`;
        answer = exponent;
    }

    res.json({
        example: expression,
        answer: answer,
        answerFormatted: `${answer} (целое число)`
    });
});

module.exports = router;
