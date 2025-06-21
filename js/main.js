/**
 * Main Application - Orchestrates all components and handles initialization
 */
import { PatternRenderer } from './pattern-renderer.js';
import { ColorManager } from './color-manager.js';

class CloverQuiltApp {
    constructor() {
        this.isInitialized = false;
        this.components = {};
        this.elements = {};
        this.state = {
            totalShapes: 0,
            filledShapes: 0,
            currentColor: '#FF0000',
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
            this.setupComponents();
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
            
            // Color controls
            colorPalette: document.getElementById('colorPalette'),
            
            // Action buttons
            resetBtn: document.getElementById('resetBtn'),
            exportBtn: document.getElementById('exportBtn'),
            
            // Status
            statusText: document.getElementById('statusText'),
            shapeCount: document.getElementById('shapeCount'),
            
            // Export canvas
            exportCanvas: document.getElementById('exportCanvas')
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
    setupComponents() {
        // Initialize PatternRenderer
        this.components.patternRenderer = new PatternRenderer(this.elements.patternWrapper, {
            hoverEffects: true
        });

        // Setup shape click handler
        this.components.patternRenderer.onShapeClick((pathId, currentColor, event) => {
            this.handleShapeClick(pathId, currentColor, event);
        });

        // Initialize ColorManager
        this.components.colorManager = new ColorManager(this.elements.colorPalette, {
            onColorChange: (color) => this.handleColorChange(color)
        });

        // Set initial color
        this.state.currentColor = this.components.colorManager.getCurrentColor();
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
        
        const newColor = this.state.currentColor;
        const previousColor = this.components.patternRenderer.fillShape(pathId, newColor);
        
        if (previousColor !== null) {
            // Update filled shapes count
            this.state.filledShapes = this.components.patternRenderer.getFilledShapesCount();
            this.updateUI();
            

            
            this.updateStatus(`Filled shape with ${newColor}`);
        }
    }

    /**
     * Handle color change
     */
    handleColorChange(color) {
        this.state.currentColor = color;
        this.updateStatus(`Color changed to ${color}`);
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cloverQuiltApp = new CloverQuiltApp();
});

// Export for debugging
export { CloverQuiltApp }; 