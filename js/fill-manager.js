/**
 * FillManager - Handles both color palette and pattern fills
 */
export class FillManager {
    constructor(containers, callbacks = {}) {
        // UI Elements
        this.colorPaletteContainer = containers.colorPalette;
        this.patternGallery = containers.patternGallery;
        this.colorSection = containers.colorSection;
        this.patternSection = containers.patternSection;
        this.colorModeBtn = containers.colorModeBtn;
        this.patternModeBtn = containers.patternModeBtn;
        this.colorPickerBtn = containers.colorPickerBtn;
        this.hiddenColorPicker = containers.hiddenColorPicker;
        this.uploadPatternBtn = containers.uploadPatternBtn;
        this.hiddenFileInput = containers.hiddenFileInput;
        this.clearPatternsBtn = containers.clearPatternsBtn;
        this.zoomSlider = containers.zoomSlider;
        
        this.callbacks = {
            onFillChange: callbacks.onFillChange || (() => {}),
            onModeChange: callbacks.onModeChange || (() => {}),
            onTileSizeChange: callbacks.onTileSizeChange || (() => {})
        };
        
        // State
        this.currentMode = 'color'; // 'color' or 'pattern'
        this.activeColorIndex = 0;
        this.activePatternId = null;
        this.patternZoomLevel = 4; // 0=tiny to 9=huge, default=medium
        this.zoomSizes = ['tiny', 'xs', 'small', 'sm', 'medium', 'ml', 'large', 'xl', 'xxl', 'huge'];
        this.tileSizes = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]; // Actual tile sizes in pixels
        
        // Default color palette - Light Pastel Colors
        this.defaultColors = [
            '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
            '#E6BAFF', '#FFB3E6', '#F0E6FF', '#E6F3FF', '#FFF0E6'
        ];
        
        this.colorPalette = this.loadColorPalette();
        this.patterns = this.loadPatterns(); // Map of patternId -> {id, name, dataUrl, svgPatternElement}
        
        this.setupUI();
        this.setupEventListeners();
        
