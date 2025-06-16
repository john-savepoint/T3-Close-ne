# GitHub Branch Protection Setup

Since branch protection rules must be configured through the GitHub web interface, here are the exact settings to apply:

## Main Branch Protection Rules

Navigate to: **Settings** → **Branches** → **Add rule**

### Rule Configuration:

**Branch name pattern:** `main`

### Protection Settings:

- ✅ **Require a pull request before merging**

  - ✅ Require approvals: `1`
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners
  - ✅ Restrict pushes that create files that change code owner lines

- ✅ **Require status checks to pass before merging**

  - ✅ Require branches to be up to date before merging
  - **Required status checks:**
    - `quality` (from CI workflow)
    - `Security audit` (pnpm audit)
    - `Type check`
    - `Lint`
    - `Format check`
    - `Build`

- ✅ **Require conversation resolution before merging**

- ✅ **Require signed commits**

- ✅ **Require linear history**

- ✅ **Include administrators** (enforces rules for repo admins)

- ✅ **Restrict pushes** (only allow via PR)

### Auto-merge Support:

- ✅ **Allow auto-merge**
- ✅ **Allow squash merging**
- ✅ **Allow merge commits** (for changesets release PRs)
- ❌ **Allow rebase merging** (disabled for cleaner history)

## Additional Security Settings

### Repository Settings → General:

- ✅ **Automatically delete head branches** (cleanup after merge)
- ✅ **Allow merge commits** (needed for release automation)
- ✅ **Allow squash merging** (default for feature PRs)

### Repository Settings → Actions:

- ✅ **Allow GitHub Actions to create and approve pull requests**
- ✅ **Allow GitHub Actions to approve pull requests**

## Apply These Settings:

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Branches** in sidebar
4. Click **Add rule**
5. Copy the settings above exactly

This will enforce:

- All changes go through PRs
- All CI checks must pass
- Auto-merge works for approved PRs
- Linear commit history
- No direct pushes to main
