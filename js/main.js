/**
 * Main Application - Orchestrates all components and handles initialization
 */
import { PatternRenderer } from './pattern-renderer.js';
import { FillManager } from './fill-manager.js';

class CloverQuiltApp {
    constructor() {
        this.isInitialized = false;
        this.components = {};
        this.elements = {};
        this.state = {
            totalShapes: 0,
            filledShapes: 0,
            currentFill: null,
            isLoading: false
        };
        
        this.initialize();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            this.cacheElements();
            await this.setupComponents();
            await this.loadPattern();
            this.setupEventListeners();
            this.updateUI();
            
            this.isInitialized = true;
            this.updateStatus('Ready to design');
            console.log('Clover Quilt Designer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Pattern container
            patternWrapper: document.getElementById('patternWrapper'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            
            // Fill controls
            colorPalette: document.getElementById('colorPalette'),
            patternGallery: document.getElementById('patternGallery'),
            colorSection: document.getElementById('colorSection'),
            patternSection: document.getElementById('patternSection'),
            colorModeBtn: document.getElementById('colorModeBtn'),
            patternModeBtn: document.getElementById('patternModeBtn'),
            colorPickerBtn: document.getElementById('colorPickerBtn'),
            hiddenColorPicker: document.getElementById('hiddenColorPicker'),
            uploadPatternBtn: document.getElementById('uploadPatternBtn'),
            hiddenFileInput: document.getElementById('hiddenFileInput'),
            clearPatternsBtn: document.getElementById('clearPatternsBtn'),
            zoomSlider: document.getElementById('zoomSlider'),
            
            // Stroke controls
            strokeColorPicker: document.getElementById('strokeColorPicker'),
            canvasColorPicker: document.getElementById('canvasColorPicker'),
            
            // Action buttons
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            resetBtn: document.getElementById('resetBtn'),
            exportBtn: document.getElementById('exportBtn'),
            
            // Status
            statusText: document.getElementById('statusText'),
            shapeCount: document.getElementById('shapeCount'),
            
            // Export canvas
            exportCanvas: document.getElementById('exportCanvas'),
            
            // Fullscreen elements
            fullscreenOverlay: document.getElementById('fullscreenOverlay'),
            fullscreenSvgContainer: document.getElementById('fullscreenSvgContainer'),
            exitFullscreenBtn: document.getElementById('exitFullscreenBtn')
        };



        // Validate required elements
        const requiredElements = ['patternWrapper', 'colorPalette', 'loadingIndicator'];
        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                throw new Error(`Required element not found: ${elementName}`);
            }
        }
    }

    /**
     * Setup component instances
     */
    async setupComponents() {
        // Initialize PatternRenderer
        this.components.patternRenderer = new PatternRenderer(this.elements.patternWrapper, {
            hoverEffects: true
        });

        // Setup shape click handler
        this.components.patternRenderer.onShapeClick((pathId, currentColor, event) => {
            this.handleShapeClick(pathId, currentColor, event);
        });

        // Initialize FillManager
        const fillContainers = {
            colorPalette: this.elements.colorPalette,
            patternGallery: this.elements.patternGallery,
            colorSection: this.elements.colorSection,
            patternSection: this.elements.patternSection,
            colorModeBtn: this.elements.colorModeBtn,
            patternModeBtn: this.elements.patternModeBtn,
            colorPickerBtn: this.elements.colorPickerBtn,
            hiddenColorPicker: this.elements.hiddenColorPicker,
            uploadPatternBtn: this.elements.uploadPatternBtn,
            hiddenFileInput: this.elements.hiddenFileInput,
            clearPatternsBtn: this.elements.clearPatternsBtn,
            zoomSlider: this.elements.zoomSlider
        };

        this.components.fillManager = new FillManager(fillContainers, {
            onFillChange: (fill) => this.handleFillChange(fill),
            onModeChange: (mode) => this.handleModeChange(mode),
            onTileSizeChange: (tileSize) => this.handleTileSizeChange(tileSize)
        });

        // Wait for default patterns to load if needed
        await this.components.fillManager.waitForInitialization();

        // Set up pattern data callback for renderer
        this.components.patternRenderer.setPatternDataCallback((patternId) => {
            return this.components.fillManager.getPattern(patternId);
        });

        // Set up tile size callback for renderer
        this.components.patternRenderer.setTileSizeCallback(() => {
            return this.components.fillManager.getCurrentTileSize();
        });

        // Set initial fill
        this.state.currentFill = this.components.fillManager.getCurrentFill();
        
        // Load and set initial stroke color
        this.loadStrokeColor();
        
        // Load and set initial canvas color
        this.loadCanvasColor();
    }

    /**
     * Load the SVG pattern
     */
    async loadPattern() {
        this.showLoading(true);
        this.updateStatus('Loading pattern...');
        
        try {
            const shapeCount = await this.components.patternRenderer.loadPattern('./Clover-Quilt-Outline.svg');
            this.state.totalShapes = shapeCount;
            
            // Apply saved colors after SVG loads
            const savedStrokeColor = localStorage.getItem('clover-quilt-stroke-color') || '#000000';
            const savedCanvasColor = localStorage.getItem('clover-quilt-canvas-color') || '#FFFFFF';
            
            // Force a slight delay to ensure SVG is fully rendered
            setTimeout(() => {
                this.components.patternRenderer.updateStrokeColor(savedStrokeColor);
                this.components.patternRenderer.updateCanvasColor(savedCanvasColor);
            }, 100);
            
            if (this.elements.strokeColorPicker) {
                this.elements.strokeColorPicker.value = savedStrokeColor;
            }
            if (this.elements.canvasColorPicker) {
                this.elements.canvasColorPicker.value = savedCanvasColor;
            }
            
            this.updateStatus('Pattern loaded successfully');
        } catch (error) {
            console.error('Pattern loading failed:', error);
            this.updateStatus('Failed to load pattern');
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        this.state.isLoading = show;
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Reset button
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.handleReset());
        }

        // Export button
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.handleExport());
        }

        // Stroke color picker
        if (this.elements.strokeColorPicker) {
            this.elements.strokeColorPicker.addEventListener('change', (event) => {
                this.handleStrokeColorChange(event.target.value);
            });
        }

        // Canvas color picker
        if (this.elements.canvasColorPicker) {
            this.elements.canvasColorPicker.addEventListener('change', (event) => {
                this.handleCanvasColorChange(event.target.value);
            });
        }

        // Fullscreen button
        if (this.elements.fullscreenBtn) {
            this.elements.fullscreenBtn.addEventListener('click', () => this.handleFullscreen());
        }

        // Exit fullscreen button
        if (this.elements.exitFullscreenBtn) {
            this.elements.exitFullscreenBtn.addEventListener('click', () => this.exitFullscreen());
        }

        // ESC key to exit fullscreen
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isFullscreenActive()) {
                this.exitFullscreen();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => this.handleKeyboardShortcut(event));

        // Window resize for responsive design
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Handle shape click
     */
    handleShapeClick(pathId, currentColor, event) {
        if (!this.isInitialized || this.state.isLoading) return;
        
        const currentFill = this.state.currentFill;
        if (!currentFill) return;
        
        const previousFill = this.components.patternRenderer.fillShape(pathId, currentFill);
        
        if (previousFill !== false) {
            // Update filled shapes count
            this.state.filledShapes = this.components.patternRenderer.getFilledShapesCount();
            this.updateUI();
            
            const fillDescription = currentFill.type === 'color' ? 
                `color ${currentFill.value}` : 
                `pattern`;
            this.updateStatus(`Filled shape with ${fillDescription}`);
        }
    }

    /**
     * Handle fill change
     */
    handleFillChange(fill) {
        this.state.currentFill = fill;
        if (fill) {
            const fillDescription = fill.type === 'color' ? 
                `color ${fill.value}` : 
                `pattern`;
            this.updateStatus(`Selected ${fillDescription}`);
        }
    }

    /**
     * Handle mode change
     */
    handleModeChange(mode) {
        this.updateStatus(`Switched to ${mode} mode`);
    }

    /**
     * Handle tile size change
     */
    handleTileSizeChange(tileSize) {
        this.components.patternRenderer.updateAllPatternSizes(tileSize);
        this.updateStatus(`Pattern tile size: ${tileSize}px`);
    }

    /**
     * Handle stroke color change
     */
    handleStrokeColorChange(color) {
        if (!this.isInitialized) return;
        
        this.components.patternRenderer.updateStrokeColor(color);
        this.saveStrokeColor(color);
        this.updateStatus(`Outline color changed to ${color}`);
    }

    /**
     * Handle canvas color change
     */
    handleCanvasColorChange(color) {
        if (!this.isInitialized) return;
        
        this.components.patternRenderer.updateCanvasColor(color);
        this.saveCanvasColor(color);
        this.updateStatus(`Canvas color changed to ${color}`);
    }



    /**
     * Handle reset button
     */
    handleReset() {
        if (!this.isInitialized) return;
        
        if (confirm('Are you sure you want to clear all colors? This cannot be undone.')) {
            this.components.patternRenderer.resetAllShapes();
            this.state.filledShapes = 0;
            this.updateUI();
            this.updateStatus('Pattern reset to original colors');
        }
    }

    /**
     * Handle export button - Export SVG as PNG
     */
    async handleExport() {
        if (!this.isInitialized || !this.components.patternRenderer.isPatternLoaded()) {
            this.updateStatus('No pattern loaded to export');
            return;
        }
        
        try {
            this.updateStatus('Preparing export...');
            
            const svgElement = this.components.patternRenderer.getSVGElement();
            if (!svgElement) {
                throw new Error('SVG element not found');
            }
            
            // Clone the SVG to avoid modifying the original
            const svgClone = svgElement.cloneNode(true);
            
            // Get the viewBox or calculate dimensions
            const viewBox = svgClone.getAttribute('viewBox');
            let width, height;
            
            if (viewBox) {
                const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
                width = vbWidth;
                height = vbHeight;
            } else {
                // Fallback to computed dimensions
                const bbox = svgElement.getBBox();
                width = bbox.width;
                height = bbox.height;
            }
            
            // Set explicit dimensions for export
            svgClone.setAttribute('width', width);
            svgClone.setAttribute('height', height);
            
            // Convert SVG to data URL
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // Create canvas and draw SVG
            const canvas = this.elements.exportCanvas;
            const ctx = canvas.getContext('2d');
            
            // Set high resolution for better quality
            const scale = 2;
            canvas.width = width * scale;
            canvas.height = height * scale;
            ctx.scale(scale, scale);
            
            // Create image from SVG
            const img = new Image();
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    // Fill background with white
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, width, height);
                    
                    // Draw the SVG
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Clean up
                    URL.revokeObjectURL(svgUrl);
                    resolve();
                };
                
                img.onerror = reject;
                img.src = svgUrl;
            });
            
            // Convert canvas to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `clover-quilt-design-${Date.now()}.png`;
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up
                URL.revokeObjectURL(url);
                
                this.updateStatus('Design exported successfully!');
            }, 'image/png', 0.95);
            
        } catch (error) {
            console.error('Export failed:', error);
            this.updateStatus('Export failed. Please try again.');
            this.showError('Failed to export design: ' + error.message);
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcut(event) {
        if (!this.isInitialized) return;
        
        // Handle F11 for fullscreen
        if (event.key === 'F11') {
            event.preventDefault();
            if (this.isFullscreenActive()) {
                this.exitFullscreen();
            } else {
                this.handleFullscreen();
            }
            return;
        }

        // Prevent default browser shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'r':
                    event.preventDefault();
                    this.handleReset();
                    break;
                case 's':
                    event.preventDefault();
                    this.handleExport();
                    break;

            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // Ensure SVG maintains proper fit after resize
            if (this.components.patternRenderer && this.components.patternRenderer.isPatternLoaded()) {
                this.components.patternRenderer.ensureProperSizing();
            }
        }, 250);
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update shape count
        if (this.elements.shapeCount) {
            this.elements.shapeCount.textContent = `Shapes: ${this.state.filledShapes}/${this.state.totalShapes}`;
        }

        // Update button states
        this.updateButtonStates();
    }

    /**
     * Update button enabled/disabled states
     */
    updateButtonStates() {
        // Reset button should be enabled if there are filled shapes
        if (this.elements.resetBtn) {
            this.elements.resetBtn.disabled = this.state.filledShapes === 0;
        }

        // Export button should be enabled if pattern is loaded
        if (this.elements.exportBtn) {
            this.elements.exportBtn.disabled = !this.isInitialized || this.state.isLoading;
        }
    }

    /**
     * Update status text
     */
    updateStatus(message) {
        if (this.elements.statusText) {
            this.elements.statusText.textContent = message;
        }
        console.log(`Status: ${message}`);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.updateStatus(`Error: ${message}`);
        console.error(message);
        
        // Could show a modal or toast notification here
        alert(`Error: ${message}`);
    }

    /**
     * Get current application state
     */
    getState() {
        return {
            ...this.state,
            shapes: this.components.patternRenderer ? this.components.patternRenderer.getAllShapes() : {},
            palette: this.components.colorManager ? this.components.colorManager.getPalette() : []
        };
    }

    /**
     * Load stroke color from localStorage
     */
    loadStrokeColor() {
        try {
            const saved = localStorage.getItem('clover-quilt-stroke-color');
            const strokeColor = saved || '#000000';
            
            // Set the color picker value
            if (this.elements.strokeColorPicker) {
                this.elements.strokeColorPicker.value = strokeColor;
            }
            
            // Apply the stroke color to the SVG (after it's loaded)
            if (this.components.patternRenderer && this.components.patternRenderer.isPatternLoaded()) {
                this.components.patternRenderer.updateStrokeColor(strokeColor);
            }
            
            this.state.strokeColor = strokeColor;
        } catch (error) {
            console.warn('Failed to load stroke color:', error);
        }
    }

    /**
     * Save stroke color to localStorage
     */
    saveStrokeColor(color) {
        try {
            localStorage.setItem('clover-quilt-stroke-color', color);
            this.state.strokeColor = color;
        } catch (error) {
            console.warn('Failed to save stroke color:', error);
        }
    }

    /**
     * Load canvas color from localStorage
     */
    loadCanvasColor() {
        try {
            const saved = localStorage.getItem('clover-quilt-canvas-color');
            const canvasColor = saved || '#FFFFFF';
            
            // Set the color picker value
            if (this.elements.canvasColorPicker) {
                this.elements.canvasColorPicker.value = canvasColor;
            }
            
            // Apply the canvas color to the SVG (after it's loaded)
            if (this.components.patternRenderer && this.components.patternRenderer.isPatternLoaded()) {
                this.components.patternRenderer.updateCanvasColor(canvasColor);
            }
            
            this.state.canvasColor = canvasColor;
        } catch (error) {
            console.warn('Failed to load canvas color:', error);
        }
    }

    /**
     * Save canvas color to localStorage
     */
    saveCanvasColor(color) {
        try {
            localStorage.setItem('clover-quilt-canvas-color', color);
            this.state.canvasColor = color;
        } catch (error) {
            console.warn('Failed to save canvas color:', error);
        }
    }

    /**
     * Handle fullscreen mode
     */
    handleFullscreen() {
        if (!this.isInitialized || !this.components.patternRenderer.isPatternLoaded()) {
            this.updateStatus('No pattern loaded to view in fullscreen');
            return;
        }

        const svgElement = this.components.patternRenderer.getSVGElement();
        if (!svgElement) {
            this.updateStatus('SVG not available for fullscreen');
            return;
        }

        // Clone the SVG to avoid affecting the original
        const svgClone = svgElement.cloneNode(true);
        
        // Clear any existing content
        this.elements.fullscreenSvgContainer.innerHTML = '';
        
        // Add the cloned SVG to fullscreen container
        this.elements.fullscreenSvgContainer.appendChild(svgClone);
        
        // Show the fullscreen overlay
        this.elements.fullscreenOverlay.classList.add('active');
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
        
        this.updateStatus('Entered fullscreen view');
    }

    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        // Hide the fullscreen overlay
        this.elements.fullscreenOverlay.classList.remove('active');
        
        // Restore body scrolling
        document.body.style.overflow = '';
        
        // Clear the fullscreen container
        this.elements.fullscreenSvgContainer.innerHTML = '';
        
        this.updateStatus('Exited fullscreen view');
    }

    /**
     * Check if fullscreen is currently active
     */
    isFullscreenActive() {
        return this.elements.fullscreenOverlay.classList.contains('active');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cloverQuiltApp = new CloverQuiltApp();
});

// Export for debugging
export { CloverQuiltApp }; 