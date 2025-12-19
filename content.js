/**
 * Draft Board - Chrome Extension
 * Injects a floating draft board into the page.
 */

// I18n strings
const I18N = {
    en: {
        draft: "Draft",
        settings: "Settings",
        color: "Color",
        size: "Size",
        brushOpacity: "Brush Opacity",
        bgOpacity: "Background Dimming",
        tools: "Tools",
        brush: "Brush",
        eraser: "Eraser",
        clear: "Clear All",
        close: "Close",
    },
    zh: {
        draft: "草稿",
        settings: "设置",
        color: "颜色",
        size: "粗细",
        brushOpacity: "画笔透明度",
        bgOpacity: "背景暗度",
        tools: "工具",
        brush: "画笔",
        eraser: "橡皮",
        clear: "清空",
        close: "关闭",
    }
};

class DraftBoardApp {
    constructor() {
        this.root = document.createElement('div');
        this.root.id = 'draft-board-root';
        // Create Shadow DOM
        this.shadow = this.root.attachShadow({ mode: 'open' });

        // Critical styles to prevent FOUC (Flash of Unstyled Content)
        const criticalStyle = document.createElement('style');
        criticalStyle.textContent = `
        .menu-items, .settings-panel { opacity: 0; pointer-events: none; }
        .menu-items { transform: translateY(20px); }
        .settings-panel { transform: translateX(20px) scale(0.95); }
    `;
        this.shadow.appendChild(criticalStyle);

        // Load Styles
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = chrome.runtime.getURL('style.css');
        this.shadow.appendChild(style);

        // Initial State
        this.state = {
            isOpen: false,
            isDrawing: false,
            tool: 'brush', // brush | eraser
            color: '#FF3CAC',
            size: 5,
            brushOpacity: 1,
            bgOpacity: 0.3, // Default 30% black mask
            lang: 'en' // Default to English, will detect browser lang
        };

        // Detect language
        const navLang = navigator.language || navigator.userLanguage;
        if (navLang.startsWith('zh')) {
            this.state.lang = 'zh';
        }

        document.body.appendChild(this.root);

        this.initComponents();
    }

    initComponents() {
        // 1. Canvas Layer (Bottom)
        this.canvasManager = new CanvasManager(this);
        this.shadow.appendChild(this.canvasManager.element);

        // 2. Settings Panel
        this.settingsPanel = new SettingsPanel(this);
        this.shadow.appendChild(this.settingsPanel.element);

        // 3. Floating Button (Top)
        this.floatingButton = new FloatingButton(this);
        this.shadow.appendChild(this.floatingButton.element);
    }

    // State Management
    updateState(updates) {
        this.state = { ...this.state, ...updates };
        this.canvasManager.update(this.state);
        this.settingsPanel.update(this.state);
        this.floatingButton.update(this.state);
    }

    toggleCanvas() {
        this.updateState({ isOpen: !this.state.isOpen });
    }

    toggleSettings() {
        this.settingsPanel.toggle();
    }

    destroy() {
        if (this.root && this.root.parentNode) {
            this.root.parentNode.removeChild(this.root);
        }
    }
}

class FloatingButton {
    constructor(app) {
        this.app = app;
        this.element = document.createElement('div');
        this.element.className = 'floating-container';

        this.render();
        this.attachEvents();
    }

    render() {
        const logoUrl = chrome.runtime.getURL('logo.svg');
        const t = I18N[this.app.state.lang];

        this.element.innerHTML = `
            <div class="logo-btn" id="main-logo" title="Draft Board">
                <img src="${logoUrl}" alt="Draft Board" draggable="false">
            </div>
            <div class="menu-items">
                <button class="menu-item" id="btn-settings" data-tooltip="${t.settings}">
                    ⚙️
                </button>
                <button class="menu-item" id="btn-draft" data-tooltip="${t.draft}">
                    ✏️
                </button>
            </div>
        `;
    }

