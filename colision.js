const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Establecer dimensiones del canvas
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.width = window_width;
canvas.height = window_height;

class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.originalColor = color; // Color base de la bola
    this.text = text;
    this.speed = speed;
    // Velocidades iniciales aleatorias
    this.dx = (Math.random() < 0.5 ? -1 : 1) * this.speed;
    this.dy = (Math.random() < 0.5 ? -1 : 1) * this.speed;
    // Para el efecto de flash en colisión
    this.flashTimer = 0;
  }
  
  // Actualiza la posición y rebota en los bordes (las bandas de la mesa)
  move() {
    this.posX += this.dx;
    if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
      this.dx = -this.dx;
    }
    this.posY += this.dy;
    if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
      this.dy = -this.dy;
    }
  }
  
  // Dibuja la bola con sombra, relleno y contorno. Si flashTimer > 0 se pinta en azul.
  draw(context) {
    context.save();
    // Sombra para dar efecto 3D
    context.shadowColor = "rgba(0, 0, 0, 0.3)";
    context.shadowBlur = 5;
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;
    
    // Color de la bola (flash en azul al colisionar)
    let ballColor = this.flashTimer > 0 ? "#0000FF" : this.originalColor;
    
    context.beginPath();
    context.fillStyle = ballColor;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.fill();
    
    // Contorno blanco para simular la separación del fieltro
    context.lineWidth = 2;
    context.strokeStyle = "white";
    context.stroke();
    
    // Dibujar el número (o etiqueta) en el centro de la bola
    context.shadowColor = "transparent";
    context.fillStyle = "black";
    context.font = "20px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(this.text, this.posX, this.posY);
    context.closePath();
    context.restore();
    
    if (this.flashTimer > 0) {
      this.flashTimer--;
    }
  }
  
  // Detecta colisión con otra bola (fórmula de distancia entre centros)
  checkCollision(other) {
    let dx = this.posX - other.posX;
    let dy = this.posY - other.posY;
    let distance = Math.hypot(dx, dy);
    return distance < (this.radius + other.radius);
  }
  
  // Resuelve la colisión:
  // - Se separan las bolas para evitar solapamientos.
  // - Se calcula la normal a partir de la diferencia de posiciones.
  // - Se refleja la velocidad de cada bola en sentido opuesto a la dirección de impacto,
  //   usando la proyección de la velocidad relativa sin factor extra.
  // - Se activa un flash en azul.
  resolveCollision(other) {
    const xDiff = this.posX - other.posX;
    const yDiff = this.posY - other.posY;
    let distance = Math.hypot(xDiff, yDiff);
    if (distance === 0) {
      distance = 0.1;
    }
    // Normal de la colisión
    const n = { x: xDiff / distance, y: yDiff / distance };
    
    // Separar las bolas para que no se solapen
    const overlap = (this.radius + other.radius) - distance;
    if (overlap > 0) {
      const correctionFactor = overlap / 2;
      this.posX += n.x * correctionFactor;
      this.posY += n.y * correctionFactor;
      other.posX -= n.x * correctionFactor;
      other.posY -= n.y * correctionFactor;
    }
    
    // Calcular la velocidad relativa
    const vRel = { x: this.dx - other.dx, y: this.dy - other.dy };
    // Proyección de la velocidad relativa sobre la normal
    const dotProduct = vRel.x * n.x + vRel.y * n.y;
    
    // Actualizar las velocidades sin el factor 2 para evitar aumentar excesivamente la energía
    this.dx = this.dx - dotProduct * n.x;
    this.dy = this.dy - dotProduct * n.y;
    other.dx = other.dx + dotProduct * n.x;
    other.dy = other.dy + dotProduct * n.y;
    
    // Activar el efecto flash (bola se pinta en azul por algunos frames)
    this.flashTimer = 5;
    other.flashTimer = 5;
  }
}

let circles = [];

// Genera 10 bolas con velocidad entre 1 y 5 unidades y colores típicos de billar
function generateCircles(n) {
  // Paleta de colores (puedes personalizarla)
  let colors = ["#FFD700", "#FF4500", "#1E90FF", "#32CD32", "#8A2BE2", "#DC143C", "#FF8C00", "#00CED1", "#FF1493", "#00FA9A"];
  for (let i = 0; i < n; i++) {
    let radius = Math.random() * 20 + 20; // Radio entre 20 y 40
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = Math.random() * (window_height - radius * 2) + radius;
    let color = colors[i % colors.length];
    let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5
    let text = (i + 1).toString();
    circles.push(new Circle(x, y, radius, color, text, speed));
  }
}

function animate() {
  // Dibujar fondo de mesa de billar (fieltro verde)
  ctx.fillStyle = "#35654d"; // Color verde para el fieltro
  ctx.fillRect(0, 0, window_width, window_height);
  
  // Dibujar bandas o cojines (bordes de la mesa) en marrón
  ctx.lineWidth = 30;
  ctx.strokeStyle = "#654321";
  ctx.strokeRect(15, 15, window_width - 30, window_height - 30);
  
  // Actualizar la posición de cada bola
  circles.forEach(circle => circle.move());
  
  // Detectar y resolver colisiones entre bolas
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      if (circles[i].checkCollision(circles[j])) {
        circles[i].resolveCollision(circles[j]);
      }
    }
  }
  
  // Dibujar las bolas (con efecto flash si han colisionado)
  circles.forEach(circle => circle.draw(ctx));
  
  requestAnimationFrame(animate);
}

generateCircles(10);
animate();
