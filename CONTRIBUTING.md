# Contributing to OnboardBot 🤝

Thank you for your interest in contributing to **OnboardBot**! Whether you're fixing bugs, adding features, improving documentation, or sharing ideas — every contribution matters.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project follows a welcoming and inclusive community standard. By participating, you agree to:

- **Be respectful** — Treat all contributors with kindness and professionalism
- **Be constructive** — Offer helpful feedback and collaborate openly
- **Be inclusive** — Welcome diverse perspectives and experience levels

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/On-Boarding-Bot.git
   cd On-Boarding-Bot
   ```
3. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## How to Contribute

### 🐛 Bug Fixes
- Check existing [Issues](https://github.com/aasish3187/On-Boarding-Bot/issues) first
- If none exists, create a new issue describing the bug
- Reference the issue number in your PR

### ✨ New Features
- Open a [Feature Request](https://github.com/aasish3187/On-Boarding-Bot/issues/new) issue first
- Discuss the design and approach before writing code
- Follow the existing architecture patterns

### 📝 Documentation
- Fix typos, improve explanations, add examples
- Documentation PRs are always welcome and don't require an issue

### 🎨 UI/UX Improvements
- Follow the existing Glassmorphism / LiquidGlass design language
- Ensure changes look great in both Dark and Light modes
- Test on multiple screen sizes

---

## Development Setup

### Prerequisites
- **Node.js** v18+
- **Python** v3.10+
- **Groq Cloud API Key** (free at [console.groq.com](https://console.groq.com))

### Backend
```bash
cd onboardbot_v2
python -m venv venv
.\venv\Scripts\activate       # Windows
# source venv/bin/activate    # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `onboardbot_v2/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_jwt_secret_here
```

---

## Pull Request Process

1. **Update your branch** with the latest `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. **Test your changes** thoroughly — both frontend and backend
3. **Write clear commit messages**:
   ```
   feat: add hardware order form widget
   fix: resolve CORS error on deployed Vercel domain
   docs: update README with deployment instructions
   ```
4. **Create a Pull Request** with:
   - A descriptive title
   - Summary of changes
   - Screenshots (for UI changes)
   - Reference to any related issues
5. **Wait for review** — maintainers will review and provide feedback

---

## Style Guide

### Python (Backend)
- Follow **PEP 8** conventions
- Use **type hints** for function signatures
- Keep functions focused and under 50 lines where possible
- Use descriptive variable names

### JavaScript/React (Frontend)
- Use **functional components** with hooks
- Follow existing naming conventions (PascalCase for components, camelCase for functions)
- Keep components modular and reusable
- Use **Tailwind CSS** utility classes consistently

### Git Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):
| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructuring |
| `test:` | Adding or fixing tests |
| `chore:` | Maintenance tasks |

---

## Reporting Issues

When creating an issue, please include:

- **Description** — What happened vs. what you expected
- **Steps to Reproduce** — Clear numbered steps
- **Environment** — OS, browser, Node/Python version
- **Screenshots** — If applicable
- **Error Logs** — Console output or server logs

---

## 💡 Ideas for First Contributions

Looking for a place to start? Check out issues labeled:
- [`good first issue`](https://github.com/aasish3187/On-Boarding-Bot/issues?q=label%3A%22good+first+issue%22) — Simple, well-scoped tasks
- [`help wanted`](https://github.com/aasish3187/On-Boarding-Bot/issues?q=label%3A%22help+wanted%22) — Areas where we need community support
- [`documentation`](https://github.com/aasish3187/On-Boarding-Bot/issues?q=label%3A%22documentation%22) — Docs improvements

---

## 🙏 Thank You

Every contribution, no matter how small, helps make OnboardBot better. We appreciate your time and effort!

**Happy coding!** 🚀
