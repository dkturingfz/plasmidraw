# PlasimDraw

质粒图谱可视化工具，基于 React + Vite 构建。

## 功能特性

- 🧬 **质粒图谱渲染** - 支持圆形质粒图谱的 SVG 渲染
- 📤 **文件上传** - 支持拖拽上传和点击选择 JSON 文件
- 📤 **导出功能** - 支持导出为 SVG、PNG、PDF 格式
- ℹ️ **Feature 提示** - 鼠标悬停显示基因/特征详情
- 🎨 **现代化 UI** - 简洁美观的界面设计

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5174/ 即可使用。

### 构建生产版本

```bash
npm run build
```

## JSON 数据格式

### 基础格式（features 格式）

```json
{
  "name": "pUC19",
  "sequencelength": 2686,
  "size": 375,
  "radius": 125,
  "width": 8,
  "features": [
    {
      "id": "lacZ",
      "label": "lacZ",
      "start": 80,
      "end": 454,
      "style": { "fill": "#4ade80" },
      "description": "lacZ alpha fragment",
      "details": "编码 β-半乳糖苷酶 α 片段"
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 质粒名称 |
| sequencelength | number | 是 | 序列总长度 (bp) |
| size | number | 是 | 画布尺寸 (px) |
| radius | number | 否 | 轨道半径，默认 100 |
| width | number | 否 | 轨道宽度，默认 25 |
| features | array | 否 | 特征数组 |

### Feature 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识符 |
| label | string | 显示标签（用于图层分组） |
| start | number | 起始位置 |
| end | number | 结束位置 |
| style | object | 样式对象 `{ fill, stroke, ... }` |
| description | string | 简短描述 |
| details | string | 详细信息 |
| arrowstartlength | number | 箭头起始长度 |
| arrowendlength | number | 箭头结束长度 |
| vadjust | number | 垂直偏移 |
| labelVadjust | number | 标签垂直偏移 |

### 箭头样式示例

```json
{
  "id": "gene1",
  "label": "Gene A",
  "start": 100,
  "end": 500,
  "style": { "fill": "rgba(74, 222, 128, 0.9)" },
  "arrowstartlength": -4,
  "arrowendlength": 4,
  "description": "Gene A",
  "details": "功能描述"
}
```

## 组件说明

### PlasmidMap

主图谱组件，负责渲染质粒图谱。

```jsx
import PlasmidMap from './PlasmidMap';

<PlasmidMap data={plasmidData} />
```

### 底层组件

从 `src/lib` 导出的基础组件：

```jsx
import { 
  Plasmid, 
  PlasmidTrack, 
  TrackMarker, 
  MarkerLabel, 
  TrackScale, 
  TrackLabel 
} from './lib';
```

## 项目结构

```
plasimdraw/
├── src/
│   ├── App.jsx              # 主应用组件
│   ├── main.jsx             # 入口文件
│   ├── PlasmidMap.jsx       # 图谱渲染组件
│   ├── index.css            # 全局样式
│   ├── components/
│   │   ├── Toolbar.jsx      # 工具栏组件
│   │   └── ExportButtons.jsx # 导出功能组件
│   ├── lib/
│   │   ├── directives.jsx   # 基础组件定义
│   │   ├── index.js         # 组件导出
│   │   └── svgUtil.jsx      # SVG 工具函数
│   └── styles/
│       └── main.css         # 主样式文件
├── examples/                 # 示例数据
│   ├── pUC19.json
│   ├── pBR322.json
│   └── HSP70_standard.json
├── package.json
└── vite.config.js
```

## 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具
- **html-to-image** - 图片导出
- **jsPDF** - PDF 导出

## 许可证

MIT