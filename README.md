# Draft Board / 草稿板

[English](#english) | [中文](#chinese)

---

<a name="english"></a>

## 🎨 Draft Board

A lightweight Chrome extension that adds a transparent drawing canvas overlay to any webpage. Perfect for annotations, brainstorming, and visual note-taking.

### ✨ Features

- **Transparent Canvas Overlay** - Draw directly on any webpage without interfering with page content
- **Flexible Drawing Tools**
  - Brush with customizable colors and opacity
  - Eraser for quick corrections
  - Adjustable stroke size (1-50px)
  - 9 preset colors + custom color picker
- **Smart UI**
  - Draggable floating button
  - Bottom toolbar with modern pill design
  - Adjustable background dimming (0-90%)
  - Custom cursor that follows your pointer
- **Per-Site Settings** - Enable/disable for specific websites, settings persist per domain
- **Bilingual Support** - English and Chinese interfaces
- **Shadow DOM Isolation** - No style conflicts with host pages

### 📦 Installation

#### Install from Source

1. Download or clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select the project directory
5. The Draft Board icon will appear in your toolbar

### 🚀 Usage

1. **Enable for a site**: Click the extension icon and toggle the switch ON
2. **Activate drawing**: Click the floating logo button (bottom-right)
3. **Draw**: Select tools and colors from the bottom toolbar
   - Use brush to draw
   - Use eraser to remove strokes
   - Adjust stroke size and opacity with sliders
   - Dim background for better visibility
4. **Close**: Click the close button or logo to deactivate
5. **Clear**: Use the trash icon to clear all drawings

### 🎯 Keyboard-Free Operation

All features are accessible through intuitive UI controls - no keyboard shortcuts required.

### ⚙️ Technical Details

- **Manifest Version**: V3 (latest Chrome extension standard)
- **Architecture**: Shadow DOM for style isolation
- **Drawing Engine**: Dual-canvas system (main + temporary layer)
- **Storage**: Chrome Local Storage API
- **Permissions**: `storage`, `<all_urls>` (for canvas injection)

### 🛠️ Development

#### Project Structure

```
chrome-draft-board/
├── manifest.json       # Extension manifest
├── content.js          # Main app (injected into pages)
├── popup.html/js       # Extension popup UI
├── style.css           # Shadow DOM styles
├── logo.svg            # Extension logo
└── icons/              # Extension icons
```

#### Local Development

1. Make changes to source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Draft Board card
4. Reload target webpage to test changes

#### Debugging

- **Content Script**: Open DevTools on target page
- **Popup**: Right-click extension icon → "Inspect popup"

### 📝 License

This project is open source. Feel free to use and modify.

---

<a name="chinese"></a>

## 🎨 草稿板

一个轻量级的 Chrome 扩展，可在任何网页上添加透明绘图画布覆盖层。非常适合标注、头脑风暴和视觉笔记。

### ✨ 功能特性

- **透明画布覆盖层** - 直接在任何网页上绘图，不干扰页面内容
- **灵活的绘图工具**
  - 支持自定义颜色和透明度的画笔
  - 橡皮擦快速修正
  - 可调节笔触粗细（1-50px）
  - 9 种预设颜色 + 自定义颜色选择器
- **智能用户界面**
  - 可拖动的浮动按钮
  - 现代胶囊设计的底部工具栏
  - 可调节背景暗度（0-90%）
  - 跟随指针的自定义光标
- **按站点设置** - 为特定网站启用/禁用，设置按域名持久化
- **双语支持** - 中英文界面切换
- **Shadow DOM 隔离** - 与宿主页面无样式冲突

### 📦 安装

#### 从源码安装

1. 下载或克隆此仓库
2. 打开 Chrome/Edge 浏览器，访问 `chrome://extensions/`
3. 开启"开发者模式"（右上角开关）
4. 点击"加载已解压的扩展程序"，选择项目目录
5. 草稿板图标将出现在工具栏中

### 🚀 使用方法

1. **为网站启用**：点击扩展图标，打开开关
2. **激活绘图**：点击浮动徽标按钮（右下角）
3. **开始绘制**：从底部工具栏选择工具和颜色
   - 使用画笔绘制
   - 使用橡皮擦删除笔画
   - 使用滑块调整笔触粗细和透明度
   - 调暗背景以获得更好的可见性
4. **关闭**：点击关闭按钮或徽标以停用
5. **清空**：使用垃圾桶图标清除所有绘图

### 🎯 无需键盘操作

所有功能均可通过直观的 UI 控件访问 - 无需键盘快捷键。

### ⚙️ 技术详情

- **清单版本**：V3（最新的 Chrome 扩展标准）
- **架构**：Shadow DOM 实现样式隔离
- **绘图引擎**：双画布系统（主画布 + 临时图层）
- **存储**：Chrome 本地存储 API
- **权限**：`storage`、`<all_urls>`（用于画布注入）

### 🛠️ 开发

#### 项目结构

```
chrome-draft-board/
├── manifest.json       # 扩展清单文件
├── content.js          # 主应用程序（注入到页面）
├── popup.html/js       # 扩展弹出窗口 UI
├── style.css           # Shadow DOM 样式
├── logo.svg            # 扩展徽标
└── icons/              # 扩展图标
```

#### 本地开发

1. 修改源文件
2. 访问 `chrome://extensions/`
3. 点击草稿板卡片上的刷新图标
4. 重新加载目标网页以测试更改

#### 调试

- **内容脚本**：在目标页面打开 DevTools
- **弹出窗口**：右键点击扩展图标 → "检查弹出内容"

### 📝 许可证

本项目为开源项目，欢迎使用和修改。

---

## 🌟 Screenshots / 截图

### Drawing Interface / 绘图界面
*(Floating logo button and bottom toolbar with color picker)*
*（浮动徽标按钮和带颜色选择器的底部工具栏）*

### Extension Popup / 扩展弹出窗口
*(Per-site toggle and language selection)*
*（按站点切换和语言选择）*

---

**Made with ❤️ for creative web browsing**
**为创意网页浏览而制作 ❤️**
