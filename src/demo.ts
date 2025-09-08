import { Boids, type Attractor } from './index.js';

class BoidsDemo {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private boids: Boids;
  private attractors: Attractor[];
  private animationId: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private frameCount: number = 0;
  private fpsElement: HTMLElement | null = null;
  private countElement: HTMLElement | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    // 初始化吸引子（鼠标跟随）
    this.attractors = [[
      Infinity,
      Infinity,
      200,
      0.1
    ]];

    // 创建 boids 实例
    this.boids = new Boids({
      boids: 300,
      speedLimit: 1.2,
      accelerationLimit: 0.1,
      separationDistance: 80,
      alignmentDistance: 250,
      cohesionDistance: 220,
      separationForce: 0.12,
      alignmentForce: 0.45,
      cohesionForce: 0.08,
      attractors: this.attractors
    });

    this.setupCanvas();
    this.setupEventListeners();
    this.setupUI();
    this.startAnimation();
  }

  private setupCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#FFF1EB';
    document.body.appendChild(this.canvas);
  }

  private setupEventListeners(): void {
    // 鼠标移动事件
    document.body.addEventListener('mousemove', (e) => {
      const halfHeight = this.canvas.height / 2;
      const halfWidth = this.canvas.width / 2;
      
      this.attractors[0][0] = e.clientX - halfWidth;
      this.attractors[0][1] = e.clientY - halfHeight;
    });

    // 窗口大小调整事件
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }, 100);
    });
  }

  private setupUI(): void {
    // 创建 FPS 和计数显示
    const ui = document.createElement('div');
    ui.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      color: #543D5E;
      font-family: monospace;
      font-size: 14px;
      background: rgba(255, 255, 255, 0.8);
      padding: 10px;
      border-radius: 5px;
      z-index: 1000;
    `;
    
    ui.innerHTML = `
      <div>FPS: <span data-fps>0</span></div>
      <div>Boids: <span data-count>0</span></div>
    `;
    
    document.body.appendChild(ui);
    
    this.fpsElement = ui.querySelector('[data-fps]');
    this.countElement = ui.querySelector('[data-count]');
  }

  private updateFPS(currentTime: number): void {
    this.frameCount++;
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      if (this.fpsElement) {
        this.fpsElement.textContent = this.fps.toString();
      }
      
      // 根据 FPS 动态调整 boid 数量
      this.adjustBoidCount();
    }
  }

  private adjustBoidCount(): void {
    const currentCount = this.boids.boids.length;
    
    if (this.fps <= 56 && currentCount > 10) {
      // FPS 太低，减少 boids
      this.boids.removeBoid(currentCount - 1);
    } else if (this.fps >= 60 && currentCount < 500) {
      // FPS 足够高，可以增加 boids
      this.boids.addBoid(0, 0, Math.random() * 6 - 3, Math.random() * 6 - 3);
    }
    
    if (this.countElement) {
      this.countElement.textContent = this.boids.boids.length.toString();
    }
  }

  private render(): void {
    const boidData = this.boids.boids;
    const halfHeight = this.canvas.height / 2;
    const halfWidth = this.canvas.width / 2;

    // 清除画布（使用半透明覆盖创建更明显的拖尾效果，透明度调低）
    this.ctx.fillStyle = 'rgba(255, 241, 235, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制 boids
    this.ctx.fillStyle = '#543D5E';
    for (let i = 0; i < boidData.length; i++) {
      let x = boidData[i][0];
      let y = boidData[i][1];
      
      boidData[i][0] = x > halfWidth ? -halfWidth : -x > halfWidth ? halfWidth : x;
      boidData[i][1] = y > halfHeight ? -halfHeight : -y > halfHeight ? halfHeight : y;
      
      this.ctx.beginPath();
      this.ctx.arc(x + halfWidth, y + halfHeight, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private animate(currentTime: number): void {
    this.updateFPS(currentTime);
    this.boids.tick();
    this.render();
    
    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  private startAnimation(): void {
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// 启动演示
document.addEventListener('DOMContentLoaded', () => {
  const demo = new BoidsDemo();
  // 将演示实例暴露到全局作用域，以便 HTML 中的控制按钮使用
  (window as any).boidsDemo = demo;
});

export default BoidsDemo;
