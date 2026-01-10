# Contributing to Intent2Commit

Thank you for your interest in contributing! This project aims to transform how developers capture and preserve intent in version control.

## How to Contribute

### Reporting Bugs
- Use GitHub Issues
- Include steps to reproduce
- Provide system information (OS, Node version, Git version)

### Suggesting Features
- Open a GitHub Issue with the `enhancement` label
- Describe the use case and expected behavior
- Explain how it aligns with the project philosophy

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with Intent2Commit! (`intent commit`)
6. Push to your branch
7. Open a Pull Request

### Code Style
- Use consistent formatting (Prettier recommended)
- Add comments for complex logic
- Follow existing module structure

### Module Guidelines

| Module | Purpose |
|--------|---------|
| `capture.js` | Intent storage before code changes |
| `analyzer.js` | Git diff analysis |
| `alignment.js` | Intent-change validation (core innovation) |
| `commit-generator.js` | Decision-aware commit messages |
| `ledger.js` | Permanent intent history |

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/intent2commit.git
cd intent2commit

# Install dependencies
npm install

# Link for local testing
npm link

# Test in any Git repository
cd /path/to/test/repo
intent "test the CLI"
```

## Philosophy

Contributions should align with the core philosophy:
> Preserve human intent as a first-class primitive in version control

Avoid:
- Feature creep that dilutes the core purpose
- Adding AI dependencies unless absolutely necessary
- Breaking the simplicity of the workflow

## Community

- Be respectful and constructive
- Help newcomers understand the paradigm shift
- Share your Intent2Commit workflows!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Let's build the future of intent-driven development together!**
