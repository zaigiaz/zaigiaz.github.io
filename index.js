class HexagonalBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hexSize = 30;
        this.hexColor = 'rgba(100, 100, 255, 0.17)';
        this.scrollSpeed = 0.5;
        this.offset = 0;
        
        this.setupCanvas();
        this.calculateDimensions();
        this.startAnimation();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.willChange = 'transform';
    }

    calculateDimensions() {
        const hexWidth = this.hexSize * 2;
        const hexHeight = Math.sqrt(3) * this.hexSize;
        
        // Calculate grid dimensions to ensure seamless repeat
        this.hexWidth = hexWidth;
        this.hexHeight = hexHeight;
        this.repeatHeight = hexHeight * 0.75;
    }

    drawHex(x, y) {
        const h = this.hexSize;
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x_i = x + h * Math.cos(angle);
            const y_i = y + h * Math.sin(angle);
            
            if (i === 0) this.ctx.moveTo(x_i, y_i);
            else this.ctx.lineTo(x_i, y_i);
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = this.hexColor;
        this.ctx.stroke();
    }

    drawHexGrid() {
        const { width, height } = this.canvas;

        this.ctx.clearRect(0, 0, width, height);

        // Draw two overlapping grids to create continuous scroll
        for (let pass = 0; pass < 2; pass++) {
            for (let y = -this.hexHeight; y < height + this.hexHeight; y += this.repeatHeight) {
                for (let x = 0; x < width; x += this.hexWidth * 1.5) {
                    // First pass
                    this.drawHex(x, y + this.offset);
                    this.drawHex(x + this.hexWidth * 0.75, y + this.hexHeight * 0.5 + this.offset);
                    
                    // Second pass (offset to create continuous pattern)
                    if (pass === 1) {
                        this.drawHex(x, y + this.offset - height);
                        this.drawHex(x + this.hexWidth * 0.75, y + this.hexHeight * 0.5 + this.offset - height);
                    }
                }
            }
        }
    }

    startAnimation() {
        let lastTime = 0;

        const animate = (currentTime) => {
            if (lastTime === 0) lastTime = currentTime;
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            // Update offset with seamless looping
            this.offset += this.scrollSpeed * (deltaTime / 16);
            
            // Reset when offset exceeds repeat height, creating seamless scroll
            if (this.offset >= this.canvas.height) {
                this.offset = 0;
            }

            this.drawHexGrid();

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
}

// Usage remains the same as previous example
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '-1';
canvas.style.pointerEvents = 'none';
document.body.appendChild(canvas);

const hexBackground = new HexagonalBackground(canvas);
