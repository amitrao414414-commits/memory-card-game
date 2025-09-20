// script.js - Memory Card Game

// DOM elements
const grid = document.getElementById('grid');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const newGameBtn = document.getElementById('newGameBtn');
const difficultySelect = document.getElementById('difficulty');
const congratsModal = document.getElementById('congrats');
const finalStats = document.getElementById('finalStats');
const playAgainBtn = document.getElementById('playAgain');

let tileCount = 16; // default 4x4 = 16
let symbols = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let totalPairs = 0;
let timerInterval = null;
let secondsElapsed = 0;
let timerRunning = false;

// Emoji sets (you can replace with image URLs if you prefer)
const EMOJIS_16 = ['🍎','🍌','🍇','🍓','🍍','🍑','🥝','🍒']; // 8 pairs -> 16 tiles
const EMOJIS_36 = ['🐶','🐱','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🦄','🐴','🐝','🐲']; // 18 pairs -> 36 tiles

// Utility: shuffle array (Fisher–Yates)
function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatTime(sec){
  const mm = String(Math.floor(sec/60)).padStart(2,'0');
  const ss = String(sec%60).padStart(2,'0');
  return `${mm}:${ss}`;
}

function startTimer(){
  if(timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(()=>{
    secondsElapsed++;
    timerEl.textContent = formatTime(secondsElapsed);
  },1000);
}

function stopTimer(){
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
}

function resetTimer(){
  stopTimer();
  secondsElapsed = 0;
  timerEl.textContent = '00:00';
}

function createBoard(){
  // reset state
  grid.innerHTML = '';
  firstCard = null; secondCard = null; lockBoard = false;
  moves = 0; matchedPairs = 0;
  movesEl.textContent = moves;
  resetTimer();
  congratsModal.classList.add('hidden');

  // determine tileCount & emoji set based on difficulty
  const size = Number(difficultySelect.value);
  if(size === 4){
    tileCount = 16;
    symbols = [...EMOJIS_16];
    grid.classList.remove('grid-6');
    grid.classList.add('grid-4');
  } else {
    tileCount = 36;
    symbols = [...EMOJIS_36];
    grid.classList.remove('grid-4');
    grid.classList.add('grid-6');
  }

  totalPairs = tileCount / 2;
  // prepare symbol array duplicated
  const chosen = symbols.slice(0, totalPairs); // ensure exactly pairs needed
  const deck = shuffle([...chosen, ...chosen]);
  // create cards
  for(let i=0;i<deck.length;i++){
    const val = deck[i];
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = val;
    card.dataset.index = i;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.textContent = val;

    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.innerHTML = '<div style="font-size:1.1rem">?</div><div class="label">Memory</div>';

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener('click', onCardClick);
    grid.appendChild(card);
  }

  // small layout adjustment for very small screens for 6x6
  if(tileCount === 36 && window.innerWidth < 420){
    // make 3 columns on tiny phone to keep cards big enough
    grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  } else {
    grid.style.gridTemplateColumns = '';
  }
}

function onCardClick(e){
  const card = e.currentTarget;
  if(lockBoard) return;
  if(card === firstCard) return;
  // if already matched (we'll mark as 'matched') ignore
  if(card.classList.contains('matched')) return;

  // start timer on first move
  if(!timerRunning) startTimer();

  // flip
  card.classList.add('flipped');
  if(!firstCard){
    firstCard = card;
    return;
  }
  secondCard = card;
  lockBoard = true; // temporarily prevent other clicks until resolution
  moves++;
  movesEl.textContent = moves;

  // check match
  if(firstCard.dataset.value === secondCard.dataset.value){
    // match
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matchedPairs++;
    // reset selection
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    // win condition
    if(matchedPairs === totalPairs){
      winGame();
    }
  } else {
    // not a match -> flip back after short delay
    setTimeout(()=>{
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      firstCard = null;
      secondCard = null;
      lockBoard = false;
    }, 800);
  }
}

function winGame(){
  stopTimer();
  // show modal with stats
  finalStats.innerHTML = `You finished in <strong>${formatTime(secondsElapsed)}</strong> with <strong>${moves}</strong> moves.`;
  congratsModal.classList.remove('hidden');
}

newGameBtn.addEventListener('click', createBoard);
difficultySelect.addEventListener('change', createBoard);
playAgainBtn.addEventListener('click', () => {
  congratsModal.classList.add('hidden');
  createBoard();
});

// initialize
createBoard();
