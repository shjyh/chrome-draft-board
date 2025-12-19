/**
 * Draft Board - Chrome Extension
 * Injects a floating draft board into the page.
 */

// I18n strings
const I18N = {
    en: {
        draft: "Draft Board",
        settings: "Settings",
        color: "Color",
        size: "Size",
        brushOpacity: "Stroke Opacity",
        bgOpacity: "Dim Background",
        tools: "Tools",
        brush: "Brush",
        eraser: "Eraser",
        clear: "Clear All",
        close: "Close",
    },
    zh: {
        draft: "草稿板",
        settings: "设置",
        color: "颜色",
        size: "笔触粗细",
        brushOpacity: "笔触透明度",
        bgOpacity: "背景暗度",
        tools: "工具",
        brush: "画笔",
        eraser: "橡皮擦",
        clear: "清空画板",
        close: "关闭",
    }
};

class DraftBoardApp {
    constructor() {
        this.root = document.createElement('div');
        this.root.id = 'draft-board-root';
        // Prevent FOUC: Hide host until styles load
        this.root.style.visibility = 'hidden';

        // Create Shadow DOM
        this.shadow = this.root.attachShadow({ mode: 'open' });

        // Load Styles
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = chrome.runtime.getURL('style.css');

        // Show after load
        const show = () => { this.root.style.visibility = 'visible'; };
        style.onload = show;
        style.onerror = show; // Ensure shows even if error
        setTimeout(show, 500); // Safety fallback

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

        // 2. Bottom Toolbar (Replaces SettingsPanel)
        this.toolbar = new BottomToolbar(this);
        this.shadow.appendChild(this.toolbar.element);

        // 3. Floating Button (Top)
        this.floatingButton = new FloatingButton(this);
        this.shadow.appendChild(this.floatingButton.element);
    }

    // State Management
    updateState(updates) {
        this.state = { ...this.state, ...updates };
        this.canvasManager.update(this.state);
        this.toolbar.update(this.state); // Renamed from settingsPanel
        this.floatingButton.update(this.state);

        // Persist Settings (Debounced slightly or just save)
        this.saveSettings();
    }

    saveSettings() {
        const hostname = window.location.hostname;
        const settingsKey = `settings:${hostname}`;
        // Save relevant keys
        const toSave = {
            tool: this.state.tool,
            color: this.state.color,
            size: this.state.size,
            brushOpacity: this.state.brushOpacity,
            bgOpacity: this.state.bgOpacity
        };
        chrome.storage.local.set({ [settingsKey]: toSave });
    }

    toggleCanvas() {
        this.updateState({ isOpen: !this.state.isOpen });
    }

    toggleSettings() {
        // No-op or toggle toolbar? Toolbar is synced with isOpen.
        // We can remove this method if unused.
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
        // No text needed for logo-only button

        this.element.innerHTML = `
            <div class="logo-btn" id="main-logo" title="Draft Board">
                <img src="${logoUrl}" alt="Draft Board" draggable="false">
            </div>
        `;
    }

    update(state) {
        const logo = this.element.querySelector('#main-logo');
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
            if (e.button !== 0) return;
            isDragging = false;

            const rect = this.element.getBoundingClientRect();
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

        const onMouseMove = (e) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                isDragging = true;
                this.element.classList.add('is-dragging');
            }

            this.element.style.left = `${initialLeft + dx}px`;
            this.element.style.top = `${initialTop + dy}px`;
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            if (!isDragging) {
                this.app.toggleCanvas();
            }

            setTimeout(() => {
                this.element.classList.remove('is-dragging');
            }, 50);
        };

        logo.addEventListener('mousedown', onMouseDown);
    }
}

// Replaces SettingsPanel
class BottomToolbar {
    constructor(app) {
        this.app = app;
        this.element = document.createElement('div');
        this.element.className = 'bottom-toolbar';

        // Color Presets
        this.colors = [
            '#000000', // Black
            '#FF3B30', // Red
            '#FF9500', // Orange
            '#FFCC00', // Yellow
            '#4CD964', // Green
            '#5AC8FA', // Blue
            '#007AFF', // Deep Blue
            '#5856D6', // Purple
            '#FFFFFF'  // White
        ];

        // Track current language for re-rendering on change
        this.currentLang = this.app.state.lang;

        this.render();
        this.attachEvents();
    }