    update(state) {
        // Re-render text if lang changes
        const t = I18N[state.lang];
        const btnSettings = this.element.querySelector('#btn-settings');
        const btnDraft = this.element.querySelector('#btn-draft');
        const logo = this.element.querySelector('#main-logo');

        if (btnSettings) btnSettings.setAttribute('data-tooltip', t.settings);
        if (btnDraft) {
            btnDraft.setAttribute('data-tooltip', state.isOpen ? t.close : t.draft);
            // Toggle Icon
            btnDraft.textContent = state.isOpen ? '✖️' : '✏️';
        }

        // Toggle Logo Active State
        if (logo) {
            if (state.isOpen) {
                logo.classList.add('active-state');
            } else {
                logo.classList.remove('active-state');
            }
        }
    }

    attachEvents() {
        const logo = this.element.querySelector('#main-logo');

        // Draggable Logic
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const onMouseDown = (e) => {
            // Only allow left click drag
            if (e.button !== 0) return;
            isDragging = false; // Reset, assume click until moved

            // Get current position
            const rect = this.element.getBoundingClientRect();
            // We use right/bottom in CSS, but for dragging it's easier to switch to fixed left/top or calculate offsets
            // Let's stick to modifying transforming or left/top.

            // NOTE: Interaction with CSS 'right' property:
            // When we start dragging, we should "lock" the element to left/top to avoid resize issues
            // But simplify: just update transform? No, that limits range.
            // Let's set left/top explicitly and clear right/bottom.

            this.element.style.right = 'auto';
            this.element.style.bottom = 'auto';
            this.element.style.left = rect.left + 'px';
            this.element.style.top = rect.top + 'px';

            initialLeft = rect.left;
            initialTop = rect.top;
            startX = e.clientX;
            startY = e.clientY;

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        };

        const checkPosition = () => {
            const rect = this.element.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const windowHeight = window.innerHeight;

            if (centerY < windowHeight / 2) {
                this.element.classList.add('pos-top');
            } else {
                this.element.classList.remove('pos-top');
            }
        };

        const onMouseMove = (e) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                isDragging = true;
                this.element.classList.add('is-dragging');
            }

            this.element.style.left = `${initialLeft + dx}px`;
            this.element.style.top = `${initialTop + dy}px`;

            checkPosition();
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            this.element.classList.remove('is-dragging');
            checkPosition(); // Ensure final state is correct
        };

        const onResize = () => {
            checkPosition();
        };
        window.addEventListener('resize', onResize);

        logo.addEventListener('mousedown', onMouseDown);

        // Menu Actions
        this.element.querySelector('#btn-draft').addEventListener('click', (e) => {
            e.stopPropagation();
            this.app.toggleCanvas();
        });

        this.element.querySelector('#btn-settings').addEventListener('click', (e) => {
            e.stopPropagation();
            this.app.toggleSettings();
        });
    }
}

class SettingsPanel {
    constructor(app) {
        this.app = app;
        this.isOpen = false;
        this.element = document.createElement('div');
        this.element.className = 'settings-panel';
        this.render();
        this.attachEvents();
    }

    render() {
        const s = this.app.state;
        const t = I18N[s.lang];

        this.element.innerHTML = `
            <div class="panel-header">
                <span>${t.settings}</span>
                <button class="close-btn">×</button>
            </div>
            
            <div class="setting-row">
                <span class="setting-label" id="label-tools">${t.tools}</span>
                <div class="tool-selector">
                    <button class="tool-btn ${s.tool === 'brush' ? 'active' : ''}" data-tool="brush">${t.brush}</button>
                    <button class="tool-btn ${s.tool === 'eraser' ? 'active' : ''}" data-tool="eraser">${t.eraser}</button>
                </div>
            </div>

            <div class="setting-row">
                <span class="setting-label" id="label-color">${t.color}</span>
                <div class="color-preview" style="background-color: ${s.color}">
                    <input type="color" class="color-input" value="${s.color}">
                </div>
            </div>

            <div class="setting-row">
               <span class="setting-label" id="label-size">${t.size} (${s.size}px)</span>
            </div>
            <input type="range" class="slider" id="size-slider" min="1" max="50" value="${s.size}">

            <div class="setting-row">
               <span class="setting-label" id="label-brush-opacity">${t.brushOpacity} (${Math.round(s.brushOpacity * 100)}%)</span>
            </div>
            <input type="range" class="slider" id="brush-opacity-slider" min="0.01" max="1" step="0.01" value="${s.brushOpacity}">

            <div class="setting-row">
               <span class="setting-label" id="label-bg-opacity">${t.bgOpacity} (${Math.round(s.bgOpacity * 100)}%)</span>
            </div>
            <input type="range" class="slider" id="bg-opacity-slider" min="0" max="0.9" step="0.01" value="${s.bgOpacity}">

            <div class="setting-row" style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                <button class="tool-btn" id="btn-clear" style="color: red; width: 100%;">${t.clear}</button>
            </div>
        `;
    }

