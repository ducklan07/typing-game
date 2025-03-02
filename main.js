document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen')
    const wordsContainer = document.getElementById('words-container')
    const typingInput = document.getElementById('typing-input');
    const startText = document.getElementById('start-text')
    const timeSurvivedElement = document.getElementById('time-survived')
    const wordsKilledElement = document.getElementById('words-killed')

    const gameState = {
        status: 'start',
        words: [],
        activeWordIndex: -1,
        wordsKilled: 0,
        startTime: 0,
        wordSpeed: 1,
        wordGenerationInterval: 2000,
        difficulty: 1,
        gameLoopId: null,
        wordGeneratorId: null
    };

    const wordDictionary = [
        'code', 'programming', 'javascript', 'html', 'css', 'game',
        'typing', 'word', 'keyboard', 'screen', 'function', 'variable',
        'object', 'array', 'string', 'number', 'boolean', 'method',
        'property', 'element', 'document', 'window', 'event', 'loop',
        'recursion', 'algorithm', 'data', 'structure', 'interface'
    ];

    typingInput.focus();
    window.addEventListener('click', () => typingInput.focus());

    typingInput.addEventListener('input', handleInput);

    document.addEventListener('keydown', (e) => {
        if (gameState.status === 'gameOver' && e.key === 'Enter') {
            resetGame();
            startGame();
        }
    });

    function handleInput() {
        const currentInput = typingInput.value.toLowerCase();

        if (gameState.status === 'start') {
            updateStartText(currentInput);

            if (currentInput === 'start') {
                setTimeout(() => {
                    startGame();
                }, 500);
            }
        } else if (gameState.status === 'playing') {
            findActiveWord(currentInput);

            if (gameState.activeWordIndex !== -1) {
                const activeWord = gameState.words[gameState.activeWordIndex];
                updateWordDisplay(activeWord, currentInput);

                if (currentInput === activeWord.text) {
                    killWord(gameState.activeWordIndex);
                    typingInput.value = '';
                    gameState.activeWordIndex = -1;
                    gameState.wordsKilled++;

                    gameState.difficulty += 0.1;
                }
            }
        }
    }

    function updateStartText(input) {
        let html = '';
        const targetWord = 'start';

        for (let i = 0; i < targetWord.length; i++) {
            if (i < input.length) {
                if (input[i] === targetWord[i]) {
                    html += `<span class="matched">${targetWord[i]}</span>`;
                } else {
                    html += `<span class="unmatched">${targetWord[i]}</span>`
                }
            } else {
                html += targetWord[i];
            }
        }

        startText.innerHTML = html;
    }

    function startGame() {
        gameState.status = 'playing';
        gameState.startTime = Date.now();
        gameState.wordsKilled = 0;

        startScreen.classList.add('hidden')
        gameScreen.classList.remove('hidden');

        typingInput.value = '';
        typingInput.focus();

        gameState.wordGeneratorId = setInterval(generateWord, gameState.wordGenerationInterval)

        gameState.gameLoopId = requestAnimationFrame(gameLoop);
    }

    function generateWord() {
        const randomWord = wordDictionary[Math.floor(Math.random() * wordDictionary.length)];
        const randomTop = Math.random() * (window.innerHeight - 100);

        const wordElement = document.createElement('div');
        wordElement.classList.add('word');
        wordElement.textContent = randomWord;
        wordElement.style.top = `${randomTop}px`
        wordElement.style.left = '0px';

        wordsContainer.appendChild(wordElement);

        gameState.words.push({
            text: randomWord,
            element: wordElement,
            position: 0,
            completed: false,
            matched: false
        })
    }

    function gameLoop() {
        const rightBoundary = window.innerWidth;

        gameState.words.forEach((word, index) => {
            if (!word.completed) {
                word.position += gameState.wordSpeed * gameState.difficulty;
                word.element.style.left = `${word.position}px`;

                if (word.position > rightBoundary - 100) {
                    endGame();
                    return;
                }
            }
        });

        if (gameState.status === 'playing') {
            gameState.gameLoopId = requestAnimationFrame(gameLoop);
        }
    }

    function findActiveWord(input) {
        if (input === '') {
            if (gameState.activeWordIndex !== -1 && gameState.words[gameState.activeWordIndex]) {
                gameState.words[gameState.activeWordIndex].element.classList.remove('active-word');
                gameState.words[gameState.activeWordIndex].element.textContent = gameState.words[gameState.activeWordIndex].text;
                gameState.activeWordIndex = -1;
            }
            return;
        }
        if (gameState.activeWordIndex !== -1) {
            const activeWord = gameState.words[gameState.activeWordIndex];
            if (activeWord && !activeWord.completed && input.length <= activeWord.text.length) {
                updateWordDisplay(activeWord, input);
                return;
            } else {
                if (activeWord && activeWord.element) {
                    activeWord.element.classList.remove('active-word');
                    activeWord.element.textContent = activeWord.text;
                }
                gameState.activeWordIndex = -1;
            }
        }

        for (let i = 0; i < gameState.words.length; i++) {
            const word = gameState.words[i];
            if (!word.completed && input === word.text.substring(0, input.length)) {
                gameState.activeWordIndex = i;
                word.element.classList.add('active-word');
                updateWordDisplay(word, input);
                break;
            }
        }
    }

    function updateWordDisplay(word, input) {
        let html = '';

        for (let i = 0; i < word.text.length; i++) {
            if (i < input.length) {
                if (input[i] === word.text[i]) {
                    html += `<span class="matched">${word.text[i]}</span>`;
                } else {
                    html += `<span class="unmatched">${word.text[i]}</span>`;
                }
                console.log(html);
            } else {
                html += word.text[i]
            }
        }

        word.element.innerHTML = html;
    }

    function killWord(index) {
        const word = gameState.words[index];
        word.completed = true;
        word.element.classList.add('hidden');
        setTimeout(() => {
            if (word.element.parentNode) {
                word.element.parentNode.removeChild(word.element);
            }
        }, 100);
    }

    function endGame() {
        gameState.status ='gameOver';

        clearInterval(gameState.wordGeneratorId);
        cancelAnimationFrame(gameState.gameLoopId);

        const timeElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);

        timeSurvivedElement.textContent = timeElapsed;
        wordsKilledElement.textContent = gameState.wordsKilled;

        gameScreen.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
    }

    function resetGame() {
        wordsContainer.innerHTML = '';
        gameState.words = [];
        gameState.activeWordIndex = -1;

        gameState.difficulty = 1;

        gameOverScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');

        typingInput.value = '';
        startText.textContent = 'start';

        gameState.status = 'start';
    }
});