    render() {
        const s = this.app.state;
        const t = I18N[s.lang];

        // Generate Color Dots
        const colorHtml = this.colors.map(c => `
            <div class="color-dot ${s.color === c && s.tool !== 'eraser' ? 'active' : ''}" 
                 style="background-color: ${c};" 
                 data-color="${c}"
                 data-tooltip="${c}"></div>
        `).join('');

        // Custom Color Active Check
        const isCustom = !this.colors.includes(s.color) && s.tool !== 'eraser';

        // SVG Icons
        const iconBrush = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
        // More recognizable block eraser
        const iconEraser = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.56-10.6c.78-.79 2.05-.79 2.83 0zM4.22 15.58l3.54 3.53c.78.79 2.05.79 2.83 0L19.78 10 17 7.17 4.22 15.58z"/></svg>`;
        const iconClear = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
        const iconClose = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;

        // Icons for Sliders
        const iconSize = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>`;
        const iconOpacity = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="4" opacity="0.5"/></svg>`;
        const iconBg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 17h10v-2H7v2zm0-4h10v-2H7v2zm0-4h10V7H7v2z"/></svg>`;

        this.element.innerHTML = `
            <!-- Tools -->
            <div class="toolbar-section">
                <button class="icon-btn ${s.tool === 'brush' ? 'active' : ''}" data-tool="brush" data-tooltip="${t.brush}">
                    ${iconBrush}
                </button>
                <button class="icon-btn ${s.tool === 'eraser' ? 'active' : ''}" data-tool="eraser" data-tooltip="${t.eraser}">
                    ${iconEraser}
                </button>
            </div>

            <!-- Colors -->
            <div class="toolbar-section">
                <div class="color-presets">
                    ${colorHtml}
                    <!-- Custom -->
                    <div class="custom-color-wrapper ${isCustom ? 'active' : ''}" data-tooltip="${t.color}">
                        <input type="color" class="color-input" value="${isCustom ? s.color : '#ff0000'}">
                    </div>
                </div>
            </div>

            <!-- Vertical Sliders -->
            <div class="toolbar-section">
                <!-- Size -->
                <div class="slider-btn-group">
                    <div class="slider-popup" id="popup-size">
                        <input type="range" class="slider-vertical" id="size-slider" min="1" max="50" value="${s.size}">
                    </div>
                    <button class="slider-btn" data-popup="popup-size" data-tooltip="${t.size}">
                        ${iconSize}
                        <span class="value-text" id="val-size">${s.size}</span>
                    </button>
                </div>

                <!-- Brush Opacity -->
                <div class="slider-btn-group">
                    <div class="slider-popup" id="popup-opacity">
                         <input type="range" class="slider-vertical" id="brush-opacity-slider" min="0.01" max="1" step="0.01" value="${s.brushOpacity}">
                    </div>
                    <button class="slider-btn" data-popup="popup-opacity" data-tooltip="${t.brushOpacity}">
                        ${iconOpacity}
                        <span class="value-text" id="val-opacity">${Math.round(s.brushOpacity * 100)}%</span>
                    </button>
                </div>

                <!-- Bg Opacity -->
                <div class="slider-btn-group">
                    <div class="slider-popup" id="popup-bg">
                         <input type="range" class="slider-vertical" id="bg-opacity-slider" min="0" max="0.9" step="0.01" value="${s.bgOpacity}">
                    </div>
                    <button class="slider-btn" data-popup="popup-bg" data-tooltip="${t.bgOpacity}">
                        ${iconBg}
                        <span class="value-text" id="val-bg">${Math.round(s.bgOpacity * 100)}%</span>
                    </button>
                </div>
            </div>

             <!-- Actions -->
            <div class="toolbar-section">
                 <button class="icon-btn" id="btn-clear" data-tooltip="${t.clear}">
                    ${iconClear}
                </button>
                <div style="width:1px;"></div>
                 <button class="icon-btn" id="btn-hide" data-tooltip="${t.close}">
                    ${iconClose}
                </button>
            </div>
        `;
    }

