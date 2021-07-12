// GAME CONSTANTS
const CARD_COLUMNS = 6;
const MAX_CARDS = CARD_COLUMNS * CARD_COLUMNS; // This variable should not be changed (total number of cards)
const MAX_MATCHES = MAX_CARDS / 2; // This variable should not be changed (total number of possible matches)
const MAX_ID = 151; // Max ID of Pokemon to implement (151 to respresent Gen 1)
const MAX_MINUTES = 1; // Total minutes to complete game
const MAX_SECONDS = 0; // Total seconds to complete game

// GAME VARIABLES
let deck = []; // The deck will be dynamically created
let matched = []; // Matching pairs found will be added here
let flippedCards = []; // Flipped cards will go here (two at a time)
let rating = 0;
let moves = 0;
let matches = 0;
let timer;
let minutes = MAX_MINUTES;
let seconds = MAX_SECONDS;
// GAME ELEMENTS
const board = document.querySelector(".board");
const matchesText = document.querySelector(".matchesText");
const movesText = document.querySelector(".movesText");
const timerText = document.querySelector(".timerText");
const resetButton = document.querySelector(".resetButton");

// GAME STATES
const gameStates = {
    won: {
        message: "Congratulations!",
        submessage: `You found all ${MAX_MATCHES} matches. You are a Pokémon Matching Master!`,
    },
    lost: {
        message: "Oh no!",
        submessage: `You managed to match ${matches / 2} Pokémon. You were missing ${MAX_MATCHES - (matches / 2)}.`,
    }
}

const createGameBoard = () => {
    // Create Deck
    createDeck();
    shuffleDeck();
    // Set Board Grid Size to CARD_COLUMNS Variable
    board.style.gridTemplateColumns = `repeat(${CARD_COLUMNS}, 1fr)`;
    // Loop Through # of Rows and Columns Necessary Based on CARD_COLUMNS Variable
    for (let i = 0; i < MAX_CARDS; i++) {
        // Create a Card for Position on Board
        let card = createCard();
        card.id = i;
        card.style.pointerEvents = "auto";
        let cardFront = card.querySelector(".card-front");
        cardFront.append(deck[i]);
        board.appendChild(card);
    }
}

// ~~~~~~~~~~
// RESET GAME
// ~~~~~~~~~~
const resetGame = () => {
    // Start timer if not already started (timer is undefined)
    if (timer) { stopTimer(); }
    hideModal();
    moves = 0;
    matches = 0;
    minutes = MAX_MINUTES;
    seconds = MAX_SECONDS;
    board.textContent = "";
    // Add "0" when seconds are in single digits, otherwise slice string to only two numbers (seconds in the 10th digits)
    timerText.innerHTML = minutes + ":" + ('0' + seconds).slice(-2);
    createGameBoard();
}

const createCard = () => {
    // Create Card Element
    let card = document.createElement("div");
    card.classList.add("card-container");

    // Create Inner Card
    let innerCard = document.createElement("div");
    innerCard.classList.add("inner-card");

    // Create Back of Card
    let cardBack = document.createElement("div");
    cardBack.classList.add("card-back");

    // Create Front of Card
    let cardFront = document.createElement("div");
    cardFront.classList.add("card-front");
    cardFront.style.padding = "10%";

    // Add Front & Back of Card to Inner Card
    innerCard.appendChild(cardBack);
    innerCard.appendChild(cardFront);

    // Add Inner Card to Card Container
    card.appendChild(innerCard);

    return card;
}

const createDeck = () => {
    // TODO: ENSURE NO RANDOM IDs ARE DUPLICATED

    // Loop through array by the amount of total cards in deck
    for (let i = 0; i < MAX_CARDS; i += 2) {
        // Create an image element to go into the deck
        let img = document.createElement("img");
        // Create a random id for the image 
        let randID = Math.floor(Math.random() * MAX_ID + 1);
        // Set the img src and alt attributes
        img.src = `https://pokeres.bastionbot.org/images/pokemon/${randID}.png`;
        img.alt = `Pokemon #${randID}`;
        // Add image to deck
        deck.push(img);
        // Create a matching image to go into the deck
        let matchingImg = document.createElement("img");
        matchingImg.src = img.src;
        matchingImg.alt = img.alt;
        deck.push(matchingImg);
    }
}

const shuffleDeck = () => {
    deck.sort(() => Math.random() - 0.5);
    deck.sort(() => Math.random() - 0.5);
    deck.sort(() => Math.random() - 0.5);
}

// ~~~~~~~~~~~
// START TIMER
// ~~~~~~~~~~~
const startTimer = () => {
    timer = setInterval(() => {
        seconds--;
        if (seconds < 0) {
            minutes--;
            seconds = 59;
        }

        timerText.innerHTML = minutes + ":" + (('0' + seconds).slice(-2));

        if (minutes <= 0 && seconds <= 0) {
            handleGameEnd();
        }
    }, 1000);
}

// ~~~~~~~~~~
// STOP TIMER
// ~~~~~~~~~~
const stopTimer = () => {
    timer = clearInterval(timer);
}

