# 📄 PDFFlow - Your Complete PDF Toolkit

A fast, secure, and privacy-focused PDF tool that runs entirely in your browser. No uploads, no servers, no tracking - just pure client-side PDF processing.

![PDFFlow](https://img.shields.io/badge/PDFFlow-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Privacy](https://img.shields.io/badge/privacy-100%25%20local-brightgreen)

## ✨ Features

### 🔧 PDF Tools
- **Split PDF** - Extract individual pages or page ranges from PDFs
- **Merge PDF** - Combine multiple PDF files into one
- **Compress PDF** - Reduce PDF file size while maintaining quality
- **Add Page Numbers** - Add customizable page numbers to your PDFs
- **JPG to PDF** - Convert JPG images to PDF format
- **PNG to PDF** - Convert PNG images to PDF format


## 🔒 Privacy First

- ✅ **100% Client-Side Processing** - All PDF operations happen in your browser
- ✅ **No File Uploads** - Your files never leave your device
- ✅ **No Tracking** - Zero analytics, cookies, or data collection
- ✅ **No Account Required** - Use it instantly, no sign-up needed
- ✅ **Offline Capable** - Works even without internet (after first load)

## 🛠️ Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling with iOS-inspired design
- **Vanilla JavaScript** - No frameworks, pure performance
- **PDF-lib** - Client-side PDF manipulation
- **jsPDF** - PDF generation

## 📦 Installation

### Option 1: Use Online (Recommended)
Just visit the live site - no installation needed!

### Option 2: Run Locally

1. **Clone the repository:**
```bash
   git clone https://github.com/yourusername/pdfflow.git
   cd pdfflow
```

2. **Open in browser:**
```bash
   # Navigate to frontend folder
   cd frontend
   
   # Open index.html in your browser
   # OR use a local server:
   python -m http.server 8000
   # Then visit: http://localhost:8000
```

That's it! No build process, no dependencies to install.

## 📁 Project Structure
```
pdfflow/
└── frontend/
    ├── index.html              # Main HTML file
    ├── css/
    │   ├── style.css           # Main styles
    │   └── modal.css           # Modal & UI styles
    └── js/
        ├── main.js             # App initialization
        ├── pdfOperations.js    # PDF processing logic
        └── uiHandlers.js       # UI interactions
```

## 🎨 Features in Detail

### Split PDF
- Extract all pages as separate PDFs
- Extract specific page ranges (e.g., "1-3, 5, 7-9")
- Automatic file naming

### Merge PDF
- Combine unlimited PDF files
- Drag & drop support
- Maintains original quality

### Compress PDF
- Reduces file size without quality loss
- Shows compression statistics
- One-click compression

### Add Page Numbers
- 6 position options (top/bottom, left/center/right)
- Sequential numbering
- Customizable placement

### Image to PDF
- Convert multiple images at once
- Supports JPG and PNG
- Preserves image quality and dimensions

## 🌐 Browser Support

- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Opera (v76+)

## 📱 Mobile Support

Fully responsive and works on:
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Mobile Firefox

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [PDF-lib](https://pdf-lib.js.org/) - PDF manipulation
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation

## 📧 Contact

- Email: poovizhivm@gmail.com
- GitHub: [@Poovizhivm](https://github.com/Poovizhivm)

## ⭐ Star Us!

If you find PDFFlow useful, please consider giving it a star on GitHub! It helps others discover the project.

---

Made for privacy-conscious users
