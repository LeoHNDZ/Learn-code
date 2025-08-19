# StudioFlow

StudioFlow is a modern, AI-powered code exploration tool that helps developers understand and navigate any codebase efficiently. Built with Next.js and React, it provides an intuitive interface for analyzing GitHub repositories with **enhanced Gemini AI integration** and intelligent explanations.

## 🚀 Enhanced Features

### 🤖 Advanced AI Integration (NEW)
- **Enhanced Code Explanations**: Comprehensive, educational explanations with better prompts
- **AI-Powered File Summaries**: Get instant insights about file purpose, complexity, and key components
- **Intelligent Code Suggestions**: Receive actionable improvement recommendations for performance, security, and best practices
- **Structured Analysis**: Organized AI responses with proper categorization and priority levels
- **Smart Error Handling**: Better error messages and recovery for AI service issues

### Core Functionality
- **Repository Analysis**: Analyze any public GitHub repository with AI-powered insights
- **Interactive File Tree**: Navigate through project structure with expandable folders
- **Enhanced Code Visualization**: Tabbed interface with syntax-highlighted code viewer
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
- **AI Integration**: Google Genkit with Gemini 2.0 Flash model
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
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

3. **Set up environment variables** (Required for AI features)
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GOOGLE_API_KEY
   # Get your API key from: https://makersuite.google.com/app/apikey
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9002`

## 🔑 AI Configuration

To enable all AI features, you need a Google Gemini API key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Generate an API key
3. Add it to your `.env.local` file:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```

Without this key, the repository analysis will work but AI features (explanations, summaries, suggestions) will show error messages.

## 🎯 Getting Started

1. **Enter a Repository URL**: Paste any public GitHub repository URL in the input field
2. **Analyze Repository**: Click "Analyze Repository" to load the project structure
3. **Explore Files**: Use the sidebar file tree to navigate through the codebase
4. **Get AI Insights**:
   - Select code blocks and click "Explain Code" for detailed explanations
   - Click "File Summary" for AI-powered file analysis
   - Click "Suggestions" for improvement recommendations
5. **Track Progress**: Monitor your exploration progress in the progress bar
6. **Add Annotations**: Click "Annotations" to add collaborative notes to files
7. **Compare Files**: Use "Compare Files" to analyze differences between files
8. **Customize Experience**: Access Settings to personalize your interface

## 🤖 AI Features Overview

### Code Explanations
- **Purpose & Functionality**: What the code accomplishes
- **Line-by-Line Breakdown**: Detailed explanation of key sections
- **Technical Details**: Language features and design patterns
- **Context & Relations**: How code fits into the larger project
- **Learning Points**: Key concepts and best practices

### File Summaries
- **Summary**: Concise overview of file purpose
- **Key Components**: Main functions, classes, or exports
- **Complexity Assessment**: Low, medium, or high complexity rating
- **Tags**: Relevant categorization (component, utility, config, etc.)
- **Purpose**: Clear statement of the file's role

### Code Suggestions
- **Performance**: Optimization opportunities and efficiency improvements
- **Readability**: Code clarity and organization suggestions
- **Security**: Potential vulnerabilities and best practices
- **Best Practices**: Language-specific conventions and patterns
- **Type Safety**: Type annotations and safety improvements

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

## 🔧 Environment Variables

See `.env.example` for a complete list of configuration options:

- `GOOGLE_API_KEY` - **Required** for AI features
- `AI_MODEL` - AI model selection (default: gemini-2.0-flash)
- `AI_TIMEOUT` - Request timeout in milliseconds
- `AI_RATE_LIMIT` - Requests per minute limit
- `NODE_ENV` - Environment mode
- `PORT` - Server port (default: 9002)

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
- AI powered by [Google Genkit](https://firebase.google.com/products/genkit) and [Gemini AI](https://deepmind.google/technologies/gemini/)
- UI components from [Radix UI](https://radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for developers who love clean, understandable code enhanced by the power of AI**
