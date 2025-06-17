# 🚨 CRITICAL WORKFLOW UPDATE FOR ALL AI AGENTS

## 📋 **Situation Summary**

**MERGE CONFLICTS OCCURRED** due to ClaudeSquad worktrees being based on outdated commits. PRs #4 and #5 required conflict resolution because they were created from commits before our CI/CD infrastructure was added.

**ROOT CAUSE**: ClaudeSquad worktrees were created from commit `5ea3cb2` (June 16) but main branch has advanced to `48eed91` with major CI/CD infrastructure including changesets, GitHub Actions, and updated dependencies.

## ⚠️ **IMMEDIATE ACTION REQUIRED**

Before starting ANY new work, you MUST update your worktree to the latest main branch.

### **🔧 MANDATORY COMMANDS - Run These First**

```bash
# 1. Switch to your feature branch
git checkout session/feat/your-task-name

# 2. Download latest commits from GitHub (doesn't change your files yet)
git fetch origin main

# 3. Move your branch to be based on latest main (THIS IS THE KEY STEP)
git rebase origin/main

# 4. Push the updated branch (force is safe here since you're updating your own feature branch)
git push --force-with-lease origin session/feat/your-task-name
```

### **🎯 What Each Command Does**

1. **`git checkout`**: Switches your workspace to show your feature branch files
2. **`git fetch`**: Downloads new commits from GitHub without changing your local files  
3. **`git rebase`**: Moves your feature commits to start from latest main instead of old main
4. **`git push --force-with-lease`**: Updates your remote branch safely

### **📊 Before vs After Rebase**

**BEFORE (Causes Conflicts):**
```
main (latest):    A---B---C---[CI/CD Infrastructure]---[Latest Main]
                       \
your feature:           [Your Work] (based on old main)
```

**AFTER (No Conflicts):**
```
main (latest):    A---B---C---[CI/CD Infrastructure]---[Latest Main]
                                                              \
your feature:                                                  [Your Work] (based on latest)
```

## 🚨 **CONFLICT PREVENTION RULES**

### **Rule 1: ALWAYS Rebase Before Starting Work**
- Run the 4 commands above before touching any code
- This ensures you're working with the latest infrastructure

### **Rule 2: Check teams/SHARED.md Before package.json Changes**
- Announce if you plan to add dependencies
- Coordinate with other agents to avoid simultaneous package.json modifications

### **Rule 3: Rebase Again Before Creating PR**
- Run the same 4 commands before `gh pr create`
- This ensures your PR will merge cleanly

## 🛠️ **What If You Get Conflicts During Rebase?**

If `git rebase origin/main` shows conflicts:

```bash
# 1. Check which files have conflicts
git status

# 2. Open conflicted files and resolve conflicts
# Look for <<<<<<< HEAD, =======, >>>>>>> markers
# Keep both changes when possible (e.g., in package.json dependencies)

# 3. After resolving conflicts in each file:
git add <resolved-file>

# 4. Continue the rebase
git rebase --continue

# 5. If more conflicts, repeat steps 2-4
# If you get stuck, ask for help in teams/SHARED.md
```

## 📦 **Package.json Conflict Resolution Strategy**

When you see package.json conflicts:

### **Dependencies Section**
- **KEEP BOTH** - merge all dependencies together
- **Example**: If main has `@changesets/cli` and your branch has `@ai-sdk/openai`, keep both

### **Scripts Section**  
- **KEEP BOTH** - merge all scripts together
- **Example**: If main has changeset scripts and your branch has dev scripts, keep both

### **DevDependencies Section**
- **KEEP BOTH** - merge all devDependencies together

### **Example Resolution**
```json
{
  "dependencies": {
    "@ai-sdk/openai": "^1.3.22",      // ← Your feature
    "@auth/core": "0.37.0",           // ← Your feature  
    "@changesets/cli": "^2.29.4",     // ← CI/CD infrastructure
    "@convex-dev/auth": "^0.0.87",    // ← Keep existing
    // ... keep all dependencies
  },
  "scripts": {
    "dev": "next dev",                // ← Keep existing
    "changeset": "changeset",         // ← CI/CD infrastructure
    "changeset:add": "./scripts/safe-commands.sh add",  // ← CI/CD
    // ... keep all scripts
  }
}
```

## 🔄 **Updated Task Workflow**

### **Modified ClaudeSquad Process**

```markdown
1. **Before Starting Task**:
   - git checkout session/feat/task-name
   - git fetch origin main  
   - git rebase origin/main
   - git push --force-with-lease

2. **During Development**:
   - Make your changes as normal
   - Test your changes
   - Follow existing code standards

3. **Before Creating PR**:
   - git fetch origin main
   - git rebase origin/main  
   - git push --force-with-lease
   - gh pr create (now guaranteed to be conflict-free)

4. **After PR Creation**:
   - Update teams/task-name/STATUS.md
   - Monitor for review feedback
```

## 🎯 **Why This Happened**

1. **ClaudeSquad worktrees** were created from commit `5ea3cb2` (before CI/CD)
2. **Main branch advanced** with commit `8073cac` (CI/CD infrastructure)  
3. **Feature PRs** tried to merge old code with new infrastructure
4. **Git couldn't auto-merge** because starting points were different

## ✅ **Success Metrics**

After following this workflow:
- ✅ No merge conflicts on PR creation
- ✅ Clean integration with CI/CD infrastructure  
- ✅ All dependencies properly merged
- ✅ Fast PR review and merge process

## 🆘 **When to Ask for Help**

**Ask in teams/SHARED.md if:**
- Rebase shows conflicts you can't resolve
- You're unsure about keeping/removing code during conflict resolution
- Commands fail with errors you don't understand
- You need to coordinate package.json changes with other agents

## 🔗 **Reference Commands Quick Sheet**

```bash
# Update to latest main (run before starting work)
git checkout session/feat/your-task
git fetch origin main
git rebase origin/main
git push --force-with-lease

# Check current status
git status
git log --oneline -5

# If conflicts during rebase
git status  # see conflicted files
# resolve conflicts in editor
git add <resolved-file>
git rebase --continue

# Emergency abort (if you get completely stuck)
git rebase --abort
# Then ask for help in teams/SHARED.md
```

---

## 🎯 **BOTTOM LINE**

**ALWAYS run the 4 rebase commands before starting work and before creating PRs. This prevents 99% of merge conflicts.**

**Last Updated**: June 17, 2025  
**Required Reading**: ALL AI agents must acknowledge reading this  
**Questions**: Post in teams/SHARED.md for clarification

---

## ✅ **Agent Acknowledgment**

When you've read and understood this document:
1. Update your teams/task-name/STATUS.md with "✅ Workflow update acknowledged"
2. Run the rebase commands on your current branch
3. Confirm your branch is now based on latest main