const flipCard = (card) => {
    // TODO: (FIX NEEDED) The same card can be "flipped" twice if tapped quickly enough
    // Do not flip card(s) if two are already flipped
    if (flippedCards.length === 2) { return; }
    // Add flip class to card, but only if it does not have it already (which it shouldn't)
    card.classList.contains("flip") ? card.classList.remove("flip") : card.classList.add("flip");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

// ~~~~~~~~~~~~~~~
// CHECK FOR MATCH
// ~~~~~~~~~~~~~~~
const checkForMatch = () => {
    // Ensure two cards are flipped before executing logic
    if (flippedCards.length !== 2) { return; }
    // Prevent clicks on the board until cards are assessed for a match
    document.body.style.pointerEvents = "none";

    // Get images of both flipped cards
    let img1 = flippedCards[0].querySelector("img");
    let img2 = flippedCards[1].querySelector("img");
    setTimeout(() => {
        if (img1.src === img2.src) {
            handleMatch();
        } else {
            unflipCards();
        }
    }, 800);

    // Increment the number of moves after this turn
    incrementMoves();
}

// ~~~~~~~~~~~~
// HANDLE MATCH
// ~~~~~~~~~~~~
const handleMatch = () => {
    // Ensure two cards are flipped before executing logic
    if (flippedCards.length !== 2) { return; }
    console.log("Match!");
    flippedCards[0].classList.add("grow");
    flippedCards[1].classList.add("grow");

    setTimeout(() => {
        flippedCards[0].classList.remove("grow");
        flippedCards[1].classList.remove("grow");

        // Add the matching flipped pair to the matched array
        matched.push(flippedCards[0]);
        matched.push(flippedCards[1]);

        // Empty the flipped cards array
        flippedCards = [];

        incrementMatches();

        // Allow clicks again
        document.body.style.pointerEvents = "auto";
    }, 600);
}

// ~~~~~~~~~~~~
// UNFLIP CARDS
// ~~~~~~~~~~~~
const unflipCards = () => {
    // Ensure two cards are flipped before executing logic
    if (flippedCards.length !== 2) { return; }

    // Remove .flip class from cards
    flippedCards[0].classList.remove("flip");
    flippedCards[1].classList.remove("flip");

    // Empty the flipped cards array
    flippedCards = [];

    // Allow clicks again
    document.body.style.pointerEvents = "auto";
}

// ~~~~~~~~~~~~~~~~~
// INCREMENT MATCHES
// ~~~~~~~~~~~~~~~~~
const incrementMatches = () => {
    matches++;
    matchesText.innerHTML = matches;

    if (matches === MAX_MATCHES) {
        handleGameEnd();
    }
}

// ~~~~~~~~~~~~~~~
// INCREMENT MOVES
// ~~~~~~~~~~~~~~~
const incrementMoves = () => {
    moves++;
    movesText.innerHTML = moves;
}

// ~~~~~~~~~~~~~
// HANDLE RATING
// ~~~~~~~~~~~~~
const handleRating = () => {
    let gameTimeGiven = MAX_SECONDS + (MAX_MINUTES * 60);
    let gameTimeSpent = seconds + (minutes * 60);
    let score = (gameTimeSpent / gameTimeGiven) * 100;

    if (score > 90) {
        rating = 5;
    } else if (score < 80) {
        rating = 4;
    } else if (score <= 75) {
        rating = 3;
    } else if (score <= 50) {
        rating = 2;
    } else if (score <= 30 && score > 0) {
        rating = 1;
    } else {
        rating = 0;
    }
    console.log("RAING = " + rating);
}

// ~~~~~~~~~~~~~~~
// HANDLE GAME END
// ~~~~~~~~~~~~~~~
const handleGameEnd = () => {
    stopTimer();
    handleRating();
    showModal();
}

// ~~~~~~~~~~
// SHOW MODAL
// ~~~~~~~~~~
const showModal = () => {
    // To Do: Disable interaction with content behind modal
    const modal = document.querySelector(".end-game-modal");
    let message = modal.querySelector(".message");
    let submessage = modal.querySelector(".submessage");
    if (rating > 0) {
        let ratingText = modal.querySelector(".ratingText");
        for (let i = 0; i < rating; i++) {
            ratingText.innerHTML += "⭐ ";
        }
    }

    if (matches === MAX_MATCHES) {
        message.innerHTML = gameStates.won.message;
        submessage.innerHTML = gameStates.won.submessage;
    } else {
        message.innerHTML = gameStates.lost.message;
        submessage.innerHTML = gameStates.lost.submessage;
    }

    // Get the existing modal img element
    let img = modal.querySelector("img");
    // Use an existing image to save time loading a new one
    img.src = board.querySelector("img").src;
    img.alt = board.querySelector("img").alt;

    modal.style.visibility = "visible";
}

const hideModal = () => {
    const modal = document.querySelector(".end-game-modal");
    modal.style.visibility = "hidden";
}

// Listen for card clicks
board.addEventListener("click", (event) => {
    // Ensure the back of the card is clicked
    if (event.target.classList.contains("card-back")) {
        // Start timer if not already started (timer is undefined)
        if (!timer) { startTimer(); }
        // Flip the card
        flipCard(event.target.parentNode.parentNode);
    }
});

resetGame();
unflipCards();