# Welcome to the OpenClaw Doc Viewer Contributing Guide!

👋 Thank you for your interest in contributing to OpenClaw Doc Viewer!

This guide will help you get started with contributing.

---

## 🚀 Quick Start

### 1. Fork the Repository

Click the "Fork" button at the top right of this page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/OpenClaw-doc-viewer.git
cd OpenClaw-doc-viewer
```

### 3. Set Up Development Environment

```bash
# Install dependencies
make install

# Start development servers
make dev
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

---

## 📋 How to Contribute

### Code Contributions

1. **Find an Issue**
   - Look for issues labeled "help wanted" or "good first issue"
   - Or create a new issue for your idea

2. **Make Changes**
   - Follow our coding standards
   - Add tests if applicable
   - Update documentation

3. **Test Your Changes**
   ```bash
   make test
   make lint
   ```

4. **Submit a PR**
   - Use our PR template
   - Link related issues
   - Wait for review

### Documentation Contributions

1. **Find Documentation Issues**
   - Look for issues labeled "documentation"
   - Or improve existing docs

2. **Make Changes**
   - Follow our documentation style
   - Keep it clear and concise
   - Add examples when helpful

3. **Submit a PR**

### Translation Contributions

1. **See Our Translation Guide**
   - Check [docs/TRANSLATION.md](docs/TRANSLATION.md)

2. **Add or Improve Translations**
   - Translate README.md to your language
   - Or improve existing translations

3. **Submit a PR**

---

## 📐 Coding Standards

### JavaScript/TypeScript

- Use ESLint configuration (`.eslintrc.json`)
- Use Prettier for formatting (`.prettierrc`)
- Write meaningful commit messages

### Commit Messages

We use conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

Example:
```bash
git commit -m "feat(search): Add advanced search filters"
```

---

## 🧪 Testing

### Run Tests

```bash
# All tests
make test

# Backend tests
cd workspace/backend && npm test

# Frontend tests
cd workspace/frontend && npm run test
```

### Write Tests

- Add tests for new features
- Update tests for bug fixes
- Aim for good coverage

---

## 📝 Documentation

### Documentation Standards

- Use clear, simple language
- Include examples
- Keep it up to date
- Add translations when possible

### Build Documentation

```bash
make docs
```

---

## 🤝 Code Review

### Review Process

1. **Automated Checks**
   - CI/CD pipeline must pass
   - Linting must pass
   - Tests must pass

2. **Human Review**
   - Maintainer will review your PR
   - Feedback will be provided
   - Address comments and update PR

3. **Merge**
   - PR will be merged when approved
   - You'll be credited as a contributor

---

## 🎯 Good First Issues

Look for issues labeled:
- 🟢 `good first issue` - Perfect for beginners
- 🔵 `help wanted` - Need community help
- 🟡 `documentation` - Documentation improvements

---

## 💬 Communication

### Getting Help

- **GitHub Discussions**: https://github.com/xiaodong-l/OpenClaw-doc-viewer/discussions
- **Discord**: [Join our server](https://discord.gg/openclaw) (coming soon)
- **Email**: hello@openclaw.ai

### Code of Conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🏆 Recognition

Contributors are recognized in:

- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Release notes
- GitHub contributors page

---

## ❓ FAQ

### Q: I'm new to open source. Can I still contribute?

**A:** Absolutely! Start with "good first issue" labels and don't hesitate to ask for help.

### Q: How long does review take?

**A:** Typically 1-5 days. Please be patient.

### Q: Can I contribute without coding?

**A:** Yes! Documentation, translations, and bug reports are all valuable contributions.

---

## 🎉 Thank You!

Every contribution, no matter how small, makes a difference.

Happy contributing! 🚀

---

*For more details, see our full [Contributing Guide](CONTRIBUTING.md).*
