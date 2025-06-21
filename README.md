# 🍀 Clover Quilt Designer

A beautiful, interactive web application for designing and visualizing colored patterns on a clover quilt template. Create stunning quilt designs with an intuitive paint bucket tool and customizable color palette.

![Clover Quilt Designer](https://img.shields.io/badge/Status-Active-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### 🎨 Color Design Tools
- **10 Customizable Color Swatches** - Click to select, customize with browser color picker
- **Paint Bucket Tool** - Click any shape to fill with the selected color
- **Visual Selection Feedback** - Active color swatch shows checkmark indicator
- **Persistent Color Palette** - Your custom colors are saved between sessions

### 🖼️ Pattern Interaction
- **625 Individual Shapes** - Each piece of the clover pattern is individually clickable
- **Auto-Fit Display** - Pattern automatically scales to fit your screen without scrollbars
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Hover Effects** - Visual feedback when hovering over shapes

### 💾 Export & Management
- **High-Quality PNG Export** - Save your designs as crisp PNG images (2x resolution)
- **One-Click Reset** - Clear all colors to start fresh
- **Keyboard Shortcuts** - `Ctrl+S` to export, `Ctrl+R` to reset
- **Real-time Shape Counter** - Track your coloring progress

### 🚀 Performance
- **Vanilla JavaScript** - No frameworks, fast loading and execution
- **SVG-Based** - Crisp, scalable graphics at any size
- **LocalStorage Integration** - Automatic saving of color preferences
- **Optimized Rendering** - Smooth interactions with 625+ clickable elements

## 🎯 Quick Start

### Option 1: Node.js Server (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/clover-quilt-designer.git
cd clover-quilt-designer

# Start the server
node server.js

# Open your browser to http://localhost:3000
```

### Option 2: Python HTTP Server
```bash
# In the project directory
python -m http.server 8000

# Open your browser to http://localhost:8000
```

### Option 3: Any Static Web Server
Simply serve the files with any static web server - no build process required!

## 🎨 How to Use

1. **Select a Color** - Click on any of the 10 color swatches at the top
2. **Customize Colors** - Click "change selected color" to open the browser color picker
3. **Paint Shapes** - Click on any part of the clover pattern to fill it with your selected color
4. **Track Progress** - Watch the shape counter update as you color
5. **Export Design** - Click the "📥 Export" button to download your creation as PNG
6. **Start Fresh** - Use "🗑️ Reset" to clear all colors

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
│   ├── pattern-renderer.js # SVG handling and interaction
│   └── color-manager.js    # Color palette management
└── README.md               # This file
```

## 🛠️ Technical Details

### Architecture
- **Component-Based Design** - Modular JavaScript classes for maintainability
- **Event-Driven** - Efficient event handling with delegation
- **Stateless** - No server-side state, all data managed client-side

### Browser Compatibility
- **Modern Browsers** - Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **ES6+ Features** - Uses modern JavaScript (modules, async/await, arrow functions)
- **SVG Support** - Requires full SVG 1.1 support
- **Canvas API** - For PNG export functionality

### Performance Optimizations
- **Event Delegation** - Single event listener handles all 625 shapes
- **Debounced Resize** - Efficient window resize handling
- **Lazy Loading** - SVG loaded asynchronously
- **Memory Management** - Proper cleanup of blob URLs and event listeners

## 🎨 Customization

### Adding New Colors
The default color palette can be modified in `js/color-manager.js`:
```javascript
this.defaultColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
    '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
];
```

### Styling
Customize the appearance by modifying `styles.css`. Key CSS custom properties:
- Color swatch sizing: `.color-block` width/height
- Pattern container: `.pattern-container` dimensions
- Button styling: `.action-buttons button` properties

### SVG Pattern
Replace `Clover-Quilt-Outline.svg` with any SVG file containing `<path>` elements to create different quilt patterns.

## 🤝 Contributing

Contributions are welcome! Areas for enhancement:
- Additional export formats (SVG, PDF)
- Undo/Redo functionality
- Pattern templates
- Color palette themes
- Print optimization

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🏷️ Version History

- **v1.0.0** - Initial release with full functionality
  - 10-color customizable palette
  - Paint bucket tool
  - PNG export
  - Auto-fit display
  - Responsive design

## 🎯 Roadmap

- [ ] Undo/Redo functionality
- [ ] Multiple pattern templates
- [ ] Color palette themes
- [ ] SVG export option
- [ ] Print-optimized layouts
- [ ] Pattern sharing via URL

---

**Made with 🍀 for quilting enthusiasts and pattern designers**

*Star this repo if you found it helpful!* 