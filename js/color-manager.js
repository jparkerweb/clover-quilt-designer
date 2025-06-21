/**
 * ColorManager - Handles color palette, selection, and recent colors
 */
export class ColorManager {
    constructor(paletteContainer, callbacks = {}) {
        this.paletteContainer = paletteContainer;
        this.colorPickerBtn = document.getElementById('colorPickerBtn');
        this.hiddenColorPicker = document.getElementById('hiddenColorPicker');
        this.callbacks = {
            onColorChange: callbacks.onColorChange || (() => {})
        };
        
        // Default palette colors
        this.defaultColors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
            '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
        ];
        
        this.palette = this.loadPalette();
        this.activeColorIndex = 0;
        
        this.setupPalette();
        this.setupColorPicker();
    }

    /**
     * Setup the color palette UI
     */
    setupPalette() {
        this.paletteContainer.innerHTML = '';
        
        this.palette.forEach((color, index) => {
            const colorBlock = document.createElement('div');
            colorBlock.className = 'color-block';
            colorBlock.style.backgroundColor = color;
            colorBlock.setAttribute('data-index', index);
            
            if (index === this.activeColorIndex) {
                colorBlock.classList.add('active');
            }
            
            // Handle block click to select active color
            colorBlock.addEventListener('click', () => {
                this.setActiveColor(index);
            });
            this.paletteContainer.appendChild(colorBlock);
        });
    }

    /**
     * Setup the central color picker button
     */
    setupColorPicker() {
        if (!this.colorPickerBtn || !this.hiddenColorPicker) return;
        
        // Handle color picker button click
        this.colorPickerBtn.addEventListener('click', () => {
            this.hiddenColorPicker.value = this.getCurrentColor();
            this.hiddenColorPicker.click();
        });
        
        // Handle color picker change
        this.hiddenColorPicker.addEventListener('change', (event) => {
            const newColor = this.normalizeColor(event.target.value);
            this.updatePaletteColor(this.activeColorIndex, newColor);
        });
    }

    /**
     * Get current active color
     */
    getCurrentColor() {
        return this.palette[this.activeColorIndex];
    }

    /**
     * Get active color index
     */
    getActiveColorIndex() {
        return this.activeColorIndex;
    }

    /**
     * Set active color by index
     */
    setActiveColor(index) {
        if (index < 0 || index >= this.palette.length) return;
        
        // Remove active class from previous
        const prevActive = this.paletteContainer.querySelector('.color-block.active');
        if (prevActive) {
            prevActive.classList.remove('active');
        }
        
        // Set new active
        this.activeColorIndex = index;
        const newActive = this.paletteContainer.querySelector(`[data-index="${index}"]`);
        if (newActive) {
            newActive.classList.add('active');
        }
        
        const currentColor = this.getCurrentColor();
        this.callbacks.onColorChange(currentColor);
    }

    /**
     * Update a specific palette color
     */
    updatePaletteColor(index, color) {
        if (index < 0 || index >= this.palette.length) return;
        
        const normalizedColor = this.normalizeColor(color);
        this.palette[index] = normalizedColor;
        
        // Update UI
        const colorBlock = this.paletteContainer.querySelector(`[data-index="${index}"]`);
        if (colorBlock) {
            colorBlock.style.backgroundColor = normalizedColor;
        }
        
        // If this is the active color, notify callbacks
        if (index === this.activeColorIndex) {
            this.callbacks.onColorChange(normalizedColor);
        }
        
        this.savePalette();
    }

    /**
     * Get the entire palette
     */
    getPalette() {
        return [...this.palette];
    }

    /**
     * Set the entire palette
     */
    setPalette(newPalette) {
        if (!Array.isArray(newPalette) || newPalette.length !== 10) return;
        
        this.palette = newPalette.map(color => this.normalizeColor(color));
        this.savePalette();
        this.setupPalette();
        
        // Trigger callback for current color
        this.callbacks.onColorChange(this.getCurrentColor());
    }

    /**
     * Reset palette to defaults
     */
    resetPalette() {
        this.palette = [...this.defaultColors];
        this.activeColorIndex = 0;
        this.savePalette();
        this.setupPalette();
        this.callbacks.onColorChange(this.getCurrentColor());
    }

    /**
     * Validate hex color format
     */
    isValidColor(color) {
        if (typeof color !== 'string') return false;
        
        // Check for hex format
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
    }

    /**
     * Normalize color to 6-digit hex format
     */
    normalizeColor(color) {
        if (!color || typeof color !== 'string') return '#000000';
        
        // Remove any whitespace
        color = color.trim();
        
        // Add # if missing
        if (!color.startsWith('#')) {
            color = '#' + color;
        }
        
        // Convert 3-digit hex to 6-digit
        if (color.length === 4) {
            color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
        }
        
        // Ensure uppercase
        return color.toUpperCase();
    }



    /**
     * Load palette from localStorage
     */
    loadPalette() {
        try {
            const stored = localStorage.getItem('clover-quilt-palette');
            if (stored) {
                const palette = JSON.parse(stored);
                if (Array.isArray(palette) && palette.length === 10) {
                    return palette.map(color => this.normalizeColor(color));
                }
            }
        } catch (error) {
            console.warn('Failed to load palette:', error);
        }
        
        return [...this.defaultColors];
    }

    /**
     * Save palette to localStorage
     */
    savePalette() {
        try {
            localStorage.setItem('clover-quilt-palette', JSON.stringify(this.palette));
        } catch (error) {
            console.warn('Failed to save palette:', error);
        }
    }



    /**
     * Get color brightness (0-255)
     */
    getColorBrightness(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Using luminance formula
        return Math.round((r * 0.299) + (g * 0.587) + (b * 0.114));
    }

    /**
     * Get contrasting color (black or white) for given background
     */
    getContrastingColor(backgroundColor) {
        const brightness = this.getColorBrightness(backgroundColor);
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    /**
     * Generate a random hex color
     */
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /**
     * Set active color to a random color
     */
    setRandomColor() {
        const randomColor = this.getRandomColor();
        this.updatePaletteColor(this.activeColorIndex, randomColor);
    }
} 