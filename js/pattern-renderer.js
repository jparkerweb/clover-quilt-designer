/**
 * PatternRenderer - Handles SVG pattern loading, interaction, and rendering
 */
export class PatternRenderer {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = {
            hoverEffects: true,
            ...options
        };
        
        this.svgElement = null;
        this.shapes = new Map(); // pathId -> { element, originalColor, currentColor }
        this.clickCallback = null;
        this.isLoaded = false;
        
        this.setupEventDelegation();
    }

    /**
     * Load SVG pattern from file and setup for interaction
     */
    async loadPattern(svgFilePath) {
        try {
            const response = await fetch(svgFilePath);
            if (!response.ok) {
                throw new Error(`Failed to load SVG: ${response.status}`);
            }
            
            const svgText = await response.text();
            this.container.innerHTML = svgText;
            
            this.svgElement = this.container.querySelector('svg');
            if (!this.svgElement) {
                throw new Error('No SVG element found in loaded content');
            }
            
            this.setupPathIdentification();
            this.setupHoverEffects();
            this.ensureProperSizing();
            this.isLoaded = true;
            
            return this.shapes.size;
        } catch (error) {
            console.error('Error loading pattern:', error);
            this.showError('Failed to load pattern. Please refresh and try again.');
            throw error;
        }
    }

    /**
     * Setup unique IDs for each path and initialize shape tracking
     */
    setupPathIdentification() {
        const paths = this.svgElement.querySelectorAll('path');
        let pathCounter = 0;
        
        paths.forEach(path => {
            const pathId = `shape-${pathCounter++}`;
            path.setAttribute('id', pathId);
            path.setAttribute('data-path-id', pathId);
            
            // Store shape data
            this.shapes.set(pathId, {
                element: path,
                originalColor: path.getAttribute('fill') || '#ffffff',
                currentColor: path.getAttribute('fill') || '#ffffff'
            });
        });
        
        console.log(`Initialized ${this.shapes.size} shapes`);
    }

    /**
     * Setup event delegation for path clicks
     */
    setupEventDelegation() {
        this.container.addEventListener('click', (event) => {
            const path = event.target.closest('path');
            if (path && path.hasAttribute('data-path-id')) {
                const pathId = path.getAttribute('data-path-id');
                this.handleShapeClick(pathId, event);
            }
        });
    }

    /**
     * Handle click on a shape
     */
    handleShapeClick(pathId, event) {
        if (!this.isLoaded || !this.clickCallback) return;
        
        const shape = this.shapes.get(pathId);
        if (shape) {
            this.clickCallback(pathId, shape.currentColor, event);
        }
    }

    /**
     * Fill a specific shape with color
     */
    fillShape(pathId, color) {
        const shape = this.shapes.get(pathId);
        if (!shape) {
            console.warn(`Shape not found: ${pathId}`);
            return false;
        }
        
        const previousColor = shape.currentColor;
        shape.currentColor = color;
        shape.element.setAttribute('fill', color);
        
        // Add/remove filled class for styling
        if (color !== shape.originalColor) {
            shape.element.classList.add('filled');
        } else {
            shape.element.classList.remove('filled');
        }
        
        return previousColor;
    }

    /**
     * Get current color of a shape
     */
    getShapeColor(pathId) {
        const shape = this.shapes.get(pathId);
        return shape ? shape.currentColor : null;
    }

    /**
     * Get all shapes data
     */
    getAllShapes() {
        const shapesData = {};
        this.shapes.forEach((shape, pathId) => {
            shapesData[pathId] = {
                currentColor: shape.currentColor,
                originalColor: shape.originalColor,
                isFilled: shape.currentColor !== shape.originalColor
            };
        });
        return shapesData;
    }

    /**
     * Get filled shapes count
     */
    getFilledShapesCount() {
        let count = 0;
        this.shapes.forEach(shape => {
            if (shape.currentColor !== shape.originalColor) {
                count++;
            }
        });
        return count;
    }

    /**
     * Reset all shapes to original colors
     */
    resetAllShapes() {
        this.shapes.forEach((shape, pathId) => {
            this.fillShape(pathId, shape.originalColor);
        });
    }

    /**
     * Load state from data object
     */
    loadState(stateData) {
        if (!stateData || !stateData.shapes) return;
        
        Object.entries(stateData.shapes).forEach(([pathId, shapeData]) => {
            if (shapeData.color && this.shapes.has(pathId)) {
                this.fillShape(pathId, shapeData.color);
            }
        });
    }

    /**
     * Ensure SVG fits properly in container
     */
    ensureProperSizing() {
        if (!this.svgElement) return;
        
        // Remove any fixed width/height attributes to allow CSS control
        this.svgElement.removeAttribute('width');
        this.svgElement.removeAttribute('height');
        
        // Ensure preserveAspectRatio is set to maintain proportions
        this.svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // Add CSS class for styling
        this.svgElement.classList.add('auto-fit-svg');
    }

    /**
     * Setup hover effects
     */
    setupHoverEffects() {
        if (!this.options.hoverEffects) return;
        
        this.container.addEventListener('mouseover', (event) => {
            const path = event.target.closest('path');
            if (path && path.hasAttribute('data-path-id')) {
                path.style.cursor = 'pointer';
            }
        });
    }

    /**
     * Enable/disable hover effects
     */
    enableHoverEffects(enabled = true) {
        this.options.hoverEffects = enabled;
        
        if (enabled) {
            this.setupHoverEffects();
        }
    }

    /**
     * Set click callback
     */
    onShapeClick(callback) {
        this.clickCallback = callback;
    }

    /**
     * Show error message
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Get SVG element for export
     */
    getSVGElement() {
        return this.svgElement;
    }

    /**
     * Check if pattern is loaded
     */
    isPatternLoaded() {
        return this.isLoaded;
    }
} 