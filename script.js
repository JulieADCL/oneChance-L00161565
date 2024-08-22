// global variables and constants
let players = [];
let currentPlayerIndex = 0;
let currentTurnScore = 0;
const WINNING_SCORE = 100;

// Event listeners for UI
document.getElementById('start-game').addEventListener('click', setupGame);
document.getElementById('roll-btn').addEventListener('click', rollDice);
document.getElementById('bank-btn').addEventListener('click', bankPoints);
document.getElementById('reset-btn').addEventListener('click', resetGame);
document.getElementById('mode-computer').addEventListener('change', handleGameModeChange);
document.getElementById('mode-multiplayer').addEventListener('change', handleGameModeChange);
document.getElementById('player-count').addEventListener('input', updatePlayerCountDisplay);

/**
 * handles the game mode change events, including updating images and toggling player count input
 */
function handleGameModeChange() {
    updateGameModeImages();
    togglePlayerCountInput();
}

/**
 * toggles the visibility of the player count input based on the multiplayer mode selection
 * 
 */
function togglePlayerCountInput() {
    const isMultiplayer = document.getElementById('mode-multiplayer').checked;
    document.getElementById('player-count-container').style.display = isMultiplayer ? 'flex' : 'none';
    validateStartButton();
}

/**
 * game mode checkboxes have images that change based on the selection
 * this function updates the images based on the user selection
 */
function updateGameModeImages() {
    const isComputerMode = document.getElementById('mode-computer').checked;

    if (isComputerMode) {
        document.querySelector('label[for="mode-computer"]').style.backgroundImage = 'url("path_to_checked_image_computer")';
        document.querySelector('label[for="mode-multiplayer"]').style.backgroundImage = 'url("path_to_unchecked_image_multiplayer")';
    } else {
        document.querySelector('label[for="mode-computer"]').style.backgroundImage = 'url("path_to_unchecked_image_computer")';
        document.querySelector('label[for="mode-multiplayer"]').style.backgroundImage = 'url("path_to_checked_image_multiplayer")';
    }
}

/**
 * updates number of players depending on the value chosen by the user
 * the user can choose up to 10 players by changing the position of the slider
 */
function updatePlayerCountDisplay() {
    const playerCount = parseInt(document.getElementById('player-count').value);
    document.getElementById('player-count-value').innerText = playerCount;
    validateStartButton();
}

/**
 * enables the start button based on the game mode and player count
 */
function validateStartButton() {
    const isMultiplayer = document.getElementById('mode-multiplayer').checked;
    const playerCount = parseInt(document.getElementById('player-count').value);
    const isValidPlayerCount = playerCount >= 2 && playerCount <= 10;

    document.getElementById('start-game').disabled = isMultiplayer ? !isValidPlayerCount : false;
}

/**
 * sets up the game based on the selected mode and player count
 */
function setupGame() {
    const isMultiplayer = document.getElementById('mode-multiplayer').checked;
    players = [];

    if (isMultiplayer) {
        const playerCount = parseInt(document.getElementById('player-count').value);
        for (let i = 1; i <= playerCount; i++) {
            players.push({ name: `Player ${i}`, totalScore: 0, isComputer: false, currentRolls: [] });
        }
    } else {
        players.push({ name: 'Player 1', totalScore: 0, isComputer: false, currentRolls: [] });
        players.push({ name: 'Computer', totalScore: 0, isComputer: true, currentRolls: [] });
    }

    currentPlayerIndex = 0;
    currentTurnScore = 0;
    document.getElementById('roll-btn').style.display = 'inline-block';
    document.getElementById('bank-btn').style.display = 'inline-block';
    document.getElementById('roll-btn').disabled = false;
    document.getElementById('bank-btn').disabled = false;
    document.getElementById('game-mode').style.display = 'none';
    // Show the game grid
    document.getElementById('game-grid').style.display = 'grid';
    renderPlayersAndDice();
    updateScores();
    document.getElementById('message').innerText = '';
}
/**
 * renders the players and dice on the game board
 */
