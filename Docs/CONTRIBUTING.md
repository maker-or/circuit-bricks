# Contributing to Circuit-Bricks

Thank you for your interest in contributing to Circuit-Bricks! This document contains guidelines for contributing code, reporting issues, and requesting features.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## How to Contribute

### Reporting Issues

If you encounter a bug or have a suggestion for improvement:

1. Check if the issue already exists in the [issue tracker](https://github.com/sphere-labs/circuit-bricks/issues)
2. If not, create a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the issue
   - Expected vs. actual behavior
   - Screenshots (if applicable)
   - Any relevant code snippets
   - Your environment (browser, React version, etc.)

### Feature Requests

We welcome suggestions for new features. When submitting a feature request:

1. Provide a clear, descriptive title
2. Explain the use case and benefits
3. Include mockups or examples if possible
4. Note whether you're willing to help implement it

### Pull Requests

We welcome pull requests for bug fixes, features, and improvements:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Add/update tests as necessary
5. Ensure all tests pass (`npm test`)
6. Commit your changes with a descriptive message
7. Push your branch (`git push origin feature/my-feature`)
8. Open a pull request

#### Pull Request Guidelines

- Keep PRs focused on a single feature or bug fix
- Follow the existing code style
- Include tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/yourusername/circuit-bricks.git
   cd circuit-bricks
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Project Structure

Understanding the project structure will help you contribute effectively:

```
src/
├─ index.ts                 # Main exports
├─ types.ts                 # Core type definitions
├─ core/                    # Core rendering components
│  ├─ BaseComponent.tsx     # Base SVG rendering
│  ├─ Brick.tsx             # Schema to component mapper
│  ├─ Port.tsx              # Port rendering
│  ├─ WirePath.tsx          # Wire path rendering
│  └─ CircuitCanvas.tsx     # Main canvas component
├─ registry/                # Component schema registry
│  ├─ index.ts              # Registry API
│  └─ components/           # Component schema definitions
│     ├─ resistor.json      # Example component schema
│     └─ ...
├─ hooks/                   # React hooks
│  ├─ useCircuit.ts         # Circuit state management
│  └─ usePortPosition.ts    # Port position tracking
├─ ui/                      # Optional UI components
│  ├─ PropertyPanel.tsx     # Component property editor
│  ├─ ComponentPalette.tsx  # Component selection palette
│  └─ CircuitToolbar.tsx    # Actions toolbar
└─ utils/                   # Utility functions
   ├─ getPortPosition.ts    # DOM position helpers
   └─ circuitValidation.ts  # Circuit validation utilities
```

## Code Guidelines

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all public APIs
- Avoid `any` types when possible
- Use correct React prop types

### React Patterns

- Use functional components with hooks
- Memoize expensive computations
- Use `React.memo` for pure components
- Avoid unnecessary renders
- Follow React best practices for state management

### Testing

- Write unit tests for new functionality
- Include UI component tests where appropriate
- Test edge cases and error states
- Maintain good test coverage

## Creating a New Component Schema

When adding a new component schema:

1. Create a new JSON file in `src/registry/components/`
2. Follow the `ComponentSchema` interface
3. Use existing components as templates
4. Design clear, scalable SVG path data
5. Include all necessary ports and properties
6. Register the component in `src/registry/index.ts`
7. Add the component to unit tests

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/) (semver) for releases:

- MAJOR version for incompatible API changes (1.0.0)
- MINOR version for backward-compatible functionality additions (0.1.0)
- PATCH version for backward-compatible bug fixes (0.0.1)

### Creating a Release

For maintainers with release access:

1. Ensure all tests pass and the build is successful
2. Update the version in `package.json` according to semver
3. Update `CHANGELOG.md` with the changes in the new version
4. Commit the version bump and changelog update
5. Create a git tag for the version:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   ```
6. Push the commit and tag:
   ```bash
   git push origin main
   git push origin v1.0.0
   ```
7. Create a GitHub release with the same version and description
8. Publish to npm:
   ```bash
   npm publish
   ```

## Documentation Guidelines

When updating documentation:

1. Keep the language clear and concise
2. Include code examples for all features
3. Update API references when interfaces change
4. Ensure examples work as described
5. Use proper Markdown formatting

## Community

- Join our [Discord server](https://discord.gg/sphere-labs) for discussion
- Follow updates on [Twitter](https://twitter.com/sphere_labs)
- Check out our [blog](https://blog.sphere-labs.com) for announcements

## License

By contributing to Circuit-Bricks, you agree that your contributions will be licensed under the project's MIT License.
