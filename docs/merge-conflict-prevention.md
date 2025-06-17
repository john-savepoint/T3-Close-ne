# Merge Conflict Prevention Strategy

## 🎯 **Core Principles**

### **1. Rebase Before Merge (MANDATORY)**
```bash
# Before creating PR or before merge
git checkout feature-branch
git fetch origin
git rebase origin/main
git push --force-with-lease origin feature-branch
```

### **2. Infrastructure Changes Communication**
- Announce major infrastructure changes in `teams/SHARED.md`
- Pause feature work during infrastructure updates
- Coordinate `package.json` changes through single person

### **3. Package.json Change Protocol**
```bash
# For any package.json changes:
1. Check teams/SHARED.md for pending changes
2. Announce your change in teams/SHARED.md
3. Coordinate with other agents working on dependencies
4. Complete change within 2 hours or pause other work
```

## 🔄 **Workflow Implementation**

### **Modified ClaudeSquad Workflow**
```markdown
1. Start task → Check teams/SHARED.md for conflicts
2. Before package.json changes → Announce in SHARED.md
3. Before creating PR → Rebase with main
4. PR creation → Auto-check for conflicts
5. Before merge → Final rebase check
```

### **GitHub Branch Protection Update**
- Require "Require branches to be up to date before merging"
- Add status check for "No conflicts with main"
- Enable "Automatically delete head branches"

### **Automated Conflict Detection**
```yaml
# .github/workflows/conflict-check.yml
name: Conflict Detection
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  check-conflicts:
    runs-on: ubuntu-latest
    steps:
      - name: Check for conflicts
        run: git merge-tree $(git merge-base HEAD main) HEAD main
```

## 📋 **File-Specific Strategies**

### **package.json Management**
- **Single Source of Truth**: Only main branch modifications
- **Coordination Required**: Announce all dependency changes
- **Batch Changes**: Group dependency updates together
- **Lock Coordination**: Regenerate lockfile after merges

### **Configuration Files**
- `.github/workflows/*` - Infrastructure team only
- `convex/schema.ts` - Additive changes only, coordinate major changes  
- `types/*.ts` - Additive interfaces only, no modifications

### **Shared Components**
- `components/ui/*` - NO MODIFICATIONS (established rule)
- `hooks/use-*.ts` - New hooks only, coordinate modifications
- `lib/*.ts` - New utilities only, coordinate modifications

## 🚨 **Conflict Resolution Process**

### **When Conflicts Occur**
```bash
# 1. Create fix branch
git checkout -b fix-merge-pr{NUMBER}
git merge origin/main

# 2. Resolve conflicts methodically
# - package.json: Keep both dependency sets
# - lockfile: Delete and regenerate
# - Code: Manual resolution preserving both features

# 3. Create resolution PR
gh pr create --title "fix(merge): resolve PR #{NUMBER} conflicts"

# 4. Merge resolution PR
gh pr merge --squash

# 5. Close original PR with explanation
gh pr close {NUMBER} --comment "Merged via resolution PR"
```

## 📊 **Monitoring & Metrics**

### **Conflict Tracking**
- Track conflicts in `teams/SHARED.md`
- Document resolution time
- Identify recurring conflict patterns
- Adjust workflow based on patterns

### **Success Metrics**
- Conflicts per week (target: <2)
- Resolution time (target: <30 minutes)
- Code preservation (target: 100%)
- Team coordination effectiveness

## 🔧 **Tool Integration**

### **Pre-commit Hooks Enhancement**
```bash
# Add to .husky/pre-commit
echo "Checking for potential conflicts..."
git fetch origin main
if ! git merge-tree $(git merge-base HEAD origin/main) HEAD origin/main | grep -q "CONFLICT"; then
  echo "✅ No conflicts detected"
else
  echo "⚠️ Potential conflicts detected - consider rebasing"
fi
```

### **ClaudeSquad Integration**
- Update task prompts to include rebase requirement
- Add conflict checking to STATUS.md templates
- Include coordination requirements in agent instructions

---

**Last Updated**: June 17, 2025  
**Next Review**: After next 5 PRs merged  
**Owner**: All AI agents and development team