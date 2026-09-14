# 贡献指南 🤝

感谢你有兴趣为三体问题模拟器项目做出贡献！

## 行为准则

我们致力于为所有参与者提供包容、尊重的环境。请对所有互动保持友好和专业。

## 如何贡献

### 报告 Bug 🐛

发现了 bug？我们想听听！

1. **检查已有 Issue**：先检查 [Issues](../../issues) 页面，看是否已有相同报告
2. **创建详细报告**，包含：
   - 清晰的标题
   - 详细的重现步骤
   - 预期行为 vs 实际行为
   - 系统信息（OS、浏览器版本、Node 版本）
   - 错误信息或截图

### 建议功能 ✨

有新想法？我们欢迎功能建议！

1. 打开 Issue 并使用标题前缀 `[Feature]`
2. 清楚地描述建议的功能
3. 解释使用场景和预期效果
4. 如果可能，提供示例代码

### 提交代码 💻

#### 分支策略

```bash
# 从 main 分支创建新分支
git checkout -b feature/description-of-feature

# 或修复 bug
git checkout -b fix/description-of-bug

# 命名规范示例：
# - feature/particle-animation
# - fix/camera-controls-bug
# - docs/installation-guide
# - test/physics-engine
```

#### 开发流程

1. **Fork 本仓库**
```bash
git clone https://github.com/yourusername/three-body-problem-simulator.git
cd three-body-problem-simulator
```

2. **创建开发分支**
```bash
git checkout -b feature/your-feature-name
```

3. **安装依赖并开始开发**
```bash
npm install
npm run dev
```

4. **提交更改**
```bash
git add .
git commit -m "type: subject"

# 提交类型：
# feat:    新功能
# fix:     修复 bug
# docs:    文档更新
# style:   代码格式（不改逻辑）
# refactor: 重构代码
# test:    测试代码
# chore:   构建/依赖更新
```

5. **推送并创建 PR**
```bash
git push -u origin feature/your-feature-name
```

6. **在 GitHub 上创建 Pull Request**
   - 提供清晰的 PR 描述
   - 关联相关的 Issue
   - 截图或演示更改

#### 代码规范

遵循以下规范确保代码质量：

**TypeScript**
```typescript
// ✅ 好的做法
export const calculateForce = (mass1: number, mass2: number, distance: number): number => {
  const G = 1;
  return (G * mass1 * mass2) / (distance * distance);
};

// ❌ 避免
function calculateForce(mass1, mass2, distance) {
  return (1 * mass1 * mass2) / (distance * distance);
}
```

**React 组件**
```typescript
// ✅ 函数式组件 + TypeScript
interface Props {
  state: SystemState;
  onUpdate: (newState: SystemState) => void;
}

export const SimulationComponent: React.FC<Props> = ({ state, onUpdate }) => {
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
};

// ❌ 避免使用类组件
class SimulationComponent extends React.Component { }
```

**样式**
```typescript
// ✅ 使用 Tailwind CSS 类
<div className="flex items-center justify-between gap-4 p-4 bg-gray-900 rounded-lg">

// ❌ 避免内联样式
<div style={{display: 'flex', padding: '1rem'}}>
```

**注释**
```typescript
/**
 * 使用 RK4 方法积分一步
 * @param state 当前系统状态
 * @param dt 时间步长
 * @returns 下一步的系统状态
 */
export function stepRK4(state: SystemState, dt: number): SystemState {
  // 实现细节
}
```

### 文件结构

添加新功能时，请遵循现有结构：

```
src/
├── components/          # React 组件
│   └── MyComponent.tsx  # 新组件放这里
├── physics/             # 物理引擎
│   └── newAlgorithm.ts  # 新算法放这里
├── hooks/               # 自定义 hooks（如需要）
└── utils/               # 工具函数（如需要）
```

## 测试

提交代码前，请确保：

```bash
# 运行类型检查
npm run lint

# 如果有测试（未来添加）
npm run test

# 构建检查
npm run build
```

## Pull Request 流程

1. **创建 PR 前的自检**
   - ✅ 代码遵循规范
   - ✅ 运行了 `npm run lint`
   - ✅ 不包含调试代码
   - ✅ 提供了清晰的 PR 描述

2. **PR 描述模板**
```markdown
## 描述

简要描述你的更改

## 相关 Issue

关联 Issue：#123

## 改动类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 破坏性更改
- [ ] 文档更新

## 测试

描述你的测试方法

## 截图（若适用）

添加相关截图或 GIF
```

3. **审查反馈**
   - 感谢审查者的反馈
   - 积极地解决批注
   - 如有异议，理性讨论

## 项目结构说明

### 核心模块
- **physics/rk4.ts**：物理引擎（RK4 算法）
- **components/Simulation.tsx**：3D 渲染主组件
- **components/Controls.tsx**：UI 控制面板
- **constants.ts**：预设配置

### 添加新功能的检查清单

- [ ] 在相应的模块中实现代码
- [ ] 添加 TypeScript 类型定义
- [ ] 添加适当的注释和文档
- [ ] 确保没有 console 错误/警告
- [ ] 在 `README.md` 中更新文档（如需要）
- [ ] 运行 `npm run lint` 检查
- [ ] 在 `README.md` 中致谢（如需要）

## 开发命令

```bash
# 启动开发服务器（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run lint

# 清理构建
npm run clean
```

## 问题？

- 📖 查看 [README.md](README.md)
- 🐛 浏览 [Issues](../../issues)
- 💬 开始 [Discussion](../../discussions)

## 许可证

通过贡献本项目，你同意你的贡献将在 Apache License 2.0 下进行许可。

---

**感谢你的贡献！** 🎉
