# Draft Board / 草稿板

一个轻量级的 Chrome 浏览器扩展，可在任何网页上添加透明的绘图画布。适合网页标注、头脑风暴、视觉笔记和创意演示。

[English](#english) | [中文](#chinese)

---

<a name="chinese"></a>

## 🎨 草稿板

### ✨ 核心功能

#### 🖌️ 绘图工具
- **画笔工具**：支持自由绘制，可调节颜色、粗细和透明度
- **橡皮擦工具**：精准擦除不需要的笔画
- **笔触粗细**：1-50px 可调，适应不同绘制需求
- **颜色选择**：
  - 9 种精选预设颜色，快速切换
  - 自定义颜色选择器，支持任意颜色
- **透明度控制**：调整笔触透明度，实现半透明效果

#### 🎯 智能界面
- **透明画布**：覆盖在网页上方，不影响页面正常操作
- **浮动按钮**：可自由拖动定位，适应不同使用习惯
- **底部工具栏**：现代化设计，工具一目了然
- **背景调暗**：0-90% 可调，增强绘制内容的可见度
- **自定义光标**：绘图时显示专属光标，操作更精准
- **一键清空**：快速清除画板上的所有内容

#### ⚙️ 便捷设置
- **按网站启用**：为不同网站单独设置是否启用，互不干扰
- **设置持久化**：每个域名的设置自动保存，下次访问自动生效
- **双语支持**：自动检测系统语言，支持中英文界面切换
- **无键盘依赖**：所有功能均可通过鼠标操作完成

#### 🛡️ 技术保障
- **样式隔离**：采用 Shadow DOM 技术，不会与网页原有样式冲突
- **性能优化**：轻量级设计，不影响网页加载和运行速度
- **兼容性好**：适用于所有基于 Chromium 的浏览器（Chrome、Edge 等）

---

###  使用指南

#### 第一步：启用扩展
1. 访问你想要使用草稿板的网站
2. 点击浏览器工具栏中的「草稿板」扩展图标
3. 在弹出窗口中打开开关，为当前网站启用功能
4. 关闭弹窗后，右下角会出现浮动按钮

#### 第二步：开始绘制
1. 点击右下角的浮动按钮，激活绘图模式
2. 底部会弹出工具栏，显示所有绘图工具
3. 从工具栏中选择画笔或橡皮擦
4. 选择你喜欢的颜色（点击预设色或使用颜色选择器）
5. 调整笔触粗细和透明度
6. 在网页上自由绘制你的想法

#### 第三步：调整设置
- **调整背景暗度**：拖动「背景暗度」滑块，让绘制内容更清晰
- **移动浮动按钮**：按住按钮拖动，放到不挡视线的位置
- **切换工具**：随时在画笔和橡皮擦之间切换

#### 第四步：清除或关闭
- **清空画板**：点击工具栏的垃圾桶图标，清除所有绘制内容
- **关闭绘图**：点击关闭按钮或再次点击浮动按钮，退出绘图模式
- **禁用扩展**：点击扩展图标，关闭开关即可停用

---

### 💡 使用场景

- **在线学习**：在视频课程、文档页面上做笔记和标注
- **网页演示**：远程会议时在共享屏幕上绘制重点
- **产品设计**：在产品原型页面上快速标注反馈意见
- **创意头脑风暴**：在灵感网站上随手记录想法
- **Bug 反馈**：在测试页面上标注问题位置，截图发送
- **教学辅助**：在线教学时圈画重点，增强互动效果

---

### ❓ 常见问题

**Q: 绘制的内容会保存吗？**  
A: 目前绘制的内容不会自动保存。关闭绘图模式或刷新页面后，内容会清空。建议重要内容及时截图保存。

**Q: 会影响网页正常使用吗？**  
A: 不会。绘图画布覆盖在网页上方，但关闭绘图模式后完全不影响网页操作。

**Q: 支持哪些浏览器？**  
A: 支持所有基于 Chromium 内核的浏览器，包括 Chrome、Edge、Brave、Opera 等。

**Q: 为什么有的网站用不了？**  
A: 确保在扩展弹窗中为该网站启用了功能。如果仍然无法使用，可能是浏览器的安全限制（如 chrome://extensions/ 等系统页面）。

**Q: 可以更换界面语言吗？**  
A: 可以。点击扩展图标，在弹窗中选择「Language / 语言」，选择 English 或中文即可切换。

---

### 📝 开源许可

MIT

---

<a name="english"></a>

## 🎨 Draft Board

### ✨ Key Features

#### 🖌️ Drawing Tools
- **Brush Tool**: Free drawing with adjustable color, size, and opacity
- **Eraser Tool**: Precisely remove unwanted strokes
- **Stroke Size**: 1-50px adjustable range for different needs
- **Color Selection**:
  - 9 preset colors for quick access
  - Custom color picker for any color you want
- **Opacity Control**: Adjust stroke transparency for semi-transparent effects

#### 🎯 Smart Interface
- **Transparent Canvas**: Overlays on webpage without interfering with page content
- **Floating Button**: Draggable and repositionable for your convenience
- **Bottom Toolbar**: Modern design with all tools at a glance
- **Background Dimming**: 0-90% adjustable for better drawing visibility
- **Custom Cursor**: Specialized cursor appears when drawing for better precision
- **One-Click Clear**: Quickly erase all content from the canvas

#### ⚙️ Convenient Settings
- **Per-Site Enable**: Enable/disable for different websites independently
- **Persistent Settings**: Settings auto-save per domain and apply on next visit
- **Bilingual Support**: Auto-detects system language, supports English and Chinese
- **Keyboard-Free**: All features accessible through mouse operations

#### 🛡️ Technical Reliability
- **Style Isolation**: Uses Shadow DOM to prevent conflicts with page styles
- **Performance Optimized**: Lightweight design doesn't affect page load or performance
- **Great Compatibility**: Works on all Chromium-based browsers (Chrome, Edge, etc.)

---

###  User Guide

#### Step 1: Enable the Extension
1. Visit the website where you want to use Draft Board
2. Click the "Draft Board" extension icon in your browser toolbar
3. Toggle the switch ON in the popup to enable for current site
4. Close the popup - a floating button will appear in the bottom-right

#### Step 2: Start Drawing
1. Click the floating button in the bottom-right to activate drawing mode
2. The toolbar will appear at the bottom with all drawing tools
3. Select brush or eraser from the toolbar
4. Choose your preferred color (click preset or use color picker)
5. Adjust stroke size and opacity
6. Draw freely on the webpage to capture your ideas

#### Step 3: Adjust Settings
- **Adjust Background Dimming**: Drag the "Dim Background" slider for better visibility
- **Move Floating Button**: Click and drag the button to reposition it
- **Switch Tools**: Toggle between brush and eraser anytime

#### Step 4: Clear or Close
- **Clear Canvas**: Click the trash icon in toolbar to remove all drawings
- **Close Drawing**: Click close button or floating button again to exit drawing mode
- **Disable Extension**: Click extension icon and toggle switch OFF to disable

---

### 💡 Use Cases

- **Online Learning**: Take notes and annotate on video courses and documents
- **Web Presentations**: Draw key points during remote meetings on shared screens
- **Product Design**: Quickly annotate feedback on product prototype pages
- **Creative Brainstorming**: Jot down ideas on inspiration websites
- **Bug Reporting**: Mark problem areas on test pages and screenshot for feedback
- **Teaching Aid**: Circle important points during online teaching for better engagement

---

### ❓ FAQ

**Q: Are drawings saved automatically?**  
A: Currently, drawings are not auto-saved. Content will be cleared when closing drawing mode or refreshing the page. Please screenshot important content.

**Q: Will it interfere with normal webpage usage?**  
A: No. The drawing canvas overlays the page, but doesn't affect webpage operations when drawing mode is closed.

**Q: Which browsers are supported?**  
A: All Chromium-based browsers including Chrome, Edge, Brave, Opera, etc.

**Q: Why doesn't it work on some websites?**  
A: Make sure you've enabled the extension for that website in the popup. If still not working, it may be browser security restrictions (e.g., chrome://extensions/ system pages).

**Q: Can I change the interface language?**  
A: Yes. Click the extension icon, select "Language / 语言" in the popup, and choose English or 中文.

---

### 📝 Open Source License

MIT

---

**Made with ❤️ for creative web browsing**
