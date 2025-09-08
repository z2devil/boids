import { Boids } from './src/index.js';

// 创建 boids 实例
const flock = new Boids({
  boids: 100,
  speedLimit: 2,
  accelerationLimit: 0.5,
  separationDistance: 60,
  alignmentDistance: 180,
  cohesionDistance: 180,
  separationForce: 0.15,
  alignmentForce: 0.25,
  cohesionForce: 0.1,
});

// 添加一些吸引子
flock.addAttractor(100, 100, 50, 0.3);
flock.addAttractor(200, 200, 30, -0.2); // 排斥子

// 设置 tick 事件监听器
flock.on('tick', (boids) => {
  console.log(`当前有 ${boids.length} 个 boids`);
  
  // 可以在这里进行渲染或其他处理
  boids.forEach((boid, index) => {
    const [x, y, vx, vy] = boid;
    if (index < 3) { // 只打印前3个 boid 的信息
      console.log(`Boid ${index}: 位置(${x.toFixed(2)}, ${y.toFixed(2)}) 速度(${vx.toFixed(2)}, ${vy.toFixed(2)})`);
    }
  });
});

// 模拟运行
console.log('开始 boids 模拟...');
for (let i = 0; i < 10; i++) {
  flock.tick();
  console.log(`--- Tick ${i + 1} ---`);
}

console.log('模拟完成！');
