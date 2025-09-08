# Boids 🐦

一个轻量级的 TypeScript 实现的 [boids 群体行为算法](http://en.wikipedia.org/wiki/Boids)。这个库实现了经典的群体行为模拟，包括分离、对齐和凝聚三个基本规则。

## ✨ 特性

- 🚀 **高性能**: 优化的算法实现，支持大量 boids 同时运行
- 📦 **轻量级**: 极小的包体积，无外部依赖
- 🔧 **TypeScript**: 完整的类型定义，提供优秀的开发体验
- 🎯 **现代化**: 使用 ES6+ 和现代 JavaScript 特性
- 🎮 **交互式**: 支持鼠标交互和动态调整参数

## 📦 安装

```bash
npm install boids
```

## 🚀 快速开始

### 基本用法

```typescript
import { Boids } from 'boids';

// 创建 boids 实例
const flock = new Boids({
  boids: 50,              // boid 数量
  speedLimit: 2,          // 最大速度
  accelerationLimit: 0.5, // 最大加速度
  separationDistance: 60, // 分离距离
  alignmentDistance: 180, // 对齐距离
  cohesionDistance: 180,  // 凝聚距离
  separationForce: 0.15,  // 分离力
  alignmentForce: 0.25,   // 对齐力
  cohesionForce: 0.1,     // 凝聚力
});

// 动画循环
function animate() {
  flock.tick(); // 执行一次模拟步进
  
  // 渲染 boids
  flock.boids.forEach(boid => {
    const [x, y] = boid;
    // 绘制 boid...
  });
  
  requestAnimationFrame(animate);
}

animate();
```

### 添加吸引子/排斥子

```typescript
// 添加吸引子
flock.addAttractor(100, 100, 50, 0.5);

// 添加排斥子（负力值）
flock.addAttractor(200, 200, 30, -0.3);

// 移除吸引子
flock.removeAttractor(0);
```

### 动态管理 Boids

```typescript
// 添加新的 boid
flock.addBoid(0, 0, 2, 1); // x, y, vx, vy

// 移除 boid
flock.removeBoid(0);

// 清空所有 boids
flock.clearBoids();
```

## 🎮 在线演示

访问 [在线演示](https://your-demo-url.com) 查看 boids 算法的实际效果。

## 📚 API 参考

### Boids 类

#### 构造函数

```typescript
new Boids(options?: BoidsOptions, callback?: BoidsCallback)
```

#### 方法

- `tick()`: 执行一次模拟步进
- `addBoid(x, y, vx?, vy?)`: 添加新的 boid
- `removeBoid(index)`: 移除指定索引的 boid
- `addAttractor(x, y, radius, force)`: 添加吸引子/排斥子
- `removeAttractor(index)`: 移除指定索引的吸引子
- `clearBoids()`: 清空所有 boids
- `clearAttractors()`: 清空所有吸引子

#### 属性

- `boids: BoidData[]`: boid 数据数组
- `attractors: Attractor[]`: 吸引子/排斥子数组

### 类型定义

```typescript
// Boid 数据结构
type BoidData = [number, number, number, number, number, number];
// [xPosition, yPosition, xSpeed, ySpeed, xAcceleration, yAcceleration]

// 吸引子数据结构
type Attractor = [number, number, number, number];
// [xPosition, yPosition, radius, force]

// 配置选项
interface BoidsOptions {
  boids?: number;              // boid 数量
  speedLimit?: number;         // 最大速度限制
  accelerationLimit?: number;  // 最大加速度限制
  separationDistance?: number; // 分离距离
  alignmentDistance?: number;  // 对齐距离
  cohesionDistance?: number;   // 凝聚距离
  separationForce?: number;    // 分离力
  cohesionForce?: number;     // 凝聚力
  alignmentForce?: number;     // 对齐力
  attractors?: Attractor[];   // 吸引子数组
}
```

## 🔬 算法原理

Boids 算法基于三个简单的规则：

1. **分离 (Separation)**: 避免与邻近个体碰撞
2. **对齐 (Alignment)**: 与邻近个体保持相同方向
3. **凝聚 (Cohesion)**: 向群体中心移动

这些简单的规则组合在一起，产生了复杂的群体行为模式。

## ⚡ 性能

在标准测试环境下：

- 50 boids: ~34,000 ticks/sec
- 100 boids: ~10,000 ticks/sec
- 500 boids: ~400 ticks/sec
- 1000 boids: ~95 ticks/sec

## 🛠️ 开发

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-username/boids.git
cd boids

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

### 项目结构

```
src/
├── index.ts      # 主入口文件
├── boids.ts      # Boids 类实现
├── types.ts      # TypeScript 类型定义
└── demo.ts       # 演示代码
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 更新日志

### v3.0.0
- 🎉 完全重写为 TypeScript
- 🚀 使用 Vite 构建系统
- 🔧 现代化的 API 设计
- 📦 更好的类型支持
- 🎮 改进的演示界面

### v2.0.0
- 原始 JavaScript 实现