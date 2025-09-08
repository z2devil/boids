import type { BoidData, Attractor, BoidsOptions, BoidsCallback } from './types.js';

/**
 * 数组索引常量
 */
const POSITIONX = 0;
const POSITIONY = 1;
const SPEEDX = 2;
const SPEEDY = 3;
const ACCELERATIONX = 4;
const ACCELERATIONY = 5;

/**
 * 双狗腿斜边近似算法
 * http://forums.parallax.com/discussion/147522/dog-leg-hypotenuse-approximation
 */
function hypot(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return hi + 3 * lo / 32 + Math.max(0, 2 * lo - hi) / 8 + Math.max(0, 4 * lo - hi) / 16;
}

/**
 * 简单的事件发射器实现
 */
class EventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners) return false;
    
    listeners.forEach(listener => listener(...args));
    return true;
  }
}

/**
 * Boids 群体模拟类
 * 实现了经典的 boids 群体行为算法，包括分离、对齐和凝聚三个基本规则
 */
export class Boids extends EventEmitter {
  /** boid 数据数组 */
  public readonly boids: BoidData[] = [];
  
  /** 吸引子/排斥子数组 */
  public attractors: Attractor[] = [];
  
  /** 速度限制的平方值 */
  private readonly speedLimit: number;
  /** 速度限制的原始值 */
  private readonly speedLimitRoot: number;
  /** 加速度限制的平方值 */
  private readonly accelerationLimit: number;
  /** 加速度限制的原始值 */
  private readonly accelerationLimitRoot: number;
  /** 分离距离的平方值 */
  private readonly separationDistance: number;
  /** 对齐距离的平方值 */
  private readonly alignmentDistance: number;
  /** 凝聚距离的平方值 */
  private readonly cohesionDistance: number;
  /** 分离力 */
  private readonly separationForce: number;
  /** 凝聚力 */
  private readonly cohesionForce: number;
  /** 对齐力 */
  private readonly alignmentForce: number;

