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
        this.shapes = new Map(); // pathId -> { element, originalColor, currentColor, currentFill }
        this.patterns = new Map(); // patternId -> SVG pattern element
        this.clickCallback = null;
        this.isLoaded = false;
        this.canvasColor = '#FFFFFF'; // Default canvas/background color
        
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
            
            // Store shape data - use canvas color as default
            const defaultColor = this.canvasColor;
            this.shapes.set(pathId, {
                element: path,
                originalColor: defaultColor,
                currentColor: defaultColor,
                currentFill: { type: 'color', value: defaultColor }
            });
            
            // Set the fill to canvas color
            path.setAttribute('fill', defaultColor);
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
     * Fill a specific shape with color or pattern
     */
    fillShape(pathId, fill) {
        const shape = this.shapes.get(pathId);
        if (!shape) {
            console.warn(`Shape not found: ${pathId}`);
            return false;
        }
        
        const previousFill = shape.currentFill || { type: 'color', value: shape.currentColor };
        
        if (fill.type === 'color') {
            shape.currentColor = fill.value;
            shape.currentFill = fill;
            shape.element.setAttribute('fill', fill.value);
        } else if (fill.type === 'pattern') {
            const patternUrl = this.ensurePatternInSVG(fill.value);
            if (patternUrl) {
                shape.currentColor = patternUrl;
                shape.currentFill = fill;
                shape.element.setAttribute('fill', patternUrl);
            } else {
                console.warn(`Pattern not found: ${fill.value}`);
                return false;
            }
        }
        
        // Add/remove filled class for styling
        const isFilled = (fill.type === 'color' && fill.value !== shape.originalColor) || 
                         (fill.type === 'pattern');
        
        if (isFilled) {
            shape.element.classList.add('filled');
        } else {
            shape.element.classList.remove('filled');
        }
        
        return previousFill;
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

    /**
     * Ensure pattern is defined in SVG and return pattern URL
     */
    ensurePatternInSVG(patternId) {
        if (!this.svgElement) return null;
        
        // Check if pattern already exists
        if (this.patterns.has(patternId)) {
            return `url(#${patternId})`;
        }
        
        // Get pattern data from fill manager (we'll need to pass this in)
        const patternData = this.getPatternData?.(patternId);
        if (!patternData) return null;
        
        // Get current tile size from fill manager
        const tileSize = this.getCurrentTileSize ? this.getCurrentTileSize() : 50;
        
        // Create pattern definition
        const pattern = this.createSVGPattern(patternId, patternData, tileSize);
        if (pattern) {
            this.patterns.set(patternId, pattern);
            return `url(#${patternId})`;
        }
        
        return null;
    }

    /**
     * Create SVG pattern element from pattern data
     */
    createSVGPattern(patternId, patternData, tileSize = 50) {
        if (!this.svgElement) return null;
        
        // Get or create defs element
        let defs = this.svgElement.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            this.svgElement.insertBefore(defs, this.svgElement.firstChild);
        }
        
        // Create pattern element
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', patternId);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        pattern.setAttribute('width', tileSize.toString());
        pattern.setAttribute('height', tileSize.toString());
        
        // Create image element for the pattern
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('href', patternData.dataUrl);
        image.setAttribute('width', tileSize.toString());
        image.setAttribute('height', tileSize.toString());
        image.setAttribute('preserveAspectRatio', 'xMidYMid slice'); // Cover the pattern area
        
        pattern.appendChild(image);
        defs.appendChild(pattern);
        
        return pattern;
    }

    /**
     * Set pattern data callback (called by main app)
     */
    setPatternDataCallback(callback) {
        this.getPatternData = callback;
    }

    /**
     * Set tile size callback (called by main app)
     */
    setTileSizeCallback(callback) {
        this.getCurrentTileSize = callback;
    }

    /**
     * Update all pattern tile sizes
     */
    updateAllPatternSizes(newTileSize) {
        if (!this.svgElement) {
            return;
        }
        
        // Update patterns directly in the SVG
        const defsElement = this.svgElement.querySelector('defs');
        if (defsElement) {
            const allPatterns = defsElement.querySelectorAll('pattern');
            
            allPatterns.forEach((patternElement) => {
                // Update pattern attributes
                patternElement.setAttribute('width', newTileSize.toString());
                patternElement.setAttribute('height', newTileSize.toString());
                
                // Update image element within pattern
                const imageElement = patternElement.querySelector('image');
                if (imageElement) {
                    imageElement.setAttribute('width', newTileSize.toString());
                    imageElement.setAttribute('height', newTileSize.toString());
                }
            });
        }
        
        // Also update our internal patterns map
        this.patterns.forEach((patternElement, patternId) => {
            if (patternElement && patternElement.parentNode) {
                // Get pattern data
                const patternData = this.getPatternData?.(patternId);
                if (patternData) {
                    // Update pattern attributes
                    patternElement.setAttribute('width', newTileSize.toString());
                    patternElement.setAttribute('height', newTileSize.toString());
                    
                    // Update image element within pattern
                    const imageElement = patternElement.querySelector('image');
                    if (imageElement) {
                        imageElement.setAttribute('width', newTileSize.toString());
                        imageElement.setAttribute('height', newTileSize.toString());
                    }
                }
            }
        });
        
        // Force a repaint by temporarily hiding and showing the SVG
        if (this.svgElement) {
            const originalDisplay = this.svgElement.style.display;
            this.svgElement.style.display = 'none';
            // Force reflow
            this.svgElement.offsetHeight;
            this.svgElement.style.display = originalDisplay;
        }
    }

    /**
     * Remove pattern from SVG
     */
    removePattern(patternId) {
        const pattern = this.patterns.get(patternId);
        if (pattern && pattern.parentNode) {
            pattern.parentNode.removeChild(pattern);
            this.patterns.delete(patternId);
        }
    }

    /**
     * Clear all patterns from SVG
     */
    clearAllPatterns() {
        this.patterns.forEach((pattern, patternId) => {
            if (pattern.parentNode) {
                pattern.parentNode.removeChild(pattern);
            }
        });
        this.patterns.clear();
    }

    /**
     * Reset shape to original color (override for new fill system)
     */
    resetShape(pathId) {
        const shape = this.shapes.get(pathId);
        if (shape) {
            const originalFill = { type: 'color', value: shape.originalColor };
            this.fillShape(pathId, originalFill);
        }
    }

    /**
     * Reset all shapes to original colors (override for new fill system)
     */
    resetAllShapes() {
        this.shapes.forEach((shape, pathId) => {
            this.resetShape(pathId);
        });
    }

    /**
     * Update stroke color for all shapes
     */
    updateStrokeColor(color) {
        if (!this.svgElement) {
            return;
        }
        
        // Update all path elements
        const paths = this.svgElement.querySelectorAll('path');
        paths.forEach(path => {
            path.setAttribute('stroke', color);
            // Also remove any inline style stroke that might override
            if (path.style.stroke) {
                path.style.stroke = color;
            }
        });
        
        // Also update any other stroke elements (lines, polylines, polygons, etc.)
        const strokeElements = this.svgElement.querySelectorAll('line, polyline, polygon, rect, circle, ellipse');
        strokeElements.forEach(element => {
            element.setAttribute('stroke', color);
            if (element.style.stroke) {
                element.style.stroke = color;
            }
        });
        
        // Update the SVG root element if it has stroke styles
        if (this.svgElement.style.stroke) {
            this.svgElement.style.stroke = color;
        }
    }

    /**
     * Update canvas color (default fill color for all unfilled shapes)
     */
    updateCanvasColor(color) {
        if (!this.svgElement) {
            return;
        }

        this.canvasColor = color;

        // Update all shapes that haven't been specifically filled by the user
        this.shapes.forEach((shape, pathId) => {
            // Only update if the shape is at its original color (unfilled by user)
            if (shape.currentColor === shape.originalColor) {
                shape.originalColor = color;
                shape.currentColor = color;
                shape.currentFill = { type: 'color', value: color };
                shape.element.setAttribute('fill', color);
                shape.element.classList.remove('filled');
            }
        });
    }
} 