    update(state) {
        // Re-render completely for simplicity to handle lang changes and active states
        // In a framework we would diff, here we just rewrite innerHTML is easiest for this scale, 
        // but it breaks event listeners. Better to update DOM nodes individually.

        const t = I18N[state.lang];

        // Update texts
        this.element.querySelector('.panel-header span').textContent = t.settings;
        this.element.querySelector('#label-tools').textContent = t.tools;
        this.element.querySelector('#label-color').textContent = t.color;

        this.element.querySelectorAll('.tool-btn[data-tool="brush"]').forEach(b => {
            b.textContent = t.brush;
            b.className = `tool-btn ${state.tool === 'brush' ? 'active' : ''}`;
        });
        this.element.querySelectorAll('.tool-btn[data-tool="eraser"]').forEach(b => {
            b.textContent = t.eraser;
            b.className = `tool-btn ${state.tool === 'eraser' ? 'active' : ''}`;
        });

        // Update Color
        this.element.querySelector('.color-preview').style.backgroundColor = state.color;
        this.element.querySelector('.color-input').value = state.color;

        // Update Labels
        this.element.querySelector('#label-size').textContent = `${t.size} (${state.size}px)`;
        this.element.querySelector('#label-brush-opacity').textContent = `${t.brushOpacity} (${Math.round(state.brushOpacity * 100)}%)`;
        this.element.querySelector('#label-bg-opacity').textContent = `${t.bgOpacity} (${Math.round(state.bgOpacity * 100)}%)`;

        // Update Sliders
        this.element.querySelector('#size-slider').value = state.size;
        this.element.querySelector('#brush-opacity-slider').value = state.brushOpacity;
        this.element.querySelector('#bg-opacity-slider').value = state.bgOpacity;

        // Update Clear Btn
        this.element.querySelector('#btn-clear').textContent = t.clear;
    }

    attachEvents() {
        // We need to use event delegation because render() might replace nodes 
        // OR we just attach once and in update() we DONT replace the structure if possible.
        // Actually, my render() overwrites everything. That's bad for attached events.
        // Let's separate initial render structure vs update content.
        // REFACTOR: The constructor calls render(). 
        // I'll make the header events delegation on the main element.

        this.element.addEventListener('click', (e) => {
            const target = e.target;

            if (target.matches('.close-btn')) {
                this.toggle();
            }
            if (target.matches('.tool-btn[data-tool]')) {
                this.app.updateState({ tool: target.dataset.tool });
            }
            if (target.matches('#btn-clear')) {
                this.app.canvasManager.clear();
            }
        });

        this.element.addEventListener('input', (e) => {
            const target = e.target;
            if (target.matches('.color-input')) {
                this.app.updateState({ color: target.value, tool: 'brush' }); // Auto switch to brush on color pick
            }
            if (target.id === 'size-slider') {
                this.app.updateState({ size: parseInt(target.value) });
            }
            if (target.id === 'brush-opacity-slider') {
                this.app.updateState({ brushOpacity: parseFloat(target.value) });
            }
            if (target.id === 'bg-opacity-slider') {
                this.app.updateState({ bgOpacity: parseFloat(target.value) });
            }
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.element.classList.add('open');
            this.update(this.app.state); // Refresh state on open
        } else {
            this.element.classList.remove('open');
        }
    }
}

class CanvasManager {
    constructor(app) {
        this.app = app;
        this.element = document.createElement('div');
        this.element.className = 'draft-canvas-container';

        // Main Canvas (Persisted Content)
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'draft-canvas';
        this.element.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Temp Canvas (Current Stroke)
        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.className = 'draft-canvas';
        this.tempCanvas.style.position = 'absolute';
        this.tempCanvas.style.top = '0';
        this.tempCanvas.style.left = '0';
        this.element.appendChild(this.tempCanvas);
        this.tempCtx = this.tempCanvas.getContext('2d');

        // Cursor follower
        this.cursor = document.createElement('div');
        this.cursor.className = 'cursor-follower';
        this.element.appendChild(this.cursor);

        this.attachEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Calculate required size
        const width = Math.max(document.documentElement.scrollWidth, window.innerWidth);
        const height = Math.max(document.documentElement.scrollHeight, window.innerHeight);

        // Check if resize is actually needed
        if (this.canvas.width === width && this.canvas.height === height) {
            return;
        }

        // Save current content of MAIN canvas
        const backupCanvas = document.createElement('canvas');
        backupCanvas.width = this.canvas.width;
        backupCanvas.height = this.canvas.height;
        const backupCtx = backupCanvas.getContext('2d');
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            backupCtx.drawImage(this.canvas, 0, 0);
        }

