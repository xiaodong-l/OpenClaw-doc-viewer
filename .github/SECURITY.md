# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the severity of the vulnerability.

| Version | Supported          |
| ------- | ------------------ |
| 1.3.x   | :white_check_mark: |
| 1.2.x   | :white_check_mark: |
| 1.1.x   | :x:                |
| 1.0.x   | :x:                |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take all security bugs seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email at: **security@openclaw.ai**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Preferred Languages

We prefer all communications to be in English or Chinese.

## Security Best Practices

### For Users

1. **Change Default Passwords**: Always change the default admin password after installation
2. **Use Strong JWT Secrets**: Generate a strong, random JWT secret for production
3. **Enable HTTPS**: Always use HTTPS in production environments
4. **Keep Updated**: Regularly update to the latest version
5. **Review Permissions**: Carefully configure user roles and permissions

### For Contributors

1. **No Secrets in Code**: Never commit API keys, passwords, or other secrets
2. **Validate Input**: Always validate and sanitize user input
3. **Use Prepared Statements**: Use parameterized queries for database operations
4. **Follow Security Guidelines**: Adhere to our security coding guidelines

## Security Updates

We will notify users of security vulnerabilities via:
- GitHub Security Advisories
- Release notes
- Email notifications (for enterprise customers)

## Recognition

We appreciate responsible disclosure and will acknowledge your contribution (unless you prefer to remain anonymous).

## Contact

For any questions about this security policy, please contact:
- Email: security@openclaw.ai
- GitHub: @xiaodong-l

---

*Last updated: 2026-03-15*
