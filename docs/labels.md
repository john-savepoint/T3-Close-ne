# GitHub Label System Documentation

## 🏷️ **Label Categories & Usage Guide**

This document outlines the comprehensive label system for organizing and automating the Z6Chat project workflow.

## 📊 **Label Categories**

### **Priority Labels** (🔴🟠🟡🟢)

Control urgency and resource allocation:

- **🔴 `priority: critical`** - Blocking issues, security fixes, deployment failures
- **🟠 `priority: high`** - Competition features, core functionality, must-have for submission
- **🟡 `priority: medium`** - Nice-to-have features, improvements, polish items
- **🟢 `priority: low`** - Future improvements, documentation, cleanup

### **Type Labels** (🐛✨🔧📚🧪🔒)

Categorize the nature of changes:

- **🐛 `type: bug`** - Something is broken and needs fixing
- **✨ `type: feature`** - New functionality or capabilities
- **🔧 `type: enhancement`** - Improvement to existing features
- **📚 `type: docs`** - Documentation updates, README changes
- **🧪 `type: testing`** - Test-related changes, CI improvements
- **🔒 `type: security`** - Security improvements, vulnerability fixes

### **Component Labels** (🔐💬📁🎨⚙️🔧)

Identify areas of the codebase affected:

- **🔐 `component: auth`** - Authentication system, user management
- **💬 `component: chat`** - Chat functionality, messaging, streaming
- **📁 `component: files`** - File upload system, attachments
- **🎨 `component: ui`** - UI components, styling, user interface
- **⚙️ `component: backend`** - Convex functions, API endpoints
- **🔧 `component: ci`** - CI/CD infrastructure, workflows

### **Status Labels** (🚀👀🚧✅🔄)

Track PR lifecycle and workflow:

- **🚀 `status: ready-for-review`** - PR is complete and ready for review
- **👀 `status: in-review`** - Currently being reviewed by team
- **🚧 `status: blocked`** - Waiting on dependencies or external factors
- **✅ `status: approved`** - Reviewed and approved, ready to merge
- **🔄 `status: work-in-progress`** - WIP, do not merge yet

### **Competition Labels** (🏆⭐🎯🔑⚡)

Track competition requirements and strategy:

- **🏆 `competition: core`** - Must-have features for submission
- **⭐ `competition: bonus`** - Bonus features that help win
- **🎯 `competition: demo`** - Important for demo presentation to judges
- **🔑 `competition: byok`** - Judge accessibility features (Bring Your Own Key)
- **⚡ `competition: quick-win`** - Fast implementation with high impact

### **Release Labels** (🔖)

Manage versioning and releases:

- **🔖 `release: major`** - Breaking changes requiring major version bump
- **🔖 `release: minor`** - New features requiring minor version bump
- **🔖 `release: patch`** - Bug fixes requiring patch version bump
- **🔖 `release: ready`** - Ready for inclusion in next release

### **Automation Labels** (🏷️🔨📦)

Control automated workflows:

- **🏷️ `auto-merge`** - Automatically merge when approved and CI passes
- **🏷️ `do-not-merge`** - Block automatic merging, requires manual intervention
- **🔨 `breaking-change`** - Requires major version bump, special handling
- **📦 `dependencies`** - Dependency updates, Dependabot PRs

## 🤖 **Automation Integration**

### **Auto-merge Workflow**

The auto-merge system responds to specific labels:

- **Enabled by**: `auto-merge` label
- **Blocked by**: `do-not-merge` label
- **Requirements**: All CI checks pass + approvals
- **Method**: Configurable (squash, merge, rebase)

### **Release Automation**

Changesets and releases are triggered by:

- **`release: *`** labels determine changeset type
- **`breaking-change`** forces major version bump
- **GitHub Actions** create release PRs automatically
- **Changelog** generated from PR descriptions

### **Dependabot Integration**

Dependency PRs automatically get:

- **`dependencies`** label
- **`type: security`** for security updates
- **`auto-merge`** for patch updates (if CI passes)
- **Priority** based on security severity

## 📋 **Labeling Guidelines**

### **Required Labels for All PRs**

Every PR must have:

1. **One type label** (`type: *`)
2. **One priority label** (`priority: *`)
3. **One or more component labels** (`component: *`)
4. **One competition label** (`competition: *`)

### **Optional Labels**

Add when relevant:

- **Status labels** for workflow tracking
- **Release labels** for version planning
- **Automation labels** for special handling

### **Label Combinations**

Common effective combinations:

```
🏆 Core Feature:
type: feature + priority: high + competition: core + component: chat

⭐ Bonus Feature:
type: feature + priority: medium + competition: bonus + component: ui

🐛 Critical Bug:
type: bug + priority: critical + component: backend + do-not-merge

🔧 Quick Improvement:
type: enhancement + priority: low + competition: quick-win + auto-merge
```

## 🎯 **Competition Strategy**

### **Judge Testing Priority**

For competition judging, prioritize PRs with:

1. **`competition: byok`** - Essential for judge access
2. **`competition: demo`** - Important for presentation
3. **`competition: core`** - Required functionality
4. **`priority: critical`** - Blocking issues

### **Feature Tracking**

Monitor competition progress by filtering:

- **Core features**: `competition: core` + `status: approved`
- **Bonus features**: `competition: bonus` + `type: feature`
- **Demo readiness**: `competition: demo` + `priority: high`

## 🔍 **Useful Filters**

### **GitHub Issue/PR Filters**

Quick filters for common views:

```
Ready to Review:
label:"status: ready-for-review"

Competition Core Features:
label:"competition: core" label:"type: feature"

High Priority Bugs:
label:"type: bug" label:"priority: high"

Auto-merge Candidates:
label:"auto-merge" label:"status: approved"

BYOK Requirements:
label:"competition: byok"

Quick Wins Available:
label:"competition: quick-win" label:"priority: medium"
```

### **Release Planning**

Track release readiness:

```
Ready for Next Release:
label:"release: ready" label:"status: approved"

Breaking Changes:
label:"breaking-change" label:"release: major"

Feature Additions:
label:"release: minor" label:"type: feature"
```

## 🔧 **Maintenance**

### **Label Updates**

- **Colors**: Use consistent color scheme per category
- **Descriptions**: Keep clear and actionable
- **Naming**: Follow `category: name` convention

### **Cleanup Tasks**

- Review label usage monthly
- Remove unused or confusing labels
- Update descriptions based on team feedback
- Sync with automation requirements

### **Team Training**

- New team members learn label system
- Regular reviews of labeling consistency
- Update guidelines based on competition needs
- Document changes in this file

---

**Last Updated**: June 17, 2025  
**Competition Deadline**: June 18, 2025 at 12:00 PM PDT  
**Label Count**: 32 labels across 7 categories  
**Automation Integration**: Auto-merge + Release + Dependabot
