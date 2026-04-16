        // Word Configuration
        const WORD_LIST = [
            "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", 
            "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", 
            "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", 
            "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", 
            "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", 
            "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", 
            "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", 
            "new", "want", "because", "any", "these", "give", "day", "most", "us", "code", "dev", "web", 
            "cyber", "punk", "hack", "git", "tech", "data", "byte", "hash", "server", "cloud", "script", 
            "flow", "state", "null", "void", "test", "fast", "type", "loop", "node", "line", "path", "base", 
            "sync", "port", "root"
        ];
        
        const NUM_WORDS = 30; // Length of test

        // State Variables
        let words = [];
        let currentWordIndex = 0;
        let currentLetterIndex = 0;
        let isStarted = false;
        let isFinished = false;
        let startTime = null;
        let timerInterval = null;
        let timeElapsed = 0;

        // DOM Elements
        const wordsWrapper = document.getElementById('words-wrapper');
        const caret = document.getElementById('caret');
        const hiddenInput = document.getElementById('hidden-input');
        const typingContainer = document.getElementById('typing-container');
        const focusWarning = document.getElementById('focus-warning');

        const header = document.getElementById('header');
        const wpmDisplay = document.getElementById('wpm');
        const accDisplay = document.getElementById('acc');
        const timeDisplay = document.getElementById('time');

        const typingView = document.getElementById('typing-view');
        const resultsView = document.getElementById('results-view');
        const btnRestart = document.getElementById('btn-restart');

        // Initialization
        document.addEventListener('DOMContentLoaded', () => {
            initTest();
            
            // Interaction / Focus Binding
            typingContainer.addEventListener('click', () => {
                if (!isFinished) hiddenInput.focus();
            });

            hiddenInput.addEventListener('blur', () => {
                if (!isFinished) {
                    wordsWrapper.classList.add('blurred');
                    focusWarning.classList.add('visible');
                    caret.classList.add('hidden');
                }
            });

            hiddenInput.addEventListener('focus', () => {
                wordsWrapper.classList.remove('blurred');
                focusWarning.classList.remove('visible');
                caret.classList.remove('hidden');
            });

            btnRestart.addEventListener('click', initTest);
        });

        function initTest() {
            // Reset Flags & State
            isStarted = false;
            isFinished = false;
            currentWordIndex = 0;
            currentLetterIndex = 0;
            timeElapsed = 0;
            clearInterval(timerInterval);
            
            // Reset Views
            typingView.style.display = 'block';
            resultsView.classList.remove('active');
            header.classList.remove('active');
            
            wpmDisplay.innerText = '0';
            accDisplay.innerText = '100%';
            timeDisplay.innerText = '0s';

            // Generate Words
            words = [];
            wordsWrapper.innerHTML = '';
            wordsWrapper.appendChild(caret);
            wordsWrapper.style.transform = `translateY(0)`;
            
            for (let i = 0; i < NUM_WORDS; i++) {
                words.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
            }

            // Render DOM Words
            words.forEach((word) => {
                const wordEl = document.createElement('div');
                wordEl.className = 'word';
                for (let i = 0; i < word.length; i++) {
                    const letterEl = document.createElement('span');
                    letterEl.className = 'letter';
                    letterEl.innerText = word[i];
                    wordEl.appendChild(letterEl);
                }
                wordsWrapper.appendChild(wordEl);
            });

            updateCaretPosition();
            
            // Wait slightly for DOM render to guarantee focus properly
            setTimeout(() => {
                hiddenInput.value = '';
                hiddenInput.focus();
            }, 10);
        }

        function startTimer() {
            isStarted = true;
            header.classList.add('active');
            startTime = Date.now();
            timerInterval = setInterval(() => {
                timeElapsed = Math.floor((Date.now() - startTime) / 1000);
                timeDisplay.innerText = timeElapsed + 's';
                updateLiveStats();
            }, 1000);
        }

        function updateLiveStats() {
            const timeInMin = Math.max(0.01, timeElapsed / 60);
            let correctChars = 0;
            let totalChars = 0;

            const wordEls = wordsWrapper.querySelectorAll('.word');
            wordEls.forEach(wordEl => {
                const letters = wordEl.querySelectorAll('.letter');
                letters.forEach(l => {
                    if (l.classList.contains('correct')) correctChars++;
                    if (l.classList.contains('correct') || l.classList.contains('incorrect')) totalChars++;
                });
            });

            const wpm = Math.floor((correctChars / 5) / timeInMin);
            wpmDisplay.innerText = Math.max(0, wpm);
            
            if (totalChars > 0) {
                const accuracy = Math.floor((correctChars / totalChars) * 100);
                accDisplay.innerText = accuracy + '%';
            }
        }

        function updateCaretPosition() {
            const wordEls = wordsWrapper.querySelectorAll('.word');
            const currentWordEl = wordEls[currentWordIndex];
            if (!currentWordEl) return;
            
            let left = 0;
            let top = 0;

            if (currentLetterIndex < currentWordEl.childNodes.length) {
                const letterEl = currentWordEl.childNodes[currentLetterIndex];
                left = letterEl.offsetLeft;
                top = letterEl.offsetTop;
            } else {
                const lastChild = currentWordEl.lastChild;
                if (lastChild) {
                    left = lastChild.offsetLeft + lastChild.offsetWidth;
                    top = lastChild.offsetTop;
                } else {
                    left = currentWordEl.offsetLeft;
                    top = currentWordEl.offsetTop;
                }
            }

            caret.style.transform = `translate(${left}px, ${top}px)`;

            // Handle Smart Scrolling
            if (currentWordIndex > 0) {
                const firstWordTop = wordEls[0].offsetTop;
                const currentLineHeightOffset = top - firstWordTop;
                const lineHeight = currentWordEl.offsetHeight || 38;
                
                // Keep the current line within the viewable box by shiftingwrapper up
                if (currentLineHeightOffset > lineHeight * 1.5) {
                    const shiftAmount = currentLineHeightOffset - lineHeight;
                    wordsWrapper.style.transform = `translateY(-${shiftAmount}px)`;
                } else {
                    wordsWrapper.style.transform = `translateY(0)`;
                }
            } else {
                wordsWrapper.style.transform = `translateY(0)`;
            }
        }

        // Logic processing
        hiddenInput.addEventListener('keydown', (e) => {
            if (isFinished) {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    initTest();
                }
                return;
            }

            // Keyboard Shortcuts
            if (e.key === 'Tab' || e.key === 'Escape') {
                e.preventDefault();
                initTest();
                return;
            }

            // Ignore system inputs
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter') return;

            // Timer Trigger
            if (!isStarted && e.key.length === 1) {
                startTimer();
            }

            const wordEls = wordsWrapper.querySelectorAll('.word');
            const currentWordEl = wordEls[currentWordIndex];
            if (!currentWordEl) return;

            const letterEls = currentWordEl.querySelectorAll('.letter');
            const expectedWord = words[currentWordIndex];

            // Handle Backspace
            if (e.key === 'Backspace') {
                e.preventDefault();
                if (currentLetterIndex > 0) {
                    // Navigate backwards in word
                    const isExtra = currentLetterIndex > expectedWord.length;
                    if (isExtra) {
                        currentWordEl.lastChild.remove();
                    } else {
                        letterEls[currentLetterIndex - 1].classList.remove('correct', 'incorrect');
                    }
                    currentLetterIndex--;
                } else if (currentWordIndex > 0) {
                    // Navigate to previous word only if contained an error
                    const prevWordEl = wordEls[currentWordIndex - 1];
                    const hasError = prevWordEl.querySelectorAll('.incorrect').length > 0 || prevWordEl.classList.contains('error');
                    
                    if (hasError) {
                        currentWordIndex--;
                        currentLetterIndex = prevWordEl.childNodes.length;
                        currentWordEl.classList.remove('error');
                    }
                }
                
                // Clear word-level error status if going back to edit
                if (currentWordEl.classList.contains('error')) {
                    currentWordEl.classList.remove('error');
                }

                updateCaretPosition();
                return;
            }

            // Handle Spacebar / Next Word Navigation
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                // Prevent consecutive spaces jumping words infinitely
                if (currentLetterIndex === 0) return; 

                // Check for incompletion or errors and tag word visual accordingly
                const hasError = currentWordEl.querySelectorAll('.incorrect').length > 0 || currentLetterIndex < expectedWord.length;
                if (hasError) currentWordEl.classList.add('error');
                else currentWordEl.classList.remove('error');

                if (currentWordIndex === NUM_WORDS - 1) {
                    finishTest();
                } else {
                    currentWordIndex++;
                    currentLetterIndex = 0;
                    updateCaretPosition();
                }
                return;
            }

            e.preventDefault(); // Stop standard writing from registering completely

            // Process Standard Key Entry
            if (currentLetterIndex >= expectedWord.length) {
                // Type extra characters bounding to +10 overflow max
                if (currentLetterIndex < expectedWord.length + 10) {
                    const extraEl = document.createElement('span');
                    extraEl.className = 'letter incorrect extra';
                    extraEl.innerText = e.key;
                    currentWordEl.appendChild(extraEl);
                    currentLetterIndex++;
                }
            } else {
                // Determine correctness
                const expectedLetter = expectedWord[currentLetterIndex];
                if (e.key === expectedLetter) {
                    letterEls[currentLetterIndex].classList.add('correct');
                } else {
                    letterEls[currentLetterIndex].classList.add('incorrect');
                }
                currentLetterIndex++;
            }

            updateLiveStats();

            // Automatic completion if exactly matched out at exactly the end
            if (currentWordIndex === NUM_WORDS - 1 && currentLetterIndex === expectedWord.length) {
                const hasError = currentWordEl.querySelectorAll('.incorrect').length > 0;
                if (!hasError) {
                     finishTest();
                     return;
                }
            }
            
            updateCaretPosition();
        });

        function finishTest() {
            isFinished = true;
            clearInterval(timerInterval);
            
            const timeInMin = Math.max(0.01, timeElapsed / 60);
            let correctChars = 0;
            let totalChars = 0;

            // Compute aggregations across complete DOM text status evaluation
            const wordEls = wordsWrapper.querySelectorAll('.word');
            wordEls.forEach(wordEl => {
                const letters = wordEl.querySelectorAll('.letter');
                letters.forEach(l => {
                    if (l.classList.contains('correct')) correctChars++;
                    if (l.classList.contains('correct') || l.classList.contains('incorrect')) totalChars++;
                });
            });

            // Standard typing test calculus based mathematically on 5 keys matching 1 word equivalency metric calculation
            const netWpm = Math.max(0, Math.floor((correctChars / 5) / timeInMin));
            const grossWpm = Math.max(0, Math.floor((totalChars / 5) / timeInMin));
            const accuracy = totalChars > 0 ? Math.floor((correctChars / totalChars) * 100) : 100;
            
            document.getElementById('final-wpm').innerText = netWpm;
            document.getElementById('final-acc').innerText = accuracy + '%';
            document.getElementById('final-raw').innerText = grossWpm;
            
            // UX flow transfer rendering transition execution
            typingView.style.display = 'none';
            wordsWrapper.classList.add('blurred'); // keep layout static underneath theoretically
            header.classList.remove('active');
            
            resultsView.classList.add('active');
            btnRestart.focus();
        }