        // Resize Both
        this.canvas.width = width;
        this.canvas.height = height;
        this.tempCanvas.width = width;
        this.tempCanvas.height = height;

        // Restore content to MAIN
        this.ctx.drawImage(backupCanvas, 0, 0);

        // Position container
        this.element.style.position = 'absolute';
        this.element.style.width = width + 'px';
        this.element.style.height = height + 'px';
    }

    update(state) {
        if (state.isOpen) {
            this.element.classList.add('active');
            // Background Mask Opacity
            this.element.style.backgroundColor = `rgba(0, 0, 0, ${state.bgOpacity})`;

            // Update cursor style
            this.updateCursor(state);
            // Re-check size in case page grew
            this.resize();
        } else {
            this.element.classList.remove('active');
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    }

    updateCursor(state) {
        if (state.tool === 'eraser') {
            this.cursor.style.width = this.cursor.style.height = (state.size * 2) + 'px';
            this.cursor.style.borderColor = '#000';
            this.cursor.style.backgroundColor = 'rgba(255,255,255,0.5)';
        } else {
            this.cursor.style.width = this.cursor.style.height = state.size + 'px';
            this.cursor.style.borderColor = state.color;
            this.cursor.style.backgroundColor = 'transparent';
        }
    }

    attachEvents() {
        let isDown = false;
        let points = [];

        // Attach events to tempCanvas (it's on top)
        const targetElement = this.tempCanvas;

        const getPoint = (e) => {
            const rect = targetElement.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                pressure: e.pressure || 0.5
            };
        };

        const renderCurrentStroke = () => {
            // Clear temp layer
            this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);

            if (points.length < 1) return;

            const s = this.app.state;
            this.tempCtx.beginPath();
            this.tempCtx.lineCap = 'round';
            this.tempCtx.lineJoin = 'round';
            this.tempCtx.lineWidth = s.tool === 'eraser' ? s.size * 2 : s.size;

            // Handle Opacity / Composite on Temp
            // Note: We are drawing the WHOLE stroke on active frame.
            // Self-overlap is naturally handled by one path fill/stroke.

            if (s.tool === 'eraser') {
                // For eraser on temp layout, we just show "white" or "clear"?
                // Actually, to show eraser PREVIEW, we might want to draw white on temp?
                // But normally eraser erases MAIN canvas.
                // We CANNOT erase main canvas from temp canvas easily in real-time without modifying main.
                // So for Eraser, we might have to modify Main directly?
                // OR: Composite Temp onto Main with 'destination-out' every frame? (Destructive if we don't restore)

                // Simplified: For Eraser, Direct Drawing to Main is actually fine/better because "Opacity" usually doesn't apply to eraser in this simple app (it's full delete).
                // Or if user wants partial eraser?
                // Logic: If Eraser, draw directly to main?
                // Let's stick to Direct Draw for Eraser, but continuous path for Brush.

                // Wait, if I use direct draw for Eraser, I get dots?
                // Yes. But eraser usually doesn't have "alpha" artifacts visible if it's 100% erase.
                // If I want smooth eraser:
                // Draw path on temp, then 'destination-out' temp onto main?

                // Let's implement brush (Color) on Temp, Eraser on Main (for now, simpler).
            } else {
                this.tempCtx.strokeStyle = s.color;
                this.tempCtx.globalAlpha = s.brushOpacity;
                this.tempCtx.globalCompositeOperation = 'source-over';
            }

            if (points.length < 2) {
                // Dot
                this.tempCtx.arc(points[0].x, points[0].y, this.app.state.size / 2, 0, Math.PI * 2);
                this.tempCtx.fillStyle = s.color;
                this.tempCtx.fill();
            } else {
                // Smooth Path
                this.tempCtx.beginPath();
                this.tempCtx.moveTo(points[0].x, points[0].y);

                // Simple line connection or quadratic?
                // Simple is fine for now, we just want to avoid DOTS.
                for (let i = 1; i < points.length; i++) {
                    this.tempCtx.lineTo(points[i].x, points[i].y);
                }
                this.tempCtx.stroke();
            }
        };