function renderPlayersAndDice() {
    const gameGrid = document.getElementById('game-grid');
    gameGrid.innerHTML = '';
    gameGrid.style.gridTemplateRows = `repeat(${Math.ceil(players.length / 2)}, 1fr)`; //set the number of rows based on the number of players
    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';
        playerDiv.id = `player${index}`;
        playerDiv.innerHTML = `<h2>${player.name}</h2><p>Total Score: <span id="player${index}-total">0</span></p><p>Current Turn Score: <span id="player${index}-turn">0</span></p><p>Rolled: <span id="player${index}-rolls"></span></p>`;
        playerDiv.style.gridColumn = index % 2 === 0 ? '1' : '3';
        playerDiv.style.gridRow = `${Math.floor(index / 2) + 1}`;
        gameGrid.appendChild(playerDiv);
    });
    const diceContainer = document.createElement('div');
    diceContainer.className = 'dice-container';
    diceContainer.innerHTML = '<img id="dice" src="img/dice-1.png" alt="Dice">';
    diceContainer.style.gridColumn = '2';
    diceContainer.style.gridRow = '1 / span ' + Math.ceil(players.length / 2);
    gameGrid.appendChild(diceContainer);
}
/***  
* rolls dice and updates the game state based on the dice value 
*/
function rollDice() {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    document.getElementById('dice').src = `img/dice-${diceValue}.png`;
    //if the dice value is 1, the current turn score is reset to 0, if the value is > 1, the score is added to the current turn score
    if (diceValue === 1) {
        currentTurnScore = 0;
        players[currentPlayerIndex].currentRolls = [];
        switchPlayer();
    } else {
        currentTurnScore += diceValue;
        players[currentPlayerIndex].currentRolls.push(diceValue);
        updateScores();
    }
}

/**
 * Banks the current turn score and updates the game state
 * if the total score of the current player reaches or passes the winning score
 * the function declares the winner, else it clears the current rolls
 * resets the current turn score to 0, and switches to the next player
 * and it updates the scores on the game board
 */
function bankPoints() {
    players[currentPlayerIndex].totalScore += currentTurnScore;
    players[currentPlayerIndex].currentRolls = []; // Clear current rolls after banking

    if (players[currentPlayerIndex].totalScore >= WINNING_SCORE) {
        declareWinner();
    } else {
        currentTurnScore = 0;
        switchPlayer();
    }

    updateScores();
}

/**
 * switches the current player and updates the active player
 * if the currnt player is a computer calls the `computerTurn` function after a delay
 */
function switchPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentTurnScore = 0;
    updateActivePlayer();

    //disable the roll and bank buttons if the current player is the computer
    if (players[currentPlayerIndex].isComputer) {
        document.getElementById('roll-btn').disabled = true;
        document.getElementById('bank-btn').disabled = true;
        setTimeout(computerTurn, 1000);
    }else{
        document.getElementById('roll-btn').disabled = false;
        document.getElementById('bank-btn').disabled = false;
    }
}

/**
 * simulates the computer's turn in the game
 */
function computerTurn() {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    document.getElementById('dice').src = `img/dice-${diceValue}.png`;

    if (diceValue === 1) {
        currentTurnScore = 0;
        players[currentPlayerIndex].currentRolls = []; // Clear current rolls if rolled a 1
        bankPoints();
    } else {
        currentTurnScore += diceValue;//accumulates the score that the computer has earned in the turn
        players[currentPlayerIndex].currentRolls.push(diceValue); // add roll to the list

        const riskFactor = Math.random(); // random factor to add a small chance for the computer to bank points independent of the current score
        const safeThreshold = 10 + Math.random() * 20; // calculate a trashold of points for the computer to bank

        updateScores();

        if (currentTurnScore >= safeThreshold || riskFactor < 0.2) {
            bankPoints(); // bank points if the threshold is reached or the risk factor is low
        } else {
            setTimeout(computerTurn, 1000); // delay for next roll to mimic human player
        }
    }
}

/**
 * updates the scores and display for each player
 */
function updateScores() {
    players.forEach((player, index) => {
        document.getElementById(`player${index}-total`).innerText = player.totalScore;
        document.getElementById(`player${index}-turn`).innerText = index === currentPlayerIndex ? currentTurnScore : 0;
        document.getElementById(`player${index}-rolls`).innerText = player.currentRolls.join(', ');
    });
    updateActivePlayer();
}

/**
 * update the message element to display what player won,
 * disable the roll and bank buttons, and display the reset button
 */
function declareWinner() {
    document.getElementById('message').innerText = `${players[currentPlayerIndex].name} wins!`;
    document.getElementById('roll-btn').disabled = true;
    document.getElementById('bank-btn').disabled = true;
    document.getElementById('reset-btn').style.display = 'block';
}

function resetGame() {
    players.forEach(player => {
        player.totalScore = 0;
        player.currentRolls = [];
    });
    currentTurnScore = 0;
    currentPlayerIndex = 0;
    document.getElementById('roll-btn').disabled = false;
    document.getElementById('bank-btn').disabled = false;
    document.getElementById('reset-btn').style.display = 'none';
    updateScores();
    document.getElementById('message').innerText = '';
}

/**
 * update the active player by adding or removing the 'active' class based on the current player index
 * current player has a different style from the other players
 */
function updateActivePlayer() {
    players.forEach((_, index) => {
        document.getElementById(`player${index}`).classList.toggle('active', index === currentPlayerIndex);
    });
}

