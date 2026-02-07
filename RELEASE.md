# Talos CLI - Release Workflow

## Overview

This project uses a **Git Flow** approach with automated version management. The `develop` branch is for active development, and `main` branch contains only versioned releases.

## Branch Structure

```
develop  → (work here)
   ↓
  [PR]   → (auto version bump)
   ↓
main     → (auto publish to NPM)
```

## Workflow Steps

### 1. Development in `develop` branch

All development work happens in the `develop` branch:

```bash
git checkout develop
# Make your changes
git add .
git commit -m "feat: add new feature"
git push origin develop
```

### 2. Create PR from `develop` to `main`

When ready to release, create a Pull Request:

```bash
# On GitHub: Create PR from develop → main
```

**Add a label to specify the version bump type:**

| Label           | Version Change          | Format | Example       |
| --------------- | ----------------------- | ------ | ------------- |
| `major`         | Major version           | X.0.0  | 1.0.0 → 2.0.0 |
| `minor`         | Minor version           | 0.X.0  | 1.0.0 → 1.1.0 |
| `patch`         | Patch version (default) | 0.0.X  | 1.0.0 → 1.0.1 |
| `version:X.Y.Z` | Custom version          | Any    | 1.0.0 → 2.5.3 |

**Quick examples:**

- Bump MAJOR: Add label `major`
- Bump MINOR: Add label `minor`
- Bump PATCH: No label (default)
- Set exact version 2.5.0: Add label `version:2.5.0`
- Set exact version 1.0.0: Add label `version:1.0.0`

### 3. Automatic Version Bump

Once the PR is created (or labeled), GitHub Actions will:

1. ✅ Detect the version bump type from PR labels
2. ✅ Bump the version in `package.json` and `pnpm-lock.yaml`
3. ✅ Commit the version bump to the `develop` branch
4. ✅ Comment on the PR with the new version
5. ✅ Add `version-bumped` label

The bot will commit something like:

```
chore: bump version to 0.2.0
```

### 4. Merge to `main`

After the version bump commit is pushed:

1. Review the PR
2. Merge to `main`

**Result**: The `main` branch now has a clean commit with only the version change.

### 5. Automatic Publish to NPM

When the PR is merged to `main`:

1. ✅ GitHub Actions detects the `package.json` change
2. ✅ Runs tests and type checking
3. ✅ Builds the package
4. ✅ Creates a git tag (e.g., `v0.2.0`)
5. ✅ Publishes to NPM with provenance

## Quick Reference

### Common Commands

```bash
# Start working on a new feature
git checkout develop
git pull origin develop

# Create a PR (use GitHub UI)
# Add label: major, minor, or patch

# After merge, sync develop with main
git checkout develop
git merge main
git push origin develop
```

### PR Labels

Use labels to control version bumping:

| Label           | What it does        | Format        | Example                 |
| --------------- | ------------------- | ------------- | ----------------------- |
| `major`         | Bumps major version | 1.0.0 → 2.0.0 | Breaking API changes    |
| `minor`         | Bumps minor version | 1.0.0 → 1.1.0 | New features            |
| `patch`         | Bumps patch version | 1.0.0 → 1.0.1 | Bug fixes (default)     |
| `version:X.Y.Z` | Sets exact version  | Any           | `version:2.5.3` → 2.5.3 |

**How to use:**

1. Create PR from `develop` → `main`
2. Add one label from the table above
3. GitHub Actions auto-bumps the version and commits
4. Merge the PR
5. NPM publish happens automatically!

## GitHub Actions Workflows

### Version Bump (`.github/workflows/version-bump.yml`)

**Triggers**: PR to `main` from `develop`

**Actions**:

- Determines version bump type from labels
- Updates `package.json` version
- Commits back to PR branch
- Comments on PR with new version

### Publish (`.github/workflows/publish.yml`)

**Triggers**: Push to `main` (when `package.json` changes)

**Actions**:

- Runs tests and type check
- Builds the package
- Creates git tag
- Publishes to NPM

## Important Notes

1. **Never commit directly to `main`** - Only merge via PRs from `develop`
2. **Always add a version label to PRs** - Default is `patch` if omitted
3. **The version bump is automatic** - Don't manually change `package.json` version
4. **Main branch only has version commits** - All feature work stays in `develop`

## Troubleshooting

### Version didn't bump

- Check PR is from `develop` to `main`
- Ensure GitHub Actions has write permissions
- Check workflow logs in Actions tab

### Publish failed

- Verify NPM credentials (Trusted Publisher should be configured)
- Check if version tag already exists
- Review workflow logs

### Need to skip a publish

- Add `[skip ci]` to commit message before merging to main
- Or manually delete the version tag if already created

## Setup Required

### 1. Create `develop` branch

```bash
git checkout -b develop
git push -u origin develop
```

### 2. Set `main` as default branch on GitHub

Settings → Branches → Default branch → `main`

### 3. Enable branch protection (optional but recommended)

Settings → Branches → Add rule for `main`:

- ✅ Require pull request before merging
- ✅ Require status checks to pass
- ✅ Require branches to be up to date

### 4. Enable GitHub Actions permissions

Settings → Actions → General:

- Workflow permissions: **Read and write permissions**
- ✅ Allow GitHub Actions to create and approve pull requests

## Example Flow

```bash
# 1. Make changes in develop
git checkout develop
git pull
echo "// new code" >> src/index.ts
git commit -am "feat: add awesome feature"
git push

# 2. Create PR on GitHub (develop → main)
# 3. Add label "minor" to the PR
# 4. Wait for version bump bot to commit
# 5. Review and merge PR
# 6. Package automatically publishes to NPM! 🚀
```

## Version Strategy (Semantic Versioning)

Follow [SemVer](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features (backward compatible)
- **PATCH** (0.0.X): Bug fixes

Current version: `0.1.13` → Pre-1.0 (API not stable yet)
