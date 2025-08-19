# StudioFlow

StudioFlow is a modern, AI-powered code exploration tool that helps developers understand and navigate any codebase efficiently. Built with Next.js and React, it provides an intuitive interface for analyzing GitHub repositories with intelligent explanations and collaborative features.

## 🚀 Features

### Core Functionality
- **Repository Analysis**: Analyze any public GitHub repository with AI-powered insights
- **Interactive File Tree**: Navigate through project structure with expandable folders
- **Code Visualization**: Syntax-highlighted code viewer with file content display
- **AI Explanations**: Get intelligent explanations for selected code blocks
- **Progress Tracking**: Visual progress tracking showing exploration status (like Duolingo)

### New Enhanced Features
- **Settings & Customization**: 
  - Theme selection (Light, Dark, System)
  - Adjustable font sizes and layout preferences
  - Customizable sidebar width and smooth transitions
  - Auto-save functionality
  
- **Code Comparison**: 
  - Side-by-side file comparison
  - Difference highlighting and analysis
  - Export comparison results
  - Support for comparing any two files in the repository

- **File Annotations**:
  - Add collaborative notes to specific lines of code
  - Author attribution and timestamps
  - Share annotations with team members
  - Persistent storage across sessions

### User Experience
- **Smooth Transitions**: Enhanced animations for sidebar, modals, and interactive elements
- **Responsive Design**: Optimized for both desktop and mobile experiences
- **Dark Mode Support**: Complete theming system with automatic system detection
- **Keyboard Navigation**: Full accessibility support for keyboard users

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.3, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **AI Integration**: Google Genkit for intelligent code explanations
- **Icons**: Lucide React
- **Development**: Turbopack for fast development builds

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LeoHNDZ/Learn-code.git
   cd Learn-code
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional for AI features)
   ```bash
   cp .env.example .env.local
   # Add your GEMINI_API_KEY for AI explanations
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9002`

## 🎯 Getting Started

1. **Enter a Repository URL**: Paste any public GitHub repository URL in the input field
2. **Analyze Repository**: Click "Analyze Repository" to load the project structure
3. **Explore Files**: Use the sidebar file tree to navigate through the codebase
4. **Get Explanations**: Select code blocks and click "Explain Code" for AI insights
5. **Track Progress**: Monitor your exploration progress in the progress bar
6. **Add Annotations**: Click "Annotations" to add collaborative notes to files
7. **Compare Files**: Use "Compare Files" to analyze differences between files
8. **Customize Experience**: Access Settings to personalize your interface

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compilation check
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run genkit:watch` - Start Genkit with file watching

## 🎨 Design System

StudioFlow follows a carefully crafted design system inspired by Apple's clean interface and Duolingo's gamified elements:

- **Primary Color**: Light blue (#579BB1) for clarity and understanding
- **Background**: Very light gray (#F0F4F7) for a clean coding environment  
- **Accent Color**: Muted yellow (#D4AC0D) for highlighting important elements
- **Typography**: Inter font family for modern, readable text
- **Layout**: Split-screen design with sidebar navigation and main content area

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and formatting
- Testing requirements
- Pull request process
- Issue reporting

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- AI powered by [Google Genkit](https://firebase.google.com/products/genkit)

---

**Made with ❤️ for developers who love clean, understandable code**