    update(state) {
        // Check if language changed - if so, re-render entire toolbar
        // Note: No need to re-attach events since we use event delegation
        if (this.currentLang !== state.lang) {
            this.currentLang = state.lang;
            this.render();
        }

        if (state.isOpen) {
            this.element.classList.add('visible');
        } else {
            this.element.classList.remove('visible');
            // Close all popups when hidden
            this.element.querySelectorAll('.slider-popup.active').forEach(p => p.classList.remove('active'));
        }

        const t = I18N[state.lang];

        // 1. Update Tool Buttons
        this.element.querySelectorAll('[data-tool]').forEach(btn => {
            if (btn.dataset.tool === state.tool) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // 2. Update Colors
        this.element.querySelectorAll('.color-dot').forEach(dot => {
            const c = dot.dataset.color;
            if (c === state.color && state.tool !== 'eraser') dot.classList.add('active');
            else dot.classList.remove('active');
        });

        const isCustom = !this.colors.includes(state.color) && state.tool !== 'eraser';
        const customWrapper = this.element.querySelector('.custom-color-wrapper');

        if (isCustom) {
            customWrapper.classList.add('active');
            // Use selected color for border using CSS variable or style
            customWrapper.style.setProperty('--active-color', state.color);
            this.element.querySelector('.color-input').value = state.color;
        } else {
            customWrapper.classList.remove('active');
            customWrapper.style.removeProperty('--active-color');
        }

        // 3. Update Slider Values (Text on buttons) and Inputs
        // Size
        const sizeInput = this.element.querySelector('#size-slider');
        const sizeVal = this.element.querySelector('#val-size');
        sizeVal.textContent = state.size;
        if (document.activeElement !== sizeInput) sizeInput.value = state.size;

        // Opacity
        const opacityInput = this.element.querySelector('#brush-opacity-slider');
        const opacityVal = this.element.querySelector('#val-opacity');
        opacityVal.textContent = Math.round(state.brushOpacity * 100) + '%';
        if (document.activeElement !== opacityInput) opacityInput.value = state.brushOpacity;

        // Bg Opacity
        const bgInput = this.element.querySelector('#bg-opacity-slider');
        const bgVal = this.element.querySelector('#val-bg');
        bgVal.textContent = Math.round(state.bgOpacity * 100) + '%';
        if (document.activeElement !== bgInput) bgInput.value = state.bgOpacity;
    }

    attachEvents() {
        // Delegation
        this.element.addEventListener('click', (e) => {
            const target = e.target.closest('button, .color-dot');
            if (!target) {
                // Check if clicking outside slider popups to close them
                if (!e.target.closest('.slider-popup') && !e.target.closest('.slider-btn')) {
                    this.element.querySelectorAll('.slider-popup.active').forEach(p => p.classList.remove('active'));
                }
                return;
            }

            if (target.matches('[data-tool]')) {
                this.app.updateState({ tool: target.dataset.tool });
            }
            if (target.matches('.color-dot')) {
                this.app.updateState({
                    color: target.dataset.color,
                    tool: 'brush'
                });
            }
            if (target.id === 'btn-clear') {
                this.app.canvasManager.clear();
            }
            if (target.id === 'btn-hide') {
                this.app.toggleCanvas();
            }
            // Toggle Sliders
            if (target.matches('.slider-btn')) {
                const popupId = target.dataset.popup;
                const popup = this.element.querySelector(`#${popupId}`);

                // Close others
                this.element.querySelectorAll('.slider-popup').forEach(p => {
                    if (p !== popup) p.classList.remove('active');
                });

                popup.classList.toggle('active');
            }
        });

        // Close sliders when clicking anywhere in window?
        // We can't easily listen to window click from inside shadow DOM for "outside" click perfectly 
        // without event propagation. But we can listen on the shadow host or document.
        // For now, toolbar click handler handles "not on button" clicks. 
        // Ideally we need a global listener.
        // Let's add a document listener for outside clicks.

        const closePopups = (e) => {
            // If click is NOT inside toolbar
            // Note: e.target might be in Shadow DOM or Light DOM.
            // If we are in shadow DOM, we need to check composedPath.
            const path = e.composedPath();
            if (!path.includes(this.element)) {
                this.element.querySelectorAll('.slider-popup.active').forEach(p => p.classList.remove('active'));
            }
        };
        window.addEventListener('click', closePopups);
        // Note: this listener will persist. Ideally remove on destroy.

        this.element.addEventListener('input', (e) => {
            if (e.target.matches('.color-input')) {
                this.app.updateState({
                    color: e.target.value,
                    tool: 'brush'
                });
            }
            if (e.target.id === 'size-slider') {
                this.app.updateState({ size: parseInt(e.target.value) });
            }
            if (e.target.id === 'brush-opacity-slider') {
                this.app.updateState({ brushOpacity: parseFloat(e.target.value) });
            }
            if (e.target.id === 'bg-opacity-slider') {
                this.app.updateState({ bgOpacity: parseFloat(e.target.value) });
            }
        });
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

        // Load settings
        const hostname = window.location.hostname;
        const settingsKey = `settings:${hostname}`;

        chrome.storage.local.get([settingsKey], (result) => {
            const saved = result[settingsKey];
            const updates = {};
            if (initialLang) updates.lang = initialLang;
            if (saved) {
                Object.assign(updates, saved);
            }
            if (Object.keys(updates).length > 0) {
                appInstance.updateState(updates);
            }
        });
    } else {
        // Restore updates if instance exists (e.g. re-enable)
        if (initialLang) appInstance.updateState({ lang: initialLang });
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