        const commitStroke = () => {
            // Draw Temp to Main
            this.ctx.globalAlpha = 1; // We baked alpha into temp
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.drawImage(this.tempCanvas, 0, 0);

            // Clear Temp
            this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        };

        const drawDirectEraser = () => {
            // Legacy direct draw for eraser to support clearing
            if (points.length < 2) return;
            const p1 = points[points.length - 2];
            const p2 = points[points.length - 1];

            this.ctx.beginPath();
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = this.app.state.size * 2;
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.globalAlpha = 1;
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
        };

        targetElement.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            isDown = true;
            targetElement.setPointerCapture(e.pointerId);
            points = [getPoint(e)];

            if (this.app.state.tool === 'eraser') {
                // Dot Erase
                this.ctx.beginPath();
                this.ctx.arc(points[0].x, points[0].y, this.app.state.size, 0, Math.PI * 2); // Eraser size bigger
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.fillStyle = 'rgba(0,0,0,1)';
                this.ctx.fill();
            } else {
                renderCurrentStroke();
            }
        });

        targetElement.addEventListener('pointermove', (e) => {
            // Update custom cursor position
            this.cursor.style.display = 'block';
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';

            if (!isDown) return;

            const newPoint = getPoint(e);
            // Optimization: ignore too close points?
            // if (points.length > 0 && Math.hypot(newPoint.x - points[points.length-1].x, newPoint.y - points[points.length-1].y) < 2) return;

            points.push(newPoint);

            if (this.app.state.tool === 'eraser') {
                drawDirectEraser();
            } else {
                renderCurrentStroke();
            }
        });

        targetElement.addEventListener('pointerup', (e) => {
            if (!isDown) return;
            isDown = false;
            targetElement.releasePointerCapture(e.pointerId);

            if (this.app.state.tool !== 'eraser') {
                commitStroke();
            }
            points = [];
        });

        targetElement.addEventListener('pointerout', () => {
            this.cursor.style.display = 'none';
        });
    }
}

// Initialization Logic
let appInstance = null;

function initApp(initialLang) {
    if (!appInstance) {
        appInstance = new DraftBoardApp();
        if (initialLang) {
            appInstance.updateState({ lang: initialLang });
        }
    }
}

function destroyApp() {
    if (appInstance) {
        appInstance.destroy();
        appInstance = null;
    }
}

// 1. Check Storage on Load
const hostname = window.location.hostname;
const storageKey = `site:${hostname}`;

chrome.storage.local.get([storageKey, 'appLanguage'], (result) => {
    // Check enablement
    if (result[storageKey] === true) {
        initApp(result.appLanguage);
    }
});

// 2. Listen for Messages (Popup toggle)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle_extension') {
        if (request.enabled) {
            // Get lang again or pass it? Popup didn't pass it.
            // We can just init, and let it use default or fetch.
            // Better: just fetch storage in init if not passed?
            // Actually simple: `initApp` can fetch storage itself inside if needed, or we just rely on defaults if immediate sync isn't critical (it will sync on storage change).
            // But let's be cleaner.
            chrome.storage.local.get(['appLanguage'], (res) => {
                initApp(res.appLanguage);
            });
        } else {
            destroyApp();
        }
    }
});

// 3. Listen for Storage Changes (Global Lang)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.appLanguage) {
        if (appInstance) {
            appInstance.updateState({ lang: changes.appLanguage.newValue });
        }
    }
});
