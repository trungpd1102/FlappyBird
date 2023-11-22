// Create screen
const screenWidth = 360;
const screenHeight = 640;
let screen;
let context;

// Create bird
const birdWidth = 34;
const birdHeight = 24;
const birdX = screenWidth / 8;
const birdY = screenHeight / 2;
let birdImg;

let bird = {
	x: birdX,
	y: birdY,
	width: birdWidth,
	height: birdHeight,
};

// Pipes
let pipes = [];
const pipeWidth = 64;
const pipeHeight = 512;
const pipeX = screenWidth;
const pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Game physics
let velocityX = -2; // pipes moving speed
let velocityY = 0; // bird jump speed
const gravity = 0.25;

let gameOver = false;
let score = 0;
let record = parseInt(localStorage.getItem('record'));

window.onload = () => {
	screen = document.getElementById('screen');
	screen.height = screenHeight;
	screen.width = screenWidth;
	context = screen.getContext('2d');

	if (!record) {
		setRecord(0);
		return;
	}
	setRecord(record);
};

function play() {
	document.addEventListener('keydown', tabBird);

	hide('start-page');
	hide('game-over');
	show('score-wrapper');

	// Draw the bird
	birdImg = new Image();
	birdImg.src = './assets/img/bird.png';
	birdImg.onload = () => {
		context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
	};

	topPipeImg = new Image();
	topPipeImg.src = './assets/img/topPipe.png';

	bottomPipeImg = new Image();
	bottomPipeImg.src = './assets/img/bottomPipe.png';

	requestAnimationFrame(update);
	setInterval(placePipes, 1500);

}

function update() {
	console.log('update');
	console.log({velocityX});
	requestAnimationFrame(update);
	if (gameOver) return;

	context.clearRect(0, 0, screen.width, screen.height);

	// Bird
	velocityY += gravity;
	bird.y = Math.max(bird.y + velocityY, 0);
	context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

	if (bird.y > screen.height) {
		gameOver = true;
	}

	// Pipes
	for (let pipe of pipes) {
		pipe.x += velocityX;
		context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

		if (!pipe.passed && bird.x > pipe.x + pipe.width) {
			score += 0.5;

			// Update score
			if (Number.isInteger(score)) {
				updateScore(score);
			}

			pipe.passed = true;
		}

		if (detectCollision(bird, pipe)) gameOver = true;
	}

	//Clear pipe
	while (pipes.length > 0 && pipes[0].x < 0 - pipeWidth) {
		pipes.shift();
	}

	if (gameOver) {
		document.removeEventListener('keydown', tabBird);
		show('game-over');
		hide('score-wrapper');
		hide('start-page');
		updateResult();
	}
}

function placePipes() {
	if (gameOver) return;

	const randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
	const openingSpace = screen.height / 5;

	const topPipe = {
		img: topPipeImg,
		x: pipeX,
		y: randomPipeY,
		width: pipeWidth,
		height: pipeHeight,
		passed: false,
	};
	const bottomPipe = {
		img: bottomPipeImg,
		x: pipeX,
		y: randomPipeY + pipeHeight + openingSpace,
		width: pipeWidth,
		height: pipeHeight,
		passed: false,
	};

	pipes.push(topPipe);
	pipes.push(bottomPipe);
}

function tabBird(e) {
	console.log('tabBird');
	if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyX') {
		// Jump
		velocityY = -6;

		if (gameOver) {
			bird.y = birdY;
			pipes = [];
			score = 0;
			gameOver = false;
		}
	}
}

function detectCollision(a, b) {
	return (
		a.x < b.x + b.width && 
		a.x + a.width > b.x && 
		a.y < b.y + b.height && 
		a.y + a.height > b.y
	); 
}

function updateScore(score) {
	const scoreEl = document.getElementById('score');
	scoreEl.innerHTML = `${score}`;
}

function setRecord(record) {
	const recordEl = document.getElementById('record');
	recordEl.innerHTML = record;
	localStorage.setItem('record', record.toString());
}

function hide(id) {
	const el = document.getElementById(id);
	el.style.display = 'none';
}

function show(id) {
	const el = document.getElementById(id);
	el.style.display = 'block';
}

function updateResult() {
	const resultRecordEl = document.getElementById('result-record');
	const resultScoreEl = document.getElementById('result-score');

	resultScoreEl.innerHTML = score;
	if (score > record) {
		record = score;
		setRecord(record);
		resultRecordEl.innerHTML = record;
		return;
	}

	resultRecordEl.innerHTML = record;
}

function backToHome() {
	location.reload();
}
