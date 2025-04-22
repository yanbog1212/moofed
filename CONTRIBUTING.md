# Contributing to Moofed

Thank you for your interest in contributing to Moofed! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Be respectful and inclusive
- Be patient and welcoming
- Be thoughtful
- Be collaborative
- When disagreeing, try to understand why

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/YOUR-USERNAME/moofed.git
   cd moofed
   ```
3. **Set up the remote upstream**
   ```bash
   git remote add upstream https://github.com/lucasnijssen/moofed.git
   ```
4. **Install dependencies**
   ```bash
   npm install
   ```

## Development Workflow

1. **Create a branch** for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Commit your changes** with a clear and descriptive commit message
   ```bash
   git commit -m "Add feature: describe your feature"
   ```

4. **Push your branch** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Submit a pull request** to the main repository

6. **Keep your fork in sync** with the upstream repository
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   git push origin main
   ```

## Pull Request Guidelines

- Fill in the provided pull request template
- Include screenshots or animated GIFs for UI changes
- Update documentation if needed
- Include tests for new features
- Ensure all tests pass
- Keep pull requests focused on a single concern
- Request reviews from maintainers

## Coding Standards

We use ESLint to enforce coding standards. Run the linter with:

```bash
npm run lint
```

Fix automatically fixable issues with:

```bash
npm run lint:fix
```

Key style guidelines:
- Use ES modules (import/export)
- Use 4-space indentation
- Use single quotes for strings
- Always use semicolons
- Follow the existing code style

## Testing

When adding new features, please include appropriate tests. Run tests with:

```bash
npm test
```

## Documentation

- Update the README.md if your changes affect how users interact with the project
- Comment your code, especially complex logic
- Use JSDoc comments for functions and classes
- Update API documentation if applicable

## Reporting Bugs

When reporting bugs, please include:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Environment information:
   - OS version
   - Node.js version
   - npm version
   - VanMoof bike model (if relevant)

## Feature Requests

We welcome feature requests! Please provide:

1. A clear and descriptive title
2. Detailed description of the feature
3. Rationale for why this feature would be beneficial
4. Any relevant examples or mock-ups

Thank you for contributing to Moofed! ❤️ 