        // Load default patterns if none exist (async)
        this.initializationPromise = this.loadDefaultPatternsIfNeeded();
    }

    /**
     * Setup the UI components
     */
    setupUI() {
        this.setupColorPalette();
        this.setupPatternGallery();
        this.updateModeUI();
        this.updateZoomSlider();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mode toggle buttons
        this.colorModeBtn?.addEventListener('click', () => this.setMode('color'));
        this.patternModeBtn?.addEventListener('click', () => this.setMode('pattern'));
        
        // Color picker
        this.colorPickerBtn?.addEventListener('click', () => {
            this.hiddenColorPicker.value = this.getCurrentColor();
            this.hiddenColorPicker.click();
        });
        
        this.hiddenColorPicker?.addEventListener('change', (event) => {
            const newColor = this.normalizeColor(event.target.value);
            this.updateColorInPalette(this.activeColorIndex, newColor);
        });
        
        // Pattern upload
        this.uploadPatternBtn?.addEventListener('click', () => {
            this.hiddenFileInput.click();
        });
        
        this.hiddenFileInput?.addEventListener('change', (event) => {
            this.handleFileUpload(event);
        });
        
        // Clear patterns
        this.clearPatternsBtn?.addEventListener('click', () => {
            this.clearAllPatterns();
        });
        
        // Zoom slider
        if (this.zoomSlider) {
            this.zoomSlider.addEventListener('input', (event) => {
                this.setZoomLevel(parseInt(event.target.value));
            });
            
            // Also add change event as backup
            this.zoomSlider.addEventListener('change', (event) => {
                this.setZoomLevel(parseInt(event.target.value));
            });
        }
    }

    /**
     * Setup color palette UI
     */
    setupColorPalette() {
        if (!this.colorPaletteContainer) return;
        
        this.colorPaletteContainer.innerHTML = '';
        
        this.colorPalette.forEach((color, index) => {
            const colorBlock = document.createElement('div');
            colorBlock.className = 'color-block';
            colorBlock.style.backgroundColor = color;
            colorBlock.setAttribute('data-index', index);
            
            if (index === this.activeColorIndex && this.currentMode === 'color') {
                colorBlock.classList.add('active');
            }
            
            colorBlock.addEventListener('click', () => {
                this.setActiveColor(index);
            });
            
            this.colorPaletteContainer.appendChild(colorBlock);
        });
    }

    /**
     * Setup pattern gallery UI
     */
    setupPatternGallery() {
        if (!this.patternGallery) {
            return;
        }
        
        this.patternGallery.innerHTML = '';
        
        // Apply current zoom level
        this.updatePatternGallerySize();
        
        this.patterns.forEach((pattern, patternId) => {
            const patternBlock = document.createElement('div');
            patternBlock.className = 'pattern-block';
            patternBlock.style.backgroundImage = `url(${pattern.dataUrl})`;
            patternBlock.setAttribute('data-pattern-id', patternId);
            
            // Update title to show if it's a default pattern
            patternBlock.title = pattern.isDefault ? `${pattern.name} (Default)` : pattern.name;
            
            // Add visual indicator for default patterns
            if (pattern.isDefault) {
                patternBlock.classList.add('default-pattern');
            }
            
            if (patternId === this.activePatternId && this.currentMode === 'pattern') {
                patternBlock.classList.add('active');
            }
            
            patternBlock.addEventListener('click', () => {
                this.setActivePattern(patternId);
            });
            
            // Add delete button on right-click
            patternBlock.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.deletePattern(patternId);
            });
            
            this.patternGallery.appendChild(patternBlock);
        });
        
        // Update zoom slider
        this.updateZoomSlider();
    }

    /**
     * Set the current fill mode
     */
    setMode(mode) {
        if (mode !== 'color' && mode !== 'pattern') return;
        if (this.currentMode === mode) return;
        
        this.currentMode = mode;
        this.updateModeUI();
        this.callbacks.onModeChange(mode);
        
        // Trigger fill change callback with current selection
        if (mode === 'color') {
            this.callbacks.onFillChange(this.getCurrentFill());
        } else if (mode === 'pattern' && this.activePatternId) {
            this.callbacks.onFillChange(this.getCurrentFill());
        }
    }

    /**
     * Update UI based on current mode
     */
    updateModeUI() {
        // Update mode buttons
        this.colorModeBtn?.classList.toggle('active', this.currentMode === 'color');
        this.patternModeBtn?.classList.toggle('active', this.currentMode === 'pattern');
        
        // Show/hide sections
        this.colorSection?.classList.toggle('hidden', this.currentMode !== 'color');
        this.patternSection?.classList.toggle('hidden', this.currentMode !== 'pattern');
        
        // Update active selections
        this.updateActiveSelections();
    }

    /**
     * Update active selection indicators
     */
    updateActiveSelections() {
        // Update color blocks
        this.colorPaletteContainer?.querySelectorAll('.color-block').forEach((block, index) => {
            block.classList.toggle('active', 
                index === this.activeColorIndex && this.currentMode === 'color');
        });
        
        // Update pattern blocks
        this.patternGallery?.querySelectorAll('.pattern-block').forEach(block => {
            const patternId = block.getAttribute('data-pattern-id');
            block.classList.toggle('active', 
                patternId === this.activePatternId && this.currentMode === 'pattern');
        });
    }

    /**
     * Set active color
     */
    setActiveColor(index) {
        if (index < 0 || index >= this.colorPalette.length) return;
        
        this.activeColorIndex = index;
        this.setMode('color');
        this.updateActiveSelections();
        this.callbacks.onFillChange(this.getCurrentFill());
    }

    /**
     * Set active pattern
     */
    setActivePattern(patternId) {
        if (!this.patterns.has(patternId)) return;
        
        this.activePatternId = patternId;
        this.setMode('pattern');
        this.updateActiveSelections();
        this.callbacks.onFillChange(this.getCurrentFill());
    }

    /**
     * Get current fill (color or pattern reference)
     */
    getCurrentFill() {
        if (this.currentMode === 'color') {
            return {
                type: 'color',
                value: this.colorPalette[this.activeColorIndex]
            };
        } else if (this.currentMode === 'pattern' && this.activePatternId) {
            return {
                type: 'pattern',
                value: this.activePatternId
            };
        }
        return null;
    }

    /**
     * Get current color
     */
    getCurrentColor() {
        return this.colorPalette[this.activeColorIndex];
    }

    /**
     * Update color in palette
     */
    updateColorInPalette(index, color) {
        if (index < 0 || index >= this.colorPalette.length) return;
        
        const normalizedColor = this.normalizeColor(color);
        this.colorPalette[index] = normalizedColor;
        
        // Update UI
        const colorBlock = this.colorPaletteContainer?.querySelector(`[data-index="${index}"]`);
        if (colorBlock) {
            colorBlock.style.backgroundColor = normalizedColor;
        }
        
        // If this is the active color, notify callbacks
        if (index === this.activeColorIndex && this.currentMode === 'color') {
            this.callbacks.onFillChange(this.getCurrentFill());
        }
        
        this.saveColorPalette();
    }

    /**
     * Handle file upload for patterns
     */
    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            
            try {
                await this.addPatternFromFile(file);
            } catch (error) {
                console.error('Error adding pattern:', error);
                alert(`Failed to add pattern from ${file.name}`);
            }
        }
        
        // Clear file input
        event.target.value = '';
    }

    /**
     * Add pattern from uploaded file
     */
    async addPatternFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                const patternId = this.generatePatternId();
                const pattern = {
                    id: patternId,
                    name: file.name,
                    dataUrl: dataUrl,
                    svgPatternElement: null // Will be created when needed
                };
                
                this.patterns.set(patternId, pattern);
                this.savePatterns();
                this.setupPatternGallery();
                
                // Auto-select the new pattern
                this.setActivePattern(patternId);
                
                resolve(pattern);
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Generate unique pattern ID
     */
    generatePatternId() {
        return `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get pattern by ID
     */
    getPattern(patternId) {
        return this.patterns.get(patternId);
    }

    /**
     * Delete pattern
     */
    deletePattern(patternId) {
        if (!this.patterns.has(patternId)) return;
        
        this.patterns.delete(patternId);
        
        // If this was the active pattern, clear selection
        if (this.activePatternId === patternId) {
            this.activePatternId = null;
            if (this.currentMode === 'pattern') {
                this.setMode('color'); // Switch back to color mode
            }
        }
        
        this.savePatterns();
        this.setupPatternGallery();
    }

    /**
     * Clear all patterns
     */
    clearAllPatterns() {
        if (this.patterns.size === 0) return;
        
        // Count user-uploaded vs default patterns
        let userPatterns = 0;
        let defaultPatterns = 0;
        this.patterns.forEach(pattern => {
            if (pattern.isDefault) {
                defaultPatterns++;
            } else {
                userPatterns++;
            }
        });

        let message = 'Clear all patterns?';
        if (userPatterns > 0 && defaultPatterns > 0) {
            message = `Clear all patterns? This will remove ${userPatterns} uploaded pattern(s) and ${defaultPatterns} default pattern(s). Default patterns will reload on next visit.`;
        } else if (userPatterns > 0) {
            message = `Clear ${userPatterns} uploaded pattern(s)? This cannot be undone.`;
        } else {
            message = `Clear ${defaultPatterns} default pattern(s)? They will reload on next visit.`;
        }
        
        if (confirm(message)) {
            this.patterns.clear();
            this.activePatternId = null;
            
            if (this.currentMode === 'pattern') {
                this.setMode('color');
            }
            
            this.savePatterns();
            this.setupPatternGallery();
        }
    }

    /**
     * Normalize color to hex format
     */
    normalizeColor(color) {
        if (!color || typeof color !== 'string') return '#000000';
        
        color = color.trim();
        if (!color.startsWith('#')) color = '#' + color;
        if (color.length === 4) {
            color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
        }
        return color.toUpperCase();
    }

    /**
     * Load color palette from localStorage
     */
    loadColorPalette() {
        try {
            const saved = localStorage.getItem('clover-quilt-color-palette');
            if (saved) {
                const palette = JSON.parse(saved);
                if (Array.isArray(palette) && palette.length === 10) {
                    return palette.map(color => this.normalizeColor(color));
                }
            }
        } catch (error) {
            console.warn('Failed to load color palette:', error);
        }
        return [...this.defaultColors];
    }

    /**
     * Save color palette to localStorage
     */
    saveColorPalette() {
        try {
            localStorage.setItem('clover-quilt-color-palette', JSON.stringify(this.colorPalette));
        } catch (error) {
            console.warn('Failed to save color palette:', error);
        }
    }

    /**
     * Load patterns from localStorage
     */
    loadPatterns() {
        const patterns = new Map();
        try {
            const saved = localStorage.getItem('clover-quilt-patterns');
            if (saved) {
                const patternsData = JSON.parse(saved);
                Object.entries(patternsData).forEach(([id, data]) => {
                    patterns.set(id, data);
                });
            }
        } catch (error) {
            console.warn('Failed to load patterns:', error);
        }
        return patterns;
    }

    /**
     * Save patterns to localStorage
     */
    savePatterns() {
        try {
            const patternsData = {};
            this.patterns.forEach((pattern, id) => {
                patternsData[id] = {
                    id: pattern.id,
                    name: pattern.name,
                    dataUrl: pattern.dataUrl
                    // Don't save svgPatternElement as it will be recreated
                };
            });
            localStorage.setItem('clover-quilt-patterns', JSON.stringify(patternsData));
        } catch (error) {
            console.warn('Failed to save patterns:', error);
        }
    }

    /**
     * Set zoom level directly
     */
    setZoomLevel(level) {
        if (level < 0 || level >= this.zoomSizes.length) {
            return;
        }
        
        this.patternZoomLevel = level;
        this.updatePatternGallerySize();
        
        // Notify pattern renderer to update tile sizes
        if (this.callbacks.onTileSizeChange) {
            this.callbacks.onTileSizeChange(this.tileSizes[level]);
        }
    }

    /**
     * Get current tile size
     */
    getCurrentTileSize() {
        return this.tileSizes[this.patternZoomLevel];
    }

    /**
     * Update pattern gallery size without rebuilding
     */
    updatePatternGallerySize() {
        if (!this.patternGallery) {
            return;
        }
        
        const newClassName = `pattern-gallery size-${this.zoomSizes[this.patternZoomLevel]}`;
        
        // Apply current zoom level to gallery
        this.patternGallery.className = newClassName;
    }

    /**
     * Update zoom slider value
     */
    updateZoomSlider() {
        if (this.zoomSlider) {
            this.zoomSlider.value = this.patternZoomLevel;
        }
    }

    /**
     * Wait for initialization to complete (including default pattern loading)
     */
    async waitForInitialization() {
        if (this.initializationPromise) {
            await this.initializationPromise;
            // Refresh UI after default patterns are loaded
            this.setupPatternGallery();
        }
    }

    /**
     * Load default patterns if none exist
     */
    async loadDefaultPatternsIfNeeded() {
        // Only load defaults if no patterns are saved
        if (this.patterns.size > 0) {
            return;
        }

        const defaultPatterns = [
            'patterns/1.jpg',
            'patterns/2.jpg', 
            'patterns/3.jpg',
            'patterns/4.jpg',
            'patterns/5.jpg',
            'patterns/6.jpg',
            'patterns/7.jpg',
            'patterns/8.jpg',
            'patterns/9.jpg',
            'patterns/10.jpg'
        ];

        for (let i = 0; i < defaultPatterns.length; i++) {
            const imagePath = defaultPatterns[i];
            try {
                await this.loadDefaultPattern(imagePath, `Pattern ${i + 1}`);
            } catch (error) {
                console.warn(`Failed to load default pattern: ${imagePath}`, error);
                // Continue loading other patterns even if one fails
            }
        }

        // Save the loaded default patterns
        if (this.patterns.size > 0) {
            this.savePatterns();
        }
    }

    /**
     * Load a single default pattern from URL
     */
    async loadDefaultPattern(imagePath, name) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Handle CORS if needed
            
            img.onload = () => {
                // Create a canvas to convert image to data URL
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                try {
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    const patternId = this.generatePatternId();
                    
                    const pattern = {
                        id: patternId,
                        name: name,
                        dataUrl: dataUrl,
                        svgPatternElement: null,
                        isDefault: true // Mark as default pattern
                    };
                    
                    this.patterns.set(patternId, pattern);
                    resolve(pattern);
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${imagePath}`));
            };
            
            img.src = imagePath;
        });
    }

    /**
     * Reset to defaults
     */
    reset() {
        this.colorPalette = [...this.defaultColors];
        this.activeColorIndex = 0;
        this.patterns.clear();
        this.activePatternId = null;
        this.currentMode = 'color';
        this.patternZoomLevel = 4;
        
        this.saveColorPalette();
        this.savePatterns();
        
        // Reload default patterns
        this.loadDefaultPatternsIfNeeded().then(() => {
            this.setupUI();
            this.callbacks.onFillChange(this.getCurrentFill());
        });
    }
} 