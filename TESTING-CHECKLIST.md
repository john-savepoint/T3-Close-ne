# 🧪 Z6Chat Testing Checklist

## 🚀 **Immediate Testing Requirements**

### **1. Local Development Testing**

```bash
# Start full development environment
pnpm dev:convex     # Terminal 1: Convex backend
pnpm dev           # Terminal 2: Next.js frontend

# Access: http://localhost:3000
```

### **2. Build & Quality Testing**

```bash
# Full quality gate (MUST pass)
pnpm quality:check  # TypeScript + Lint + Format

# Production build test
pnpm build         # Must complete without errors

# Visual regression testing
pnpm test:visual   # Playwright screenshot comparisons
```

### **3. Manual Feature Testing**

#### **Core Functionality**

- [ ] Application loads without errors
- [ ] Homepage renders correctly
- [ ] Navigation works (all routes accessible)
- [ ] Mobile responsive design functions
- [ ] Dark theme displays properly

#### **Chat Features** (if implemented)

- [ ] Can create new chat
- [ ] Can send messages
- [ ] Model selection works
- [ ] Responses stream correctly
- [ ] Error handling for API failures

#### **File Upload Features** (if implemented)

- [ ] Can upload images/PDFs
- [ ] File validation works
- [ ] Upload progress displays
- [ ] File preview functions
- [ ] Attachment management

#### **Authentication Features** (if implemented)

- [ ] Login/signup flow works
- [ ] User sessions persist
- [ ] Protected routes function
- [ ] Logout works correctly

## 🌐 **Production Deployment Testing**

### **1. Verify Deployment Status**

- **Vercel URL**: [Need to check actual deployment URL]
- **Environment Variables**: Set in Vercel dashboard
- **Domain**: Custom domain or vercel.app subdomain
- **SSL**: HTTPS enabled and working

### **2. Production Environment Checks**

- [ ] Site loads in production
- [ ] All assets load correctly (no 404s)
- [ ] API routes function
- [ ] Convex connection works
- [ ] Error boundaries catch issues
- [ ] Performance is acceptable (<3s initial load)

### **3. Cross-Browser Testing**

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### **4. API Integration Testing**

- [ ] OpenRouter API connection
- [ ] Convex database operations
- [ ] File storage (Convex storage)
- [ ] Error handling for API failures
- [ ] Rate limiting behavior

## 🏆 **Competition Readiness Testing**

### **1. Judge Testing Scenarios**

#### **BYOK (Bring Your Own Key) Flow**

- [ ] Clear instructions for API key setup
- [ ] Key validation works
- [ ] Helpful error messages for invalid keys
- [ ] Multiple API provider support

#### **Demo Flow**

- [ ] Professional first impression
- [ ] Core features work flawlessly
- [ ] Advanced features demonstrate competitive edge
- [ ] Error states handle gracefully
- [ ] Mobile experience is professional

#### **Stress Testing**

- [ ] Multiple concurrent users
- [ ] Large file uploads
- [ ] Long conversation histories
- [ ] Network interruption recovery

### **2. Performance Benchmarks**

- **Initial Load**: Target <2 seconds
- **Chat Response**: Target <500ms to start streaming
- **File Upload**: Target <5 seconds for 10MB
- **Mobile Performance**: Target 90+ Lighthouse score

## 🔧 **Testing Commands Reference**

### **Development Testing**

```bash
# Start development servers
pnpm dev:convex && pnpm dev

# Quality checks
pnpm type-check     # TypeScript validation
pnpm lint          # ESLint checking
pnpm format:check  # Prettier formatting
pnpm quality:check # All quality checks

# Build testing
pnpm build         # Production build
pnpm start         # Test production build locally
```

### **Visual Testing**

```bash
# Run visual regression tests
pnpm test:visual

# Interactive test debugging
pnpm test:visual:ui

# Update visual baselines (if needed)
pnpm test:visual --update-snapshots
```

### **Deployment Testing**

```bash
# Verify build for deployment
pnpm build

# Check bundle size
du -sh .next

# Test production locally
pnpm start
```

## 🚨 **Critical Testing Priorities**

### **Before Competition Submission**

1. **✅ Full local testing**: All features working
2. **✅ Production deployment**: Live site accessible
3. **✅ BYOK setup**: Judge testing ready
4. **✅ Mobile responsive**: Professional on all devices
5. **✅ Error handling**: Graceful failures
6. **✅ Performance**: Meeting speed targets

### **Competition Day Testing**

1. **🔴 Live site check**: Verify deployment is working
2. **🔴 Demo rehearsal**: Full walkthrough of features
3. **🔴 Backup plan**: Local development if needed
4. **🔴 Judge instructions**: Clear setup documentation

## 🔗 **Testing Resources**

- **Local Dev**: http://localhost:3000
- **Convex Dashboard**: https://dashboard.convex.dev
- **Vercel Dashboard**: [Vercel project URL]
- **Production Site**: [To be confirmed]

---

**Last Updated**: June 17, 2025  
**Next Review**: Before competition submission  
**Owner**: Development team and competition coordinators
