# ClaudeSquad Deployment & Testing Guide

## 🚀 **Quick Start for Judges**

This guide ensures judges can easily test Z6Chat during competition evaluation.

### **1. Environment Setup**

```bash
# Clone repository
git clone <repository-url>
cd z6chat

# Install dependencies
pnpm install

# Copy environment template
cp .env.local.example .env.local
```

### **2. API Key Configuration (BYOK)**

Add your API keys to `.env.local`:

```bash
# OpenRouter (Multi-model support)
OPENROUTER_API_KEY=your_openrouter_key

# Optional: Direct API keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Convex (Database)
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

### **3. Development Server**

```bash
# Start Convex backend
pnpm dev:convex

# Start Next.js frontend (in new terminal)
pnpm dev
```

### **4. Production Testing**

Visit deployed URL: [Will be updated with Vercel deployment]

---

## 🔧 **ClaudeSquad Operations**

### **Starting ClaudeSquad Session**

```bash
# Install ClaudeSquad
brew install claude-squad

# Start session
cs

# In ClaudeSquad:
# - Press 'n' to create new instance
# - Paste task prompt from teams/task-prompts.md
# - Agent works independently
```

### **Task Assignment Workflow**

1. **Check Progress**: Review `teams/PROGRESS.md`
2. **Select Task**: Choose from available tasks
3. **Copy Prompt**: From `teams/task-prompts.md`
4. **Create Instance**: New ClaudeSquad session
5. **Monitor**: Check task STATUS.md for updates

### **Integration Workflow**

1. **Agent Completes**: Creates PR from feature branch
2. **Update Status**: Agent updates their STATUS.md
3. **Review**: Manual code review
4. **Merge**: Integrate to main branch
5. **Deploy**: Automatic Vercel deployment
6. **Sync**: Other agents pull latest changes

---

## 📋 **Quality Assurance**

### **Pre-PR Checklist** (Each Agent)

- [ ] Code builds successfully (`pnpm build`)
- [ ] TypeScript checks pass (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Formatting applied (`pnpm format`)
- [ ] Manual testing in browser
- [ ] Mobile responsiveness checked
- [ ] Error states handled gracefully
- [ ] Documentation updated

### **CI/CD Pipeline**

- **Automatic**: Type checking, linting, building
- **Manual**: Code review and approval
- **Deployment**: Automatic to Vercel on merge

---

## 🎯 **Competition Demo Strategy**

### **Demo Flow for Judges**

1. **Landing Page**: Professional UI, clear value proposition
2. **Quick Setup**: BYOK flow, API key entry
3. **Basic Chat**: Multi-model conversation
4. **Advanced Features**:
   - Resumable streams demo
   - Image generation
   - File uploads
   - Syntax highlighting
5. **Mobile Experience**: Responsive design
6. **Error Handling**: Graceful failures

### **Judge Testing Scenarios**

- **Happy Path**: Everything works perfectly
- **API Failures**: Graceful error messages
- **Network Issues**: Resumable streams advantage
- **Mobile Testing**: Responsive experience
- **Multiple Models**: Easy switching

---

## 📊 **Monitoring & Debugging**

### **Development Monitoring**

- **Convex Dashboard**: Real-time database queries
- **Next.js Dev**: Hot reload and error overlay
- **Browser DevTools**: Network and console monitoring
- **Vercel Analytics**: Performance metrics

### **Common Issues & Solutions**

#### **Convex Connection Issues**

```bash
# Check Convex status
npx convex status

# Restart Convex dev
npx convex dev --run-locally
```

#### **API Rate Limits**

- Monitor API usage in dashboard
- Implement proper error handling
- Use BYOK for judge testing

#### **Build Failures**

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 🔒 **Security & Environment**

### **Environment Variables**

- **Development**: `.env.local` (gitignored)
- **Production**: Vercel environment variables
- **CI/CD**: GitHub Secrets

### **API Key Security**

- Client-side storage for BYOK
- No server-side logging of keys
- Secure transmission only
- Clear setup instructions

---

## 🚨 **Emergency Procedures**

### **Competition Day Issues**

#### **Major Bug Discovery**

1. Create hotfix branch immediately
2. Single-agent rapid fix
3. Emergency PR and deploy
4. Update all ClaudeSquad agents

#### **Service Outages**

- **Convex Down**: Fall back to mock data
- **OpenRouter Down**: Direct API fallback
- **Vercel Down**: GitHub Pages backup

#### **Demo Failures**

- Local development backup
- Pre-recorded demo video
- Clear explanation of intended functionality

---

## 📈 **Performance Targets**

### **Core Metrics**

- **Initial Load**: < 2 seconds
- **Chat Response**: < 500ms to start
- **File Upload**: < 5 seconds for 10MB
- **Mobile Performance**: 90+ Lighthouse score

### **Competition Advantages**

- **Professional Polish**: Superior to basic implementations
- **Advanced Features**: Resumable streams, image generation
- **Reliability**: Robust error handling
- **Accessibility**: WCAG compliance

---

**Competition Contact**: [Emergency contact for demo day]  
**Repository**: [GitHub repository URL]  
**Live Demo**: [Vercel deployment URL]
