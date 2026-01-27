# CI/CD & Version Control

Guide for version control and deployment workflows for Shopify themes.

## Version Control Setup

### Git Initialization

```bash
# Initialize repository
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Shopify
config/settings_data.json
.shopify/

# Dependencies
node_modules/

# Build artifacts
.cache/
dist/

# OS files
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
EOF

# Initial commit
git add .
git commit -m "Initial theme setup"
```

### Branch Strategy

```
main (production)
├── staging (pre-production testing)
└── develop (active development)
    ├── feature/hero-section
    ├── feature/cart-drawer
    └── fix/mobile-menu
```

### Commit Convention

```bash
# Format: type(scope): description

# Types:
# feat: New feature
# fix: Bug fix
# docs: Documentation
# style: Formatting
# refactor: Code restructuring
# perf: Performance improvement
# test: Testing
# chore: Maintenance

# Examples:
git commit -m "feat(product): add variant picker component"
git commit -m "fix(cart): resolve quantity update issue"
git commit -m "perf(images): implement lazy loading"
git commit -m "docs(readme): update installation instructions"
```

---

## Shopify CLI Workflow

### Installation

```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Authenticate
shopify auth login --store your-store.myshopify.com
```

### Development Workflow

```bash
# Start development server
shopify theme dev --store your-store.myshopify.com

# Push changes to theme
shopify theme push

# Pull remote changes
shopify theme pull

# Check theme
shopify theme check
```

### Theme Management

```bash
# List themes
shopify theme list

# Create new theme from current directory
shopify theme push --unpublished --json

# Push to specific theme
shopify theme push --theme 123456789

# Download theme
shopify theme pull --theme 123456789
```

---

## GitHub Actions CI/CD

### Basic Workflow

```yaml
# .github/workflows/theme-check.yml
name: Theme Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  theme-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'

      - name: Install Theme Check
        run: gem install theme-check

      - name: Run Theme Check
        run: theme-check --fail-level error
```

### Full CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Theme

on:
  push:
    branches:
      - main
      - staging

env:
  SHOPIFY_CLI_THEME_TOKEN: ${{ secrets.SHOPIFY_CLI_THEME_TOKEN }}
  SHOPIFY_STORE: ${{ secrets.SHOPIFY_STORE }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'

      - name: Install Theme Check
        run: gem install theme-check

      - name: Run Theme Check
        run: theme-check --fail-level error

  deploy-staging:
    needs: lint
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Shopify CLI
        run: npm install -g @shopify/cli @shopify/theme

      - name: Deploy to Staging Theme
        run: |
          shopify theme push \
            --theme ${{ secrets.STAGING_THEME_ID }} \
            --store ${{ env.SHOPIFY_STORE }} \
            --allow-live

  deploy-production:
    needs: lint
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Shopify CLI
        run: npm install -g @shopify/cli @shopify/theme

      - name: Deploy to Production
        run: |
          shopify theme push \
            --theme ${{ secrets.PRODUCTION_THEME_ID }} \
            --store ${{ env.SHOPIFY_STORE }} \
            --allow-live
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Lighthouse CI
        run: npm install -g @lhci/cli

      - name: Run Lighthouse
        run: |
          lhci autorun --config=lighthouserc.json
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["https://your-store.myshopify.com/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.7}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.9}],
        "categories:seo": ["warn", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

## Environment Configuration

### GitHub Secrets

```bash
# Required secrets:
SHOPIFY_CLI_THEME_TOKEN  # Theme Access API token
SHOPIFY_STORE            # Store URL (your-store.myshopify.com)
STAGING_THEME_ID         # Theme ID for staging
PRODUCTION_THEME_ID      # Theme ID for production
```

### Creating Theme Access Token

1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps"
3. Create app with "Read and write access" to Themes
4. Install app and copy access token

---

## Multi-Store Setup

### Managing Multiple Stores

```yaml
# .github/workflows/multi-store.yml
name: Deploy to Multiple Stores

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        store:
          - name: us-store
            url: us-store.myshopify.com
            theme_id: ${{ secrets.US_THEME_ID }}
            token: ${{ secrets.US_THEME_TOKEN }}
          - name: uk-store
            url: uk-store.myshopify.com
            theme_id: ${{ secrets.UK_THEME_ID }}
            token: ${{ secrets.UK_THEME_TOKEN }}
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to ${{ matrix.store.name }}
        run: |
          shopify theme push \
            --theme ${{ matrix.store.theme_id }} \
            --store ${{ matrix.store.url }}
        env:
          SHOPIFY_CLI_THEME_TOKEN: ${{ matrix.store.token }}
```

---

## Release Management

### Semantic Versioning

```bash
# Version format: MAJOR.MINOR.PATCH
# v1.0.0 - Initial release
# v1.1.0 - New features (backward compatible)
# v1.1.1 - Bug fixes
# v2.0.0 - Breaking changes

# Create release tag
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

### Changelog Generation

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate Changelog
        id: changelog
        uses: conventional-changelog/standard-version@v1

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: ${{ steps.changelog.outputs.changelog }}
```

---

## Local Development

### Package.json Scripts

```json
{
  "name": "my-shopify-theme",
  "version": "1.0.0",
  "scripts": {
    "dev": "shopify theme dev",
    "build": "echo 'No build step required'",
    "lint": "theme-check",
    "lint:fix": "theme-check --auto-correct",
    "push": "shopify theme push",
    "pull": "shopify theme pull",
    "share": "shopify theme share",
    "test": "npm run lint"
  },
  "devDependencies": {}
}
```

### Pre-commit Hooks

```bash
# Install husky
npm install -D husky lint-staged

# Setup hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.liquid": "theme-check",
    "*.json": "prettier --check"
  }
}
```

---

## Backup & Recovery

### Automated Backups

```yaml
# .github/workflows/backup.yml
name: Daily Backup

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Shopify CLI
        run: npm install -g @shopify/cli @shopify/theme

      - name: Download Theme
        run: |
          mkdir backup
          cd backup
          shopify theme pull --theme ${{ secrets.PRODUCTION_THEME_ID }}

      - name: Create Backup Archive
        run: |
          tar -czf theme-backup-$(date +%Y%m%d).tar.gz backup/

      - name: Upload Backup
        uses: actions/upload-artifact@v4
        with:
          name: theme-backup-${{ github.run_id }}
          path: theme-backup-*.tar.gz
          retention-days: 30
```

### Recovery Process

```bash
# Pull from backup
git checkout <commit-hash>

# Or restore from downloaded backup
unzip theme-backup.zip

# Push to theme
shopify theme push --theme <theme-id>
```

---

## Best Practices

1. **Never commit `settings_data.json`** - Contains store-specific settings
2. **Use feature branches** - Keep main/develop clean
3. **Run theme-check before pushing** - Catch errors early
4. **Use environments** - Separate staging and production
5. **Automate deployments** - Reduce human error
6. **Keep backups** - Automated daily backups
7. **Document changes** - Use conventional commits
