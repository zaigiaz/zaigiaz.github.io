class HexagonalBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hexSize = 30;
      this.hexColor = 'rgba(100,250,100,0.22)';
    this.lineWidth = 1;
    this.scrollSpeed = 30; // pixels per second
    this.offset = 0;

    this.setupCanvas();
    this.calculateDimensions();
    window.addEventListener('resize', () => { this.setupCanvas(); this.calculateDimensions(); });
    this.startAnimation();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.pointerEvents = 'none';

    this.canvas.width = Math.ceil(window.innerWidth * dpr);
    this.canvas.height = Math.ceil(window.innerHeight * dpr);
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = this.hexColor;
    this.canvas.style.willChange = 'transform';
  }

  calculateDimensions() {
    this.hexWidth = this.hexSize * 2;
    this.hexHeight = Math.sqrt(3) * this.hexSize;
    // vertical repeat distance between identical rows
    this.rowStep = this.hexHeight * 0.75;
    // vertical tiling period (distance at which the whole pattern repeats)
    // For this grid, repeating by rowStep * N_rows (we can use hexHeight + rowStep to be safe),
    // but the simplest is to wrap by (this.rowStep * some integer). Using hexHeight + rowStep avoids gaps.
    this.wrapDistance = this.rowStep * Math.ceil((window.innerHeight + this.hexHeight * 2) / this.rowStep);
    // Keep wrapDistance at least one rowStep to avoid zero:
    if (this.wrapDistance <= 0) this.wrapDistance = this.rowStep;
  }

  drawHex(cx, cy) {
    const h = this.hexSize;
    const ctx = this.ctx;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = cx + h * Math.cos(angle);
      const y = cy + h * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  drawHexGrid() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.strokeStyle = this.hexColor;
    this.ctx.lineWidth = this.lineWidth;

    // Determine minimal vertical range to cover screen plus one extra wrap above and below
    const startY = -this.hexHeight;
    const endY = height + this.hexHeight;

    for (let rowY = startY; rowY <= endY; rowY += this.rowStep) {
      // toggle stagger every row
      const rowIndex = Math.round((rowY - startY) / this.rowStep);
      const offsetX = (rowIndex % 2) ? (this.hexWidth * 0.75) : 0;

      for (let x = -this.hexWidth; x <= width + this.hexWidth; x += this.hexWidth * 1.5) {
        const baseX = x + offsetX;
        // primary draw
        const yPos = rowY + this.offset;
        this.drawHex(baseX, yPos);

        // draw one wrapped copy above and one below by exactly wrapDistance
        // (only one each avoids drawing far-away copies that can jump)
        this.drawHex(baseX, yPos - this.wrapDistance);
        this.drawHex(baseX, yPos + this.wrapDistance);
      }
    }
  }

  startAnimation() {
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      this.offset += this.scrollSpeed * dt;

      // Wrap offset into [0, wrapDistance) without sudden negative jumps
      this.offset = ((this.offset % this.wrapDistance) + this.wrapDistance) % this.wrapDistance;

      this.drawHexGrid();
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}

// Usage
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
new HexagonalBackground(canvas);
