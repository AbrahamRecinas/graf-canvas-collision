const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Ajustar dimensiones al tamaño visible de la ventana
const window_height = window.innerHeight - 20; 
const window_width = window.innerWidth - 20;
canvas.width = window_width;
canvas.height = window_height;

let removedCircles = 0;
const maxCirclesOnScreen = 20; // Máximo de círculos simultáneos en pantalla

const counterDisplay = document.createElement("div");
counterDisplay.style.position = "absolute";
counterDisplay.style.top = "10px";
counterDisplay.style.right = "20px";
counterDisplay.style.fontSize = "20px";
counterDisplay.style.fontWeight = "bold";
counterDisplay.style.color = "white";
counterDisplay.innerText = `Círculos eliminados: ${removedCircles}`;
document.body.appendChild(counterDisplay);

class Circle {
  constructor(x, radius, color, speed, striped) {
    this.posX = x;
    this.posY = -radius;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
    this.striped = striped; // true para rayadas, false para lisas
  }

  move() {
    this.posY += this.speed;
    if (this.posY - this.radius > window_height) {
      this.posY = -this.radius;
      this.posX = Math.random() * (window_width - this.radius * 2) + this.radius;
    }
  }

  draw(context) {
    context.save();
    context.shadowColor = "rgba(0,0,0,0.4)";
    context.shadowBlur = 8;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    const gradient = context.createRadialGradient(this.posX - this.radius / 3, this.posY - this.radius / 3, this.radius / 5, this.posX, this.posY, this.radius);
    gradient.addColorStop(0, "#ffffffcc");
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(1, this.color);

    context.beginPath();
    context.fillStyle = gradient;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.fill();

    context.lineWidth = 2;
    context.strokeStyle = "#ffffff";
    context.stroke();

    if (this.striped) {
      context.beginPath();
      context.strokeStyle = "white";
      context.lineWidth = (this.radius / 3) * 2;
      context.moveTo(this.posX - this.radius + 2, this.posY);
      context.lineTo(this.posX + this.radius - 2, this.posY);
      context.stroke();
      context.closePath();

      context.beginPath();
      context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
      context.lineWidth = 2;
      context.strokeStyle = "#ffffff";
      context.stroke();
      context.closePath();
    }

    context.restore();
  }

  isClicked(x, y) {
    const dx = x - this.posX;
    const dy = y - this.posY;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }
}

let circles = [];

function generateCircle() {
  const radius = Math.random() * 20 + 20;
  const x = Math.random() * (window_width - radius * 2) + radius;
  const colors = ["#FFD700", "#FF4500", "#1E90FF", "#32CD32", "#8A2BE2", "#DC143C", "#FF8C00", "#00CED1", "#FF1493", "#00FA9A"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const speed = Math.random() * 2 + 1;
  const striped = Math.random() < 0.5;
  circles.push(new Circle(x, radius, color, speed, striped));
}

function drawBackground() {
  ctx.fillStyle = "#35654d";
  ctx.fillRect(0, 0, window_width, window_height);
  ctx.lineWidth = 30;
  ctx.strokeStyle = "#654321";
  ctx.strokeRect(15, 15, window_width - 30, window_height - 30);
}

function animate() {
  drawBackground();

  while (circles.length < maxCirclesOnScreen) {
    generateCircle();
  }

  circles.forEach(circle => {
    circle.move();
    circle.draw(ctx);
  });

  requestAnimationFrame(animate);
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Usar findIndex para eliminar solo un círculo a la vez y evitar bloqueos
  const clickedIndex = circles.findIndex(circle => circle.isClicked(mouseX, mouseY));
  if (clickedIndex !== -1) {
    circles.splice(clickedIndex, 1);
    removedCircles++;
    counterDisplay.innerText = `Círculos eliminados: ${removedCircles}`;
  }
});

animate();
