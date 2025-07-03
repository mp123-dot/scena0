/*************************************************************
 *  KONFIG – zmieniasz tylko liczby w tym bloku
 *************************************************************/
const BTN_DIAMETER = 100;  // Ø przycisku (px)
const HOVER_SCALE  = 1.05; // powiększenie przy hoverze (1 = wyłączone)
const EYE_TO_BTN   = 250;  // odległość: środek oka → środek przycisku
/*************************************************************/

let font, flowerMouse, tloKolor;
let rawBtnImg, btnImg;                // oryginał + okrągła wersja
let eyeX, eyeY, pupilX, pupilY;       // oko + źrenica
let btnX, btnY, btnR;                 // pozycja i promień przycisku
let easing = 0.2;

let clickSound;                      // dźwięk kliknięcia
let glitterParticles = [];          // tablica brokatu

/***************** PRELOAD *****************/
function preload() {
  font        = loadFont('futura.ttf');           // czcionka (opcjonalnie)
  flowerMouse = loadImage('flowerMouse.png');     // kursor-kwiatek
  tloKolor    = loadImage('t.welcome.png');       // tło z okiem + tekstem
  rawBtnImg   = loadImage('PrzyciskSTART.png');   // różowy „owalny” PNG
  clickSound  = loadSound('glimmer.wav');         // dźwięk kliknięcia
}

/***************** SETUP *****************/
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont(font);
  noCursor();

  // — zamieniamy owal na idealne koło (raz, w setup) —
  const s   = min(rawBtnImg.width, rawBtnImg.height);
  btnImg    = createImage(s, s);
  rawBtnImg.loadPixels();
  btnImg.copy(
    rawBtnImg,
    (rawBtnImg.width  - s) / 2,
    (rawBtnImg.height - s) / 2,
    s, s,
    0, 0, s, s
  );
  const maskG = createGraphics(s, s);
  maskG.noStroke();
  maskG.fill(255);
  maskG.circle(s / 2, s / 2, s);
  btnImg.mask(maskG);

  // — pozycje startowe oka i przycisku —
  eyeX = width  / 2;
  eyeY = height / 2;
  pupilX = eyeX;
  pupilY = eyeY;
  updateButtonPos();
}

/***************** DRAW *****************/
function draw() {
  background(220);
  image(tloKolor, 0, 0, width, height);  // całoekranowe tło

  // SCENA 0: oko + przycisk
  drawEye();

  const over = dist(mouseX, mouseY, btnX, btnY) < btnR;
  const d    = over ? BTN_DIAMETER * HOVER_SCALE : BTN_DIAMETER;
  imageMode(CENTER);
  image(btnImg, btnX, btnY, d, d);
  imageMode(CORNER);

  // brokat
  for (let i = glitterParticles.length - 1; i >= 0; i--) {
    glitterParticles[i].update();
    glitterParticles[i].show();
    if (glitterParticles[i].finished()) {
      glitterParticles.splice(i, 1);
    }
  }

  // kursor-kwiatek
  image(flowerMouse, mouseX - 16, mouseY - 16, 32, 32);
}

/***************** MOUSE PRESSED *****************/
function mousePressed() {
  // dźwięk przy każdej akcji
  if (clickSound.isLoaded()) clickSound.play();
  // brokat przy każdej akcji
  for (let i = 0; i < 18; i++) {
    glitterParticles.push(new Glitter(mouseX, mouseY));
  }
  // przejście do scena1 po kliknięciu w przycisk START
  if (dist(mouseX, mouseY, btnX, btnY) < btnR) {
    window.open("https://mp123-dot.github.io/scena1/", "_self");
  }
}

/***************** WINDOW RESIZED *****************/
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  eyeX = width  / 2;
  eyeY = height / 2;
  pupilX = eyeX;
  pupilY = eyeY;
  updateButtonPos();
}

/***************** POMOCNICZE *****************/
function updateButtonPos() {
  btnX = eyeX;
  btnY = eyeY + EYE_TO_BTN;
  btnR = BTN_DIAMETER / 2;
}

function drawEye() {
  const limit = 50;
  let dx = mouseX - eyeX,
      dy = mouseY - eyeY,
      d  = sqrt(dx*dx + dy*dy);
  if (d > limit) {
    dx = dx / d * limit;
    dy = dy / d * limit;
  }
  const targetX = eyeX + dx;
  const targetY = eyeY + dy;
  pupilX += (targetX - pupilX) * easing;
  pupilY += (targetY - pupilY) * easing;
  fill(0);
  noStroke();
  circle(pupilX, pupilY, 70);
}

/***************** KLASA GLITTER *****************/
class Glitter {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.angle   = random(TWO_PI);
    this.life    = 0;
    this.maxLife = random(20, 40);
    this.size    = random(3, 7);
    this.color   = color(random(180,255), random(120,200), random(200,255), 200);
  }
  update() {
    this.life++;
    this.x += cos(this.angle) * 1.5;
    this.y += sin(this.angle) * 1.5;
  }
  finished() {
    return this.life > this.maxLife;
  }
  show() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size);
  }
}