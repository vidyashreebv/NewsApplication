# 🚀 Spaceflight News Dashboard

A modern React application that displays the latest space and science news articles from the Spaceflight News API.

## Features

- 📰 Fetch and display space news articles
- 🔍 Real-time search and filtering by title
- ♿ Accessible UI with ARIA labels and semantic HTML
- 📱 Responsive design with Tailwind CSS
- ✅ Comprehensive unit tests with Vitest

## Tech Stack

- **React 18** - UI library with functional components and hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Testing utilities for React components
- **PropTypes** - Runtime type checking for React props

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ArticleCard.jsx          # Article display component
│   ├── ArticleCard.test.jsx
│   ├── SearchInput.jsx           # Search input component
│   └── SearchInput.test.jsx
├── pages/
│   ├── SpaceNewsPage.jsx         # Main page component
│   └── SpaceNewsPage.test.jsx
├── services/
│   ├── spaceNewsApi.js           # API service layer
│   └── spaceNewsApi.test.js
├── App.jsx                        # Root app component
├── App.test.jsx
├── main.jsx                       # Entry point
└── index.css                      # Global styles
```

## API

This application uses the [Spaceflight News API](https://api.spaceflightnewsapi.net/v4/articles/) to fetch articles.

## Development Practices

- ✅ Named exports only (no default exports)
- ✅ PropTypes validation on all components
- ✅ Comprehensive unit tests for all components
- ✅ Accessibility-first design
- ✅ Descriptive function and variable names
- ✅ Conventional commit messages

## License

MIT