  /**
   * 创建 Boids 实例
   * @param options 配置选项
   * @param callback 可选的 tick 事件回调函数
   */
  constructor(options: BoidsOptions = {}, callback?: BoidsCallback) {
    super();

    // 设置配置参数
    this.speedLimitRoot = options.speedLimit || 0;
    this.accelerationLimitRoot = options.accelerationLimit || 1;
    this.speedLimit = Math.pow(this.speedLimitRoot, 2);
    this.accelerationLimit = Math.pow(this.accelerationLimitRoot, 2);
    this.separationDistance = Math.pow(options.separationDistance || 60, 2);
    this.alignmentDistance = Math.pow(options.alignmentDistance || 180, 2);
    this.cohesionDistance = Math.pow(options.cohesionDistance || 180, 2);
    this.separationForce = options.separationForce || 0.15;
    this.cohesionForce = options.cohesionForce || 0.1;
    this.alignmentForce = options.alignmentForce || 0.25;
    this.attractors = options.attractors || [];

    // 初始化 boids
    const boidCount = options.boids === undefined ? 50 : options.boids;
    for (let i = 0; i < boidCount; i++) {
      this.boids[i] = [
        Math.random() * 400 - 200, Math.random() * 400 - 200,
        (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1,
        0, 0
      ];
    }

    // 设置 tick 事件监听器
    if (callback) {
      this.on('tick', callback);
    }
  }

  /**
   * 执行一次模拟步进
   * 计算所有 boids 的分离、对齐、凝聚行为，并更新它们的位置
   */
  public tick(): void {
    const boids = this.boids;
    const sepDist = this.separationDistance;
    const sepForce = this.separationForce;
    const cohDist = this.cohesionDistance;
    const cohForce = this.cohesionForce;
    const aliDist = this.alignmentDistance;
    const aliForce = this.alignmentForce;
    const speedLimit = this.speedLimit;
    const accelerationLimit = this.accelerationLimit;
    const accelerationLimitRoot = this.accelerationLimitRoot;
    const speedLimitRoot = this.speedLimitRoot;
    const size = boids.length;
    const attractors = this.attractors;
    const attractorCount = attractors.length;

    // 计算每个 boid 的力
    for (let current = 0; current < size; current++) {
      let sforceX = 0, sforceY = 0; // 分离力
      let cforceX = 0, cforceY = 0; // 凝聚力
      let aforceX = 0, aforceY = 0; // 对齐力
      const currPos = boids[current];

      // 处理吸引子/排斥子
      for (let target = 0; target < attractorCount; target++) {
        const attractor = attractors[target];
        const spareX = currPos[0] - attractor[0];
        const spareY = currPos[1] - attractor[1];
        const distSquared = spareX * spareX + spareY * spareY;

        if (distSquared < attractor[2] * attractor[2]) {
          const length = hypot(spareX, spareY);
          boids[current][SPEEDX] -= (attractor[3] * spareX / length) || 0;
          boids[current][SPEEDY] -= (attractor[3] * spareY / length) || 0;
        }
      }

      // 计算与其他 boids 的相互作用
      for (let target = 0; target < size; target++) {
        if (target === current) continue;
        
        const spareX = currPos[0] - boids[target][0];
        const spareY = currPos[1] - boids[target][1];
        const distSquared = spareX * spareX + spareY * spareY;

        if (distSquared < sepDist) {
          // 分离：避免碰撞
          sforceX += spareX;
          sforceY += spareY;
        } else {
          if (distSquared < cohDist) {
            // 凝聚：向群体中心移动
            cforceX += spareX;
            cforceY += spareY;
          }
          if (distSquared < aliDist) {
            // 对齐：与邻居保持相同方向
            aforceX += boids[target][SPEEDX];
            aforceY += boids[target][SPEEDY];
          }
        }
      }

      // 应用分离力
      let length = hypot(sforceX, sforceY);
      boids[current][ACCELERATIONX] += (sepForce * sforceX / length) || 0;
      boids[current][ACCELERATIONY] += (sepForce * sforceY / length) || 0;
      
      // 应用凝聚力
      length = hypot(cforceX, cforceY);
      boids[current][ACCELERATIONX] -= (cohForce * cforceX / length) || 0;
      boids[current][ACCELERATIONY] -= (cohForce * cforceY / length) || 0;
      
      // 应用对齐力
      length = hypot(aforceX, aforceY);
      boids[current][ACCELERATIONX] -= (aliForce * aforceX / length) || 0;
      boids[current][ACCELERATIONY] -= (aliForce * aforceY / length) || 0;
    }

    // 更新速度和位置
    for (let current = 0; current < size; current++) {
      // 限制加速度
      if (accelerationLimit) {
        const distSquared = boids[current][ACCELERATIONX] * boids[current][ACCELERATIONX] + 
                           boids[current][ACCELERATIONY] * boids[current][ACCELERATIONY];
        if (distSquared > accelerationLimit) {
          const ratio = accelerationLimitRoot / hypot(boids[current][ACCELERATIONX], boids[current][ACCELERATIONY]);
          boids[current][ACCELERATIONX] *= ratio;
          boids[current][ACCELERATIONY] *= ratio;
        }
      }

      // 更新速度
      boids[current][SPEEDX] += boids[current][ACCELERATIONX];
      boids[current][SPEEDY] += boids[current][ACCELERATIONY];

      // 限制速度
      if (speedLimit) {
        const distSquared = boids[current][SPEEDX] * boids[current][SPEEDX] + 
                           boids[current][SPEEDY] * boids[current][SPEEDY];
        if (distSquared > speedLimit) {
          const ratio = speedLimitRoot / hypot(boids[current][SPEEDX], boids[current][SPEEDY]);
          boids[current][SPEEDX] *= ratio;
          boids[current][SPEEDY] *= ratio;
        }
      }

      // 更新位置
      boids[current][POSITIONX] += boids[current][SPEEDX];
      boids[current][POSITIONY] += boids[current][SPEEDY];

      // 重置加速度
      boids[current][ACCELERATIONX] = 0;
      boids[current][ACCELERATIONY] = 0;
    }

    // 触发 tick 事件
    this.emit('tick', boids);
  }

  /**
   * 添加一个新的 boid
   * @param x 初始 x 位置
   * @param y 初始 y 位置
   * @param vx 初始 x 速度
   * @param vy 初始 y 速度
   */
  public addBoid(x: number, y: number, vx: number = 0, vy: number = 0): void {
    this.boids.push([x, y, vx, vy, 0, 0]);
  }

  /**
   * 移除指定索引的 boid
   * @param index boid 索引
   */
  public removeBoid(index: number): void {
    if (index >= 0 && index < this.boids.length) {
      this.boids.splice(index, 1);
    }
  }

  /**
   * 添加吸引子/排斥子
   * @param x x 位置
   * @param y y 位置
   * @param radius 影响半径
   * @param force 力的大小（负值为排斥）
   */
  public addAttractor(x: number, y: number, radius: number, force: number): void {
    this.attractors.push([x, y, radius, force]);
  }

  /**
   * 移除指定索引的吸引子/排斥子
   * @param index 吸引子索引
   */
  public removeAttractor(index: number): void {
    if (index >= 0 && index < this.attractors.length) {
      this.attractors.splice(index, 1);
    }
  }

  /**
   * 清空所有 boids
   */
  public clearBoids(): void {
    this.boids.length = 0;
  }

  /**
   * 清空所有吸引子/排斥子
   */
  public clearAttractors(): void {
    this.attractors.length = 0;
  }
}

// 为了向后兼容，提供工厂函数
export function createBoids(options?: BoidsOptions, callback?: BoidsCallback): Boids {
  return new Boids(options, callback);
}

// 默认导出
export default Boids;
