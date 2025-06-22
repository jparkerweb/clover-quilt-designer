# 🍀 Clover Quilt Designer

A beautiful, interactive web application for designing and visualizing colored patterns and image textures on a clover quilt template. Create stunning quilt designs with an intuitive paint bucket tool, customizable color palette, and image pattern uploads.

![Clover Quilt Designer](https://img.shields.io/badge/Status-Active-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### 🎨 Dual Design Modes
- **Color Mode** - Traditional solid color fills with 10 customizable color swatches
- **Pattern Mode** - Upload and use image patterns as repeating textures
- **Mode Toggle** - Seamlessly switch between colors and patterns
- **Visual Selection Feedback** - Active selections show checkmark indicators

### 🖼️ Advanced Pattern System
- **Image Upload** - Upload any image (PNG, JPG, GIF, etc.) to use as a pattern
- **Pattern Gallery** - Visual thumbnails of all uploaded patterns
- **Zoom Control** - 10-level zoom slider (50px-900px tile sizes) for pattern scale
- **Pattern Persistence** - Uploaded patterns saved between sessions
- **Right-Click Delete** - Remove individual patterns from gallery
- **Clear All Patterns** - Bulk delete all uploaded patterns

### 🎯 Outline Customization
- **Outline Color Picker** - Change the color of all shape outlines
- **Global Stroke Control** - Updates all 625 shape borders simultaneously
- **Color Persistence** - Outline color preference saved between sessions

### 🖼️ Pattern Interaction
- **625 Individual Shapes** - Each piece of the clover pattern is individually clickable
- **Auto-Fit Display** - Pattern automatically scales to fit your screen without scrollbars
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Hover Effects** - Visual feedback when hovering over shapes
- **Mixed Fills** - Combine solid colors and image patterns in the same design

### 💾 Export & Management
- **High-Quality PNG Export** - Save your designs as crisp PNG images (2x resolution)
- **One-Click Reset** - Clear all colors to start fresh
- **Keyboard Shortcuts** - `Ctrl+S` to export, `Ctrl+R` to reset
- **Real-time Shape Counter** - Track your coloring progress

### 🚀 Performance
- **Vanilla JavaScript** - No frameworks, fast loading and execution
- **SVG-Based** - Crisp, scalable graphics at any size
- **LocalStorage Integration** - Automatic saving of colors, patterns, and preferences
- **Optimized Rendering** - Smooth interactions with 625+ clickable elements

## 🎯 Quick Start

### Option 1: Node.js Server (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/clover-quilt-designer.git
cd clover-quilt-designer

# Start the server
node server.js

# Open your browser to http://localhost:7777
```

### Option 2: Python HTTP Server
```bash
# In the project directory
python -m http.server 7777

# Open your browser to http://localhost:7777
```

### Option 3: Any Static Web Server
Simply serve the files with any static web server - no build process required!

## 🎨 How to Use

### Color Mode
1. **Select Color Mode** - Click the "🎨 Colors" button
2. **Select a Color** - Click on any of the 10 color swatches
3. **Customize Colors** - Click "change selected color" to open the browser color picker
4. **Paint Shapes** - Click on any part of the clover pattern to fill it with your selected color

### Pattern Mode
1. **Select Pattern Mode** - Click the "🖼️ Patterns" button
2. **Upload Images** - Click "📁 Upload Image" to add pattern images
3. **Adjust Scale** - Use the zoom slider to control pattern tile size (50px-900px)
4. **Select Pattern** - Click on any pattern thumbnail to select it
5. **Paint Shapes** - Click on shapes to fill them with the selected pattern
6. **Delete Patterns** - Right-click thumbnails to delete individual patterns

### Outline Customization
1. **Change Outline Color** - Use the "Outline Color" picker to change all shape borders
2. **Real-time Updates** - See changes immediately across all shapes

### Export & Management
1. **Track Progress** - Watch the shape counter update as you design
2. **Export Design** - Click the "📥 Export" button to download your creation as PNG
3. **Start Fresh** - Use "🗑️ Reset" to clear all fills

### 🎹 Keyboard Shortcuts
- `Ctrl+S` (or `Cmd+S`) - Export design
- `Ctrl+R` (or `Cmd+R`) - Reset all colors

## 📁 Project Structure

```
clover-quilt-designer/
├── index.html              # Main HTML file
├── styles.css              # Application styles
├── server.js               # Node.js development server
├── Clover-Quilt-Outline.svg # SVG pattern file (625 shapes)
├── js/
│   ├── main.js             # Application orchestrator
│   ├── pattern-renderer.js # SVG handling and pattern creation
│   └── fill-manager.js     # Color and pattern management
└── README.md               # This file
```

## 🛠️ Technical Details

### Architecture
- **Component-Based Design** - Modular JavaScript classes for maintainability
- **Event-Driven** - Efficient event handling with delegation
- **Stateless** - No server-side state, all data managed client-side
- **SVG Pattern System** - Dynamic SVG `<pattern>` element creation for image fills

### Browser Compatibility
- **Modern Browsers** - Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **ES6+ Features** - Uses modern JavaScript (modules, async/await, arrow functions)
- **SVG Support** - Requires full SVG 1.1 support with pattern elements
- **Canvas API** - For PNG export functionality
- **File API** - For image upload and processing

### Performance Optimizations
- **Event Delegation** - Single event listener handles all 625 shapes
- **Debounced Resize** - Efficient window resize handling
- **Lazy Loading** - SVG loaded asynchronously
- **Memory Management** - Proper cleanup of blob URLs and event listeners
- **Base64 Caching** - Efficient pattern storage and retrieval

## 🎨 Customization

### Adding Default Colors
The default color palette can be modified in `js/fill-manager.js`:
```javascript
this.defaultColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
    '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
];
```

### Pattern Zoom Settings
Adjust the zoom levels and tile sizes in `js/fill-manager.js`:
```javascript
this.tileSizes = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
```

### Styling
Customize the appearance by modifying `styles.css`. Key areas:
- Color swatch sizing: `.color-block` properties
- Pattern thumbnail sizing: `.pattern-block` properties
- Pattern container: `.pattern-container` dimensions
- Button styling: `.action-buttons button` properties

### SVG Pattern
Replace `Clover-Quilt-Outline.svg` with any SVG file containing `<path>` elements to create different quilt patterns.

## 🤝 Contributing

Contributions are welcome! Areas for enhancement:
- Additional export formats (SVG, PDF)
- Undo/Redo functionality
- Pattern templates library
- Color palette themes
- Print optimization
- Pattern rotation/transformation tools

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🏷️ Version History

- **v2.0.0** - Major Pattern Update
  - Image pattern upload system
  - 10-level zoom control for patterns
  - Outline color customization
  - Pattern gallery with thumbnails
  - Dual mode system (colors + patterns)
  - Pattern persistence and management

- **v1.0.0** - Initial release
  - 10-color customizable palette
  - Paint bucket tool
  - PNG export
  - Auto-fit display
  - Responsive design

## 🎯 Roadmap

- [ ] Undo/Redo functionality
- [ ] Pattern rotation and transformation tools
- [ ] Multiple quilt pattern templates
- [ ] Color palette themes and presets
- [ ] SVG export option
- [ ] Print-optimized layouts
- [ ] Pattern sharing via URL
- [ ] Batch pattern import
- [ ] Pattern library with built-in designs

---

**Made with 🍀 for quilting enthusiasts and pattern designers**

*Upload your favorite fabric images and create digital quilt mockups!* 