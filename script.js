// Load words from the JSON file
let words = [];
fetch('Project FOB.json')
    .then(response => response.json())
    .then(data => {
        words = data;
        showRandomWord();
    });

// App state
let currentWord = null;
let sessionLongestStreak = 0;
let sessionCurrentStreak = 0;
let allTimeLongestStreak = localStorage.getItem('allTimeLongestStreak') || 0;
let incorrectProbability = 0.6; // Default: 60% incorrect words
let isAnimating = false; // Prevent multiple swipes during animation

// DOM elements
const hindiWordElement = document.getElementById("hindi-word");
const englishWordElement = document.getElementById("english-word");
const feedbackElement = document.getElementById("feedback");
const sessionStreakBarElement = document.getElementById("session-streak-bar");
const allTimeStreakBarElement = document.getElementById("all-time-streak-bar");
const sessionStreakCountElement = document.getElementById("session-streak-count");
const allTimeStreakCountElement = document.getElementById("all-time-streak-count");
const wordContainer = document.getElementById("word-container");
const probabilitySlider = document.getElementById("probability-slider");
const sliderValue = document.getElementById("slider-value");
const resetButton = document.getElementById("reset-button");

// Update slider value
probabilitySlider.addEventListener("input", (e) => {
    const value = e.target.value;
    incorrectProbability = value / 100;
    sliderValue.textContent = `${value}%`;
});

// Show a random word pair
function showRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];

    const isCorrect = Math.random() >= incorrectProbability;
    const englishWord = isCorrect ? currentWord.English : getRandomIncorrectWord();

    hindiWordElement.textContent = currentWord.Hindi;
    englishWordElement.textContent = englishWord;
}

// Get a random incorrect English word
function getRandomIncorrectWord() {
    let randomWord;
    do {
        randomWord = words[Math.floor(Math.random() * words.length)].English;
    } while (randomWord === currentWord.English);
    return randomWord;
}

// Handle swipe gestures
let startX = 0;
wordContainer.addEventListener("touchstart", (e) => {
    if (isAnimating) return;
    startX = e.touches[0].clientX;
});

wordContainer.addEventListener("touchend", (e) => {
    if (isAnimating) return;
    const endX = e.changedTouches[0].clientX;
    const difference = endX - startX;

    if (difference > 50) {
        handleSwipe(true); // Swipe right
        addSwipeAnimation("right");
    } else if (difference < -50) {
        handleSwipe(false); // Swipe left
        addSwipeAnimation("left");
    }
});

// Add swipe animation
function addSwipeAnimation(direction) {
    isAnimating = true;
    const animationClass = direction === "right" ? "swipe-right" : "swipe-left";
    wordContainer.classList.add(animationClass);

    setTimeout(() => {
        wordContainer.classList.remove(animationClass);
        isAnimating = false;
    }, 500); // Ensure animation resets after 500ms
}

// Handle the swipe logic
function handleSwipe(userThinksCorrect) {
    const correctAnswer = englishWordElement.textContent === currentWord.English;

    // Show feedback
    feedbackElement.textContent = userThinksCorrect === correctAnswer
        ? "Correct!"
        : `Wrong! Correct: ${currentWord.English}`;
    feedbackElement.style.backgroundColor = userThinksCorrect === correctAnswer ? "#d4edda" : "#f8d7da";
    feedbackElement.style.color = userThinksCorrect === correctAnswer ? "#155724" : "#721c24";
    feedbackElement.style.opacity = 1;

    // Update streaks
    if (userThinksCorrect === correctAnswer) {
        sessionCurrentStreak++;
        if (sessionCurrentStreak > sessionLongestStreak) {
            sessionLongestStreak = sessionCurrentStreak;
        }
        if (sessionLongestStreak > allTimeLongestStreak) {
            allTimeLongestStreak = sessionLongestStreak;
            localStorage.setItem('allTimeLongestStreak', allTimeLongestStreak);
        }
    } else {
        sessionCurrentStreak = 0; // Reset streak
    }

    // Update streak bars
    sessionStreakCountElement.textContent = sessionLongestStreak;
    allTimeStreakCountElement.textContent = allTimeLongestStreak;
    sessionStreakBarElement.style.width = `${(sessionCurrentStreak / sessionLongestStreak) * 100}%`;
    allTimeStreakBarElement.style.width = `${(allTimeLongestStreak / sessionLongestStreak) * 100}%`;

    // Show the next word after a delay
    setTimeout(() => {
        feedbackElement.style.opacity = 0; // Hide feedback
        showRandomWord(); // Show new word
    }, 1000);
}

// Reset button functionality
resetButton.addEventListener("click", () => {
    sessionCurrentStreak = 0;
    sessionLongestStreak = 0;
    localStorage.setItem('allTimeLongestStreak', 0);
    allTimeLongestStreak = 0;

    // Reset streak bars
    sessionStreakCountElement.textContent = 0;
    allTimeStreakCountElement.textContent = 0;
    sessionStreakBarElement.style.width = "0%";
    allTimeStreakBarElement.style.width = "0%";

    // Show a new word
    showRandomWord();
});

// Register service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("./sw.js")
        .then(() => console.log("Service Worker Registered"))
        .catch((error) => console.error("Service Worker Registration Failed:", error));
}
