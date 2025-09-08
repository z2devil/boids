/**
 * 表示单个 boid 的数据结构
 * [xPosition, yPosition, xSpeed, ySpeed, xAcceleration, yAcceleration]
 */
export type BoidData = [number, number, number, number, number, number];

/**
 * 吸引子/排斥子的数据结构
 * [xPosition, yPosition, radius, force]
 */
export type Attractor = [number, number, number, number];

/**
 * Boids 配置选项
 */
export interface BoidsOptions {
  /** boid 数量，默认为 50 */
  boids?: number;
  /** 最大速度限制，默认为 0（无限制） */
  speedLimit?: number;
  /** 最大加速度限制，默认为 1 */
  accelerationLimit?: number;
  /** 分离距离，默认为 60 */
  separationDistance?: number;
  /** 对齐距离，默认为 180 */
  alignmentDistance?: number;
  /** 凝聚距离，默认为 180 */
  cohesionDistance?: number;
  /** 分离力，默认为 0.15 */
  separationForce?: number;
  /** 凝聚力，默认为 0.1 */
  cohesionForce?: number;
  /** 对齐力，默认为 0.25 */
  alignmentForce?: number;
  /** 吸引子/排斥子数组，默认为空数组 */
  attractors?: Attractor[];
}

/**
 * Boids 事件回调函数类型
 */
export type BoidsCallback = (boids: BoidData[]) => void;
