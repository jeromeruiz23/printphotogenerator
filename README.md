# Photo Print Layout Generator

A React-based web application that helps users create printable photo layouts by arranging multiple copies of a photo on standard paper sizes.

## Features

- **Image Upload**: Drag & drop or click to upload photos
- **Interactive Preview**: 
  - Pan and zoom functionality
  - Live crop preview
  - Real-time layout visualization
- **Flexible Sizing Options**:
  - Pre-defined standard photo sizes (passport, ID, etc.)
  - Custom photo size input
  - Common paper formats (A4, Letter, etc.)
- **Layout Optimization**:
  - Automatic layout calculation
  - Spacing and margin handling
  - Paper orientation detection
- **Export**:
  - High-quality PDF export
  - Dashed cut lines for easy trimming
- **Dark Mode**: System-aware dark mode support

## Tech Stack

- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vite](https://vitejs.dev/) - Build tool
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [react-dropzone](https://react-dropzone.js.org/) - File uploads  
- [lucide-react](https://lucide.dev/guide/packages/lucide-react) - Icons

## Getting Started

1. Install dependencies:
```sh
npm install
```
2. Start development server:
```sh
npm run dev
```
3. Build for production:
```sh
npm run build
```

Usage
Upload a photo by dragging and dropping or clicking the upload area
Select desired photo size from presets or create a custom size
Choose target paper size
Adjust the crop area by panning and zooming the image
Preview the layout with multiple copies
Generate and download the PDF
License

MIT

Contributing
Fork the repository
Create a feature branch
Commit your changes
Push to the branch
Open a Pull Request

