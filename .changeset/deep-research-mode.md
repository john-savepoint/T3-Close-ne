---
"z6chat": minor
---

feat: implement Deep Research Mode for autonomous research investigations

- Add comprehensive Deep Research Mode tool for conducting autonomous research on complex topics
- Implement multi-step agentic research pipeline with real-time progress tracking
- Add researchJobs database schema with full lifecycle management (pending → decomposing → searching → synthesizing → generating → completed)
- Create React components for research job creation, progress monitoring, and report viewing
- Integrate Tavily web search API for gathering real-time web information
- Add research job management hooks with status tracking and error handling
- Implement structured report generation with source citations and downloadable outputs
- Support research job history, retry functionality, and cancellation
- Add Deep Research tool to the tools grid with prominent placement
- Create dedicated Deep Research page at /tools/deep-research
- Add comprehensive TypeScript types for research system
