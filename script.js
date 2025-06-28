//Game Constants
const rows = 10;
const cols = 7;
const maxShovels = 15;

//Game State
let grid, player, shovel, score, highScore, gameOver, revealed;
const gameDiv = document.getElementById('game');
const restartBtn = document.getElementById('restart');
const shovelSpan = document.getElementById('shovel');
//const scoreSpan = document.getElementById('score');

//Manual map creation
const easyMap = [
    ['dirt','dirt','rock','dirt','dirt','dirt','dirt'],
    ['dirt','hard','dirt','dirt','rock','dirt','dirt'],
    ['dirt','dirt','dirt','hard','dirt','dirt','dirt'],
    ['dirt','dirt','dirt','dirt','dirt','rock','dirt'],
    ['dirt','rock','dirt','dirt','dirt','dirt','dirt'],
    ['dirt','dirt','dirt','dirt','hard','dirt','dirt'],
    ['rock','dirt','dirt','dirt','dirt','dirt','rock'],
    ['dirt','dirt','dirt','dirt','dirt','dirt','dirt'],
    ['dirt','dirt','rock','hard','dirt','dirt','dirt'],
    ['dirt','dirt','dirt','hard','dirt','hard','dirt'],
];
const mediumMap = [
    ['dirt','dirt','dirt','dirt','dirt','dirt','dirt'],
    ['dirt','rock','dirt','hard','dirt','dirt','dirt'],
    ['dirt','dirt','rock','dirt','hard','dirt','dirt'],
    ['rock','hard','dirt','rock','dirt','dirt','dirt'],
    ['dirt','dirt','hard','rock','dirt','rock','dirt'],
    ['dirt','rock','dirt','hard','dirt','rock','dirt'],
    ['hard','rock','dirt','dirt','hard','rock','dirt'],
    ['dirt','rock','hard','dirt','hard','rock','dirt'],
    ['dirt', 'rock', 'hard', 'rock', 'dirt', 'hard', 'rock'],
    ['hard', 'dirt', 'dirt', 'dirt', 'hard', 'dirt', 'dirt'],
];
const hardMap = [
    ['dirt','dirt','dirt','dirt','dirt','dirt','dirt'],
    ['dirt','rock','dirt','hard','dirt','dirt','rock'],
    ['dirt','dirt','rock','dirt','hard','dirt','dirt'],
    ['rock','hard','dirt','rock','dirt','dirt','dirt'],
    ['dirt','dirt','hard','rock','dirt','rock','dirt'],
    ['dirt','rock','dirt','hard','dirt','rock','dirt'],
    ['hard', 'rock', 'dirt', 'hard', 'rock', 'dirt', 'hard'],
    ['dirt', 'hard', 'rock', 'dirt', 'hard', 'rock', 'dirt'],
    ['hard', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'hard'],
    ['dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'rock'],
];

//Tile Types
//dirt: normal | hard: needs 2 shovels, rock: penalty | water: goal


// 2. Function to create grid from manual layout
function makeManualGrid(layout) {
    return layout.map(row =>
        row.map(type => ({
            type,
            revealed: false,
            hp: type === 'hard' ? 2 : 1,
        }))
    );
}

let selectedMapIndex = 0; // Default to easy

const maps = [easyMap, mediumMap, hardMap];

// Game Initialization
// Resets and starts a new game
function startGame() {
    grid = makeManualGrid(maps[selectedMapIndex]);
    shovel = maxShovels;
    gameOver = false;
    score = 0;
    updateHUD();
    render();
}

// Updates the HUD (shovel, score, high score)
function updateHUD() {
  shovelSpan.textContent = `Shovels: ${shovel}`;
  //scoreSpan.textContent = `Score: ${score}`;
}

// Rendering 
// Draws the game grid
function render() {
    gameDiv.innerHTML = '';
    document.getElementById('message').innerHTML = ''; // Clear message by default

    let bottomRowRevealed = false;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let tile = grid[r][c];
            let div = document.createElement('div');
            div.className = 'tile';

            if (!tile.revealed) {
                div.classList.add('unrevealed', `row-${r}`);
            } else {
                div.style.background = "#fff";
                div.style.color = "#181818";
            }

            // Only show emoji if revealed or neighbor of revealed
            let showEmoji = tile.revealed;
            if (!showEmoji) {
                const neighbors = [
                    [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
                ];
                for (const [nr, nc] of neighbors) {
                    if (
                        nr >= 0 && nr < rows &&
                        nc >= 0 && nc < cols &&
                        grid[nr][nc].revealed
                    ) {
                        showEmoji = true;
                        break;
                    }
                }
            }

            if (showEmoji) {
                if (tile.type === 'rock') div.textContent = '⛰️';
                else if (tile.type === 'hard') div.textContent = '🟫';
                else if (tile.type === 'dirt') div.textContent = '⬜';
            } else {
                div.textContent = '';
            }

            // Win check: if any tile in the bottom row is revealed
            if (r === rows - 1 && tile.revealed) {
                bottomRowRevealed = true;
            }

            div.addEventListener('click', function () {
                if (tile.type === 'rock') return;
                if (!tile.revealed && shovel > 0 && tile.hp > 0) {
                    let canReveal = false;
                    if (r === 0) {
                        canReveal = true;
                    } else {
                        const neighbors = [
                            [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
                        ];
                        for (const [nr, nc] of neighbors) {
                            if (
                                nr >= 0 && nr < rows &&
                                nc >= 0 && nc < cols &&
                                grid[nr][nc].revealed
                            ) {
                                canReveal = true;
                                break;
                            }
                        }
                    }
                    if (canReveal) {
                        shovel--;
                        tile.hp--;
                        if (tile.hp === 0) {
                            tile.revealed = true;
                        }
                        updateHUD();
                        render();
                    }
                }
            });

            gameDiv.appendChild(div);
        }
    }

    // Win condition
    if (bottomRowRevealed) {
        showEndScreen(true);
        gameOver = true;
        // Optionally disable further clicks
        Array.from(gameDiv.children).forEach(child => child.style.pointerEvents = "none");
        return;
    }

    // Loss condition
    if (shovel <= 0 && !bottomRowRevealed) {
        showEndScreen(false);
        gameOver = true;
        Array.from(gameDiv.children).forEach(child => child.style.pointerEvents = "none");
        return;
    }
}
          
restartBtn.addEventListener('click', function () {
    gameOver = false;
    // Show overlay and blur background again
    document.getElementById('how-to-play-overlay').style.display = 'flex';
    document.querySelector('main').style.filter = 'blur(2px)';
    document.querySelector('header').style.filter = 'blur(2px)';
    document.querySelector('footer').style.filter = 'blur(2px)';
});


// --- Start ---
// Start the game when the page loads
window.onload = function() {
    // Show overlay, hide game until start
    document.getElementById('how-to-play-overlay').style.display = 'flex';
    document.querySelector('main').style.filter = 'blur(2px)';
    document.querySelector('header').style.filter = 'blur(2px)';
    document.querySelector('footer').style.filter = 'blur(2px)';
};

document.getElementById('start-game-btn').onclick = function() {
    document.getElementById('how-to-play-overlay').style.display = 'none';
    document.querySelector('main').style.filter = '';
    document.querySelector('header').style.filter = '';
    document.querySelector('footer').style.filter = '';
    startGame();
};

const charityWaterFacts = [
    "Every $40 donated brings clean water to one person in need.",
    "771 million people lack access to clean water globally.",
    "Clean water can improve health, education, and income.",
    "Women and girls spend 200 million hours every day collecting water.",
    "Access to clean water reduces waterborne diseases."
];

function showEndScreen(win) {
    const messageDiv = document.getElementById('message');
    if (win) {
        // Pick a random fact
        const fact = charityWaterFacts[Math.floor(Math.random() * charityWaterFacts.length)];
        messageDiv.innerHTML = `
            <div style="background:#FFD600;color:#181818;padding:1em;border-radius:1em;font-size:1.5em;font-weight:bold;">
                Success! You reached the water! 💧<br>
                <span style="font-size:1em;font-weight:normal;display:block;margin-top:1em;">💧 Charity Water Fact: ${fact}</span>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div style="background:#e57373;color:#fff;padding:1em;border-radius:1em;font-size:1.5em;font-weight:bold;">
                Your shovel broke!! Try again!
            </div>
        `;
    }
}

// Difficulty selector logic
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        difficultyBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMapIndex = parseInt(btn.getAttribute('data-map'));
    });
});
// Set default selected
difficultyBtns[0].classList.add('selected');

document.getElementById('charity-water-btn').onclick = function() {
    window.open('https://www.charitywater.org/main', '_blank');
};