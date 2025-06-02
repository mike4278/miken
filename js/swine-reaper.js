// minesweeper.js

const gameBoard = document.getElementById("game-board");
const startBtn = document.getElementById("start-btn");
const difficultySelect = document.getElementById("difficulty");
const gameStatus = document.getElementById("game-status");

let board = [];
let rows = 0;
let cols = 0;
let minesCount = 0;
let revealedCount = 0;
let gameOver = false;

startBtn.addEventListener("click", startGame);

function startGame() {
  gameOver = false;
  revealedCount = 0;
  board = [];
  gameStatus.textContent = ""; // Clear status on new game

  const difficulty = difficultySelect.value;
  switch (difficulty) {
    case "easy":
      rows = 9;
      cols = 9;
      minesCount = 10;
      break;
    case "medium":
      rows = 16;
      cols = 16;
      minesCount = 40;
      break;
    case "hard":
      rows = 16;
      cols = 30;
      minesCount = 99;
      break;
  }

  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.dataset.row = r;
      square.dataset.col = c;
      square.dataset.revealed = "false";
      square.dataset.flagged = "false";

      square.addEventListener("click", () => {
        if (!gameOver) revealSquare(r, c);
      });

      square.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (!gameOver) toggleFlag(r, c);
      });

      square.addEventListener("dblclick", () => {
        if (!gameOver) {
          if (
            square.classList.contains("revealed") &&
            !square.classList.contains("bomb")
          ) {
            revealNeighbors(r, c);
          }
        }
      });

      gameBoard.appendChild(square);

      board[r][c] = {
        element: square,
        isMine: false,
        neighborMines: 0,
        revealed: false,
        flagged: false,
      };
    }
  }

  placeMines();
  calculateNeighbors();
}

function placeMines() {
  let placed = 0;
  while (placed < minesCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      placed++;
    }
  }
}

function calculateNeighbors() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) {
        board[r][c].neighborMines = -1;
        continue;
      }
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (board[nr][nc].isMine) count++;
          }
        }
      }
      board[r][c].neighborMines = count;
    }
  }
}

function revealSquare(r, c) {
  const square = board[r][c];
  if (square.revealed || square.flagged) return;

  square.revealed = true;
  square.element.dataset.revealed = "true";
  square.element.classList.add("revealed");

  revealedCount++;

  if (square.isMine) {
    square.element.classList.add("bomb-hit");
    endGame(false);
    return;
  }

  if (square.neighborMines > 0) {
    square.element.textContent = square.neighborMines;
    square.element.style.color = getNumberColor(square.neighborMines);
  } else {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (!(dr === 0 && dc === 0)) {
            revealSquare(nr, nc);
          }
        }
      }
    }
  }

  checkWin();
}

function toggleFlag(r, c) {
  const square = board[r][c];
  if (square.revealed) return;

  square.flagged = !square.flagged;
  square.element.dataset.flagged = square.flagged.toString();

  if (square.flagged) {
    square.element.classList.add("flagged");
    square.element.textContent = "🐖";
  } else {
    square.element.classList.remove("flagged");
    square.element.textContent = "";
  }
}

function revealNeighbors(r, c) {
  const square = board[r][c];
  if (!square.revealed || square.isMine) return;

  const flaggedCount = countFlaggedNeighbors(r, c);

  if (flaggedCount === square.neighborMines) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const neighbor = board[nr][nc];
          if (!neighbor.revealed && !neighbor.flagged) {
            revealSquare(nr, nc);
          }
        }
      }
    }
  }
}

function countFlaggedNeighbors(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (board[nr][nc].flagged) count++;
      }
    }
  }
  return count;
}

function checkWin() {
  // Win if all non-mine squares are revealed
  if (revealedCount === rows * cols - minesCount) {
    endGame(true);
  }
}

function endGame(won) {
  gameOver = true;

  // Reveal all mines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const square = board[r][c];
      if (square.isMine && !square.flagged) {
        square.element.classList.add("bomb");
        square.element.textContent = "💀";
      }
      square.element.style.cursor = "default";
    }
  }

  // Update status text instead of alert
  if (won) {
    gameStatus.textContent = "🎉 You won! Congratulations! 🎉";
    gameStatus.style.color = "green";
  } else {
    gameStatus.textContent = "💥 Game Over! You encountered the Reaper.";
    gameStatus.style.color = "red";
  }
}

function getNumberColor(number) {
  switch (number) {
    case 1:
      return "#1976d2"; // blue
    case 2:
      return "#388e3c"; // green
    case 3:
      return "#d32f2f"; // red
    case 4:
      return "#7b1fa2"; // purple
    case 5:
      return "#fbc02d"; // yellow
    case 6:
      return "#00796b"; // teal
    case 7:
      return "#000000"; // black
    case 8:
      return "#616161"; // gray
    default:
      return "#000000";
  }
}

// Start the game on load for convenience
startGame();
