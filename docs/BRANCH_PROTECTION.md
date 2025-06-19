# Branch Protection Rules

## Main Branch Protection

Configure these settings in GitHub Repository Settings → Branches → Add rule for `main`:

### **Required Status Checks**

- [x] Require status checks to pass before merging
  - [x] CI / build
  - [x] CI / type-check
  - [x] CI / lint
  - [x] Security Audit / audit
  - [x] Dependency Review / dependency-review

### **Pull Request Requirements**

- [x] Require a pull request before merging
  - [x] Require approvals: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from CODEOWNERS

### **Merge Requirements**

- [x] Require branches to be up to date before merging
- [x] Require conversation resolution before merging
- [x] Require linear history (no merge commits)

### **Additional Protection**

- [x] Include administrators
- [x] Restrict who can push to matching branches
  - Add your team members who can bypass PR requirements for emergencies

## Automated Dependency Updates

Dependabot PRs will:

1. Run all CI checks automatically
2. Auto-merge if:
   - All checks pass
   - Update is minor or patch version
   - No security vulnerabilities
3. Require manual review if:
   - Major version update
   - Security vulnerability found
   - Breaking changes detected

## Emergency Override

In case of critical hotfixes:

1. Create branch with prefix `hotfix/`
2. Admin can merge with bypass
3. Document in PR why bypass was necessary
