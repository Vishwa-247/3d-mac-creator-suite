# Agentic Architecture Migration - Task Breakdown

## Phase 0: Align with Existing Theme & Structure
- [x] **Frontend**: Fix build errors in index.css
- [x] **Frontend**: Update theme tokens (colors, fonts, radius)
- [x] **Frontend**: Expand DSA problems list (Netflix, Atlassian)
- [x] **Plan**: Define Hybrid Workflow (Lovable + Cursor + GitHub)

## Phase 1: Data & Memory Foundation
- [ ] **Backend**: Set up MongoDB Atlas (Free Tier)
- [ ] **Backend**: Create collections (users, agent_memory, courses, etc.)
- [ ] **Backend**: Implement FastAPI data layer & vector search

## Phase 2: Onboarding Agent (The Architect)
- [x] **Spec**: Onboarding Agent (01_agent_onboarding.md)
- [ ] **Backend**: Implement POST /api/onboarding/chat (Groq)
- [ ] **Backend**: Implement POST /api/onboarding/complete
- [ ] **Frontend**: Build Chat Interface (Lovable)

## Phase 3: Resume Agent (Recruiter-in-a-Box)
- [x] **Spec**: Resume Agent (02_agent_resume.md)
- [ ] **Backend**: Implement POST /api/resume/analyze (Groq + PDF Parsing)
- [ ] **Frontend**: Wire Resume Analyzer Page to Backend

## Phase 4: Course Agent (Adaptive Courses)
- [x] **Spec**: Course Agent (03_agent_course.md)
- [ ] **Backend**: Implement Course Generation (Gemini Flash)
- [ ] **Backend**: Implement "Remediation" Logic (Quiz Fail -> New Chapter)
- [ ] **Frontend**: Update CourseLayout & Quiz Components

## Phase 5: Interview Agent (ML + Real-Time)
- [x] **Design**: Deep Dive ML Architecture (interview_ml_deep_dive.md)
- [ ] **Spec**: Interview Agent (05_agent_interview.md)
- [ ] **Backend**: Train/Self-host Emotion Models (Mini-Xception, Whisper)
- [ ] **Frontend**: Integrate Webcam & Audio Capture

## Phase 6: Accountability & Career Tracker
- [ ] **Spec**: Accountability Agent (07_agent_accountability.md)
- [ ] **Backend**: Build Event Orchestrator (Redis)
- [ ] **Frontend**: Build Dashboard & Career Gauge
