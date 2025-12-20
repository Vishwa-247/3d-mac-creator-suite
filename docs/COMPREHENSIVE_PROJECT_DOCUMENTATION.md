# 📚 StudyMate AI Learning Platform - Comprehensive Project Documentation

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Project Status:** Production Ready

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [System Architecture](#system-architecture)
4. [Microservices & Agents](#microservices--agents)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Design](#database-design)
7. [API Documentation](#api-documentation)
8. [Technology Stack](#technology-stack)
9. [Implementation Status](#implementation-status)
10. [Features & Modules](#features--modules)
11. [Setup & Installation](#setup--installation)
12. [Deployment](#deployment)
13. [Testing](#testing)
14. [Future Enhancements](#future-enhancements)

---

## 🎯 Executive Summary

**StudyMate** is a comprehensive AI-powered learning and career development platform that helps students and professionals:

- **Analyze Resumes** with AI-powered feedback and job matching
- **Build Profiles** with intelligent data extraction from resumes
- **Generate Courses** with personalized learning paths using AI
- **Practice Interviews** with AI-powered mock interview coaching
- **Solve DSA Problems** with curated data structures and algorithms practice
- **Track Progress** with comprehensive analytics and insights

### Key Highlights

- ✅ **Microservices Architecture** - 6+ independent services
- ✅ **AI-Powered** - Integration with Groq, Gemini, and custom ML models
- ✅ **Real-time Features** - Live interview coaching with emotion detection
- ✅ **Modern Stack** - React, TypeScript, FastAPI, Supabase
- ✅ **Production Ready** - Fully functional with comprehensive error handling

---

## 📖 Project Overview

### Problem Statement

Job seekers and learners face multiple challenges:
1. **Resume Quality** - No immediate feedback on resume effectiveness
2. **Skill Gaps** - Difficulty identifying what to learn for target roles
3. **Learning Paths** - Scattered resources make structured learning difficult
4. **Interview Prep** - Limited realistic practice opportunities
5. **DSA Practice** - Need for structured problem-solving practice
6. **Profile Management** - No centralized system for career documents

### Our Solution

StudyMate provides an integrated platform that:
- Uses AI to analyze resumes and provide instant, actionable feedback
- Identifies skill gaps by comparing resumes with job descriptions
- Generates personalized courses with structured learning paths
- Offers AI-powered interview coaching with realistic scenarios
- Provides curated DSA problems with solutions
- Maintains a unified profile with intelligent document management

### Target Audience

- College students preparing for placements
- Fresh graduates entering the job market
- Professionals looking to switch careers
- Anyone seeking to improve their technical skills

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (React + Vite)                    │
│              http://localhost:5173                           │
│  - React 18.3.1 + TypeScript                                │
│  - TanStack Query for data fetching                         │
│  - ShadCN UI + Tailwind CSS                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ REST API Calls (HTTPS)
                        │ JWT Authentication
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              API Gateway (FastAPI)                           │
│              Port: 8000                                      │
│  - JWT Authentication & Authorization                       │
│  - Request Routing & Load Balancing                          │
│  - CORS Handling                                            │
│  - Service Discovery                                         │
└───────┬───────┬────────┬────────┬────────┬─────────────────┘
        │       │        │        │        │
        │       │        │        │        │
┌───────▼───┐ ┌▼──────┐ ┌▼──────┐ ┌▼─────┐ ┌▼──────────┐
│  Resume   │ │Profile│ │Course │ │Inter-│ │Emotion    │
│ Analyzer  │ │Service│ │ Gen   │ │view  │ │Detection  │
│ (8003)    │ │(8006) │ │(8008) │ │Coach │ │(8005)     │
│           │ │       │ │       │ │(8002)│ │           │
└─────┬─────┘ └───┬───┘ └───┬───┘ └──┬───┘ └─────┬─────┘
      │           │         │         │           │
      │           │         │         │           │
┌─────▼───────────▼─────────▼─────────▼───────────▼─────┐
│              Supabase (PostgreSQL)                     │
│           - User data                                  │
│           - Resume metadata                            │
│           - Analysis history                           │
│           - Course data                                │
│           - Interview history                          │
│           - Profile data                               │
│                                                         │
│           Supabase Storage                             │
│           - Resume files (PDF/DOCX)                    │
│           - Course audio files                         │
└────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Microservices** - Each service is independent and can be scaled separately
2. **API Gateway Pattern** - Single entry point for all client requests
3. **Service Discovery** - Services register themselves and are discoverable
4. **Database per Service** - Each service has its own data access patterns
5. **Async Communication** - Non-blocking I/O for better performance
6. **Stateless Services** - Services don't maintain session state

---

## 🤖 Microservices & Agents

### 1. API Gateway Service (Port 8000)

**Location:** `backend/api-gateway/main.py`

**Responsibilities:**
- Central entry point for all client requests
- JWT token validation and user authentication
- Request routing to appropriate microservices
- CORS handling and security headers
- Rate limiting and throttling
- Service health monitoring

**Key Features:**
- JWT-based authentication
- Request forwarding with timeout handling
- Health check aggregation from all services
- Error handling and logging

**Endpoints:**
- `POST /auth/signin` - User login
- `POST /auth/signup` - User registration
- `POST /auth/signout` - User logout
- `GET /health` - Health check with service status
- All proxy routes to microservices

**Status:** ✅ **Fully Implemented**

---

### 2. Resume Analyzer Service (Port 8003)

**Location:** `backend/agents/resume-analyzer/main.py`

**Responsibilities:**
- Resume parsing (PDF, DOCX formats)
- AI-powered analysis using Groq API
- Skill extraction and gap identification
- Resume scoring and recommendations
- Analysis history management
- Supabase Storage integration for resume files

**Key Features:**
- Multi-format resume parsing (PDF, DOCX)
- Job role matching and analysis
- Action words detection
- STAR methodology scoring
- Missing skills identification
- Improvement suggestions
- Resume library management

**AI Models Used:**
- **Groq API** - `llama-3.1-70b-versatile` for resume analysis
- **Gemini API** - `gemini-pro` for structured data extraction

**Analysis Dimensions:**
- Content Quality (0-100)
- Formatting & Structure (0-100)
- Keyword Optimization (0-100)
- Experience Relevance (0-100)
- Achievement Impact (0-100)
- Overall Score (weighted average)

**Endpoints:**
- `POST /analyze-resume` - Analyze resume for job role
- `GET /user-resumes/{user_id}` - Get all user resumes
- `GET /analysis-history/{user_id}` - Get analysis history
- `GET /analysis/{analysis_id}` - Get detailed analysis

**Status:** ✅ **Fully Implemented**

---

### 3. Profile Service (Port 8006)

**Location:** `backend/agents/profile-service/main.py`

**Responsibilities:**
- User profile management (CRUD operations)
- Resume upload and storage to Supabase Storage
- AI-powered resume data extraction
- Profile information parsing (name, email, phone, skills)
- Education, experience, projects management
- Skills repository management

**Key Features:**
- Drag-and-drop resume upload
- Automatic data extraction using Groq AI
- Manual editing of extracted information
- Education and experience tracking
- Skills organization (technical & soft skills)
- Profile completeness tracking

**Data Extraction:**
- Full name, email, phone number
- Skills (technical and soft)
- Work experience with dates
- Education history
- Projects and achievements
- Certifications

**Endpoints:**
- `POST /extract-profile` - Extract data from resume
- `GET /profile/{user_id}` - Get user profile
- `PUT /profile/{user_id}` - Update user profile
- `POST /upload-resume` - Upload resume file

**Status:** ✅ **Fully Implemented**

---

### 4. Course Generation Service (Port 8008)

**Location:** `backend/agents/course-generation/main.py`

**Responsibilities:**
- AI-powered course creation using Gemini API
- Personalized learning path generation
- Module and topic structuring
- Course content generation (chapters, quizzes, flashcards)
- Audio script generation for course content
- Course progress tracking

**Key Features:**
- **Oboe-Style Parallel Generation** - Generates courses in ~40 seconds
- Parallel chapter generation (10+ API keys)
- Quiz generation with multiple choice questions
- Flashcard creation for key concepts
- Word games for interactive learning
- Article generation for additional reading
- Audio scripts for text-to-speech

**Generation Process:**
1. Course structure generation (modules and topics)
2. Parallel chapter generation (10 chapters simultaneously)
3. Quiz generation for each chapter
4. Flashcard generation
5. Word game creation
6. Article generation
7. Audio script generation

**AI Models Used:**
- **Gemini API** - Multiple keys for parallel processing
- **Groq API** - Fast audio script generation

**Course Structure:**
```
Course
├── Module 1
│   ├── Chapter 1.1 (with content, quiz, flashcards)
│   ├── Chapter 1.2
│   └── Chapter 1.3
├── Module 2
│   └── ...
├── Quiz (per chapter)
├── Flashcards
├── Word Games
└── Articles
```

**Endpoints:**
- `POST /generate` - Generate new course
- `POST /generate-course-parallel` - Parallel generation (Oboe-style)
- `GET /courses` - Get all user courses
- `GET /courses/{course_id}` - Get course details
- `GET /courses/{course_id}/content` - Get course content
- `DELETE /courses/{course_id}` - Delete course

**Status:** ✅ **Fully Implemented**

---

### 5. Interview Coach Service (Port 8002)

**Location:** `backend/agents/interview-coach/main.py`

**Responsibilities:**
- AI-powered interview question generation
- Answer evaluation and feedback
- Interview session management
- Performance analytics
- Industry-specific interview scenarios
- Real-time audio transcription
- Speech analysis and emotion detection

**Key Features:**
- **Technical Interviews** - Coding, system design, algorithms
- **Aptitude Tests** - Logical reasoning, quantitative aptitude
- **HR Interviews** - Behavioral questions, situational scenarios
- **Real-time Analysis** - Live feedback during interviews
- **Audio Processing** - Speech-to-text transcription
- **Emotion Detection** - Facial expression analysis during interviews
- **Performance Tracking** - Score tracking and improvement suggestions

**Interview Types:**
1. **Technical** - Programming, algorithms, system design
2. **Aptitude** - Logical reasoning, quantitative, verbal
3. **HR** - Behavioral, situational, cultural fit

**AI Models Used:**
- **Groq API** - Question generation and answer evaluation
- **Gemini API** - Advanced reasoning and feedback
- **Custom ML Models** - Emotion detection (ViT-based)

**Endpoints:**
- `POST /start` - Start interview session
- `POST /generate-technical` - Generate technical questions
- `POST /generate-aptitude` - Generate aptitude questions
- `POST /generate-hr` - Generate HR questions
- `POST /interviews/{interview_id}/answer` - Submit answer (with audio)
- `GET /interviews` - Get all interviews
- `GET /interviews/{interview_id}` - Get interview details

**Status:** ✅ **Fully Implemented**

---

### 6. Emotion Detection Service (Port 8005)

**Location:** `backend/agents/emotion-detection/main.py`

**Responsibilities:**
- Real-time facial emotion detection
- Face tracking and analysis
- Emotion classification (happy, sad, angry, neutral, etc.)
- Integration with interview coach for live feedback
- Confidence score calculation

**Key Features:**
- **Real-time Processing** - Live video stream analysis
- **Face Tracking** - Continuous face detection and tracking
- **Emotion Classification** - 7 emotion categories
- **Confidence Scoring** - Accuracy metrics for predictions
- **WebSocket Support** - Real-time communication

**Technology:**
- **PyTorch** - Deep learning framework
- **OpenCV** - Computer vision processing
- **ViT Model** - Vision Transformer for emotion classification
- **Custom Trained Model** - `best_vit_fer2013_model.pt`

**Emotion Categories:**
- Happy 😊
- Sad 😢
- Angry 😠
- Surprised 😲
- Fearful 😨
- Disgusted 😖
- Neutral 😐

**Endpoints:**
- `POST /analyze-emotion` - Analyze emotion from image/video
- `WebSocket /ws/emotion` - Real-time emotion streaming

**Status:** ✅ **Fully Implemented**

---

### 7. DSA Service (Port 8004)

**Location:** `backend/agents/dsa-service/main.py`

**Responsibilities:**
- Data structures and algorithms problems
- Problem categorization and tagging
- Difficulty-based filtering
- Solution viewing and explanations
- Progress tracking

**Key Features:**
- **Problem Library** - 100+ curated DSA problems
- **Difficulty Levels** - Easy, Medium, Hard
- **Topic Categories** - Arrays, Strings, Trees, Graphs, DP, etc.
- **Company Tags** - Problems from specific companies
- **Solution Access** - Detailed solutions with explanations
- **Code Templates** - Starter code for practice

**Problem Structure:**
- Title and description
- Examples with explanations
- Constraints
- Solution approach
- Time and space complexity
- Code implementation

**Status:** ⚠️ **Partially Implemented** (Frontend exists, backend needs completion)

---

## 💻 Frontend Architecture

### Technology Stack

- **Framework:** React 18.3.1
- **Language:** TypeScript 5.5.3
- **Build Tool:** Vite 5.4.2
- **Routing:** React Router DOM 6.26.1
- **State Management:** TanStack React Query 5.56.2
- **UI Library:** ShadCN UI + Radix UI
- **Styling:** Tailwind CSS 3.4.10
- **Icons:** Lucide React
- **Charts:** Recharts 2.12.7
- **Animations:** Framer Motion 11.5.4

### Project Structure

```
src/
├── api/                    # API client and services
│   ├── client.ts          # Axios instance with interceptors
│   └── services/         # Service-specific API calls
│       ├── courseService.ts
│       ├── interviewService.ts
│       ├── profileService.ts
│       └── resumeService.ts
│
├── components/            # React components
│   ├── ui/               # ShadCN UI components (54 files)
│   ├── layout/           # Layout components
│   ├── course/           # Course-related components (17 files)
│   ├── interview/       # Interview components (8 files)
│   ├── profile/          # Profile components (14 files)
│   ├── resume/           # Resume components (4 files)
│   ├── dsa/              # DSA components (4 files)
│   └── home/             # Home page components
│
├── pages/                # Page components
│   ├── Auth.tsx          # Authentication page
│   ├── Dashboard.tsx     # User dashboard
│   ├── CourseGenerator.tsx
│   ├── Courses.tsx
│   ├── CourseDetailNew.tsx
│   ├── ResumeAnalyzer.tsx
│   ├── ProfileBuilder.tsx
│   ├── MockInterview.tsx
│   ├── InterviewResult.tsx
│   ├── DSASheet.tsx
│   └── ...
│
├── context/              # React Context providers
│   ├── InterviewContext.tsx
│   └── ResumeContext.tsx
│
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useProfile.ts
│   ├── useCourseGeneration.ts
│   ├── useFacialAnalysis.ts
│   └── ...
│
├── types/                # TypeScript type definitions
│   ├── course.ts
│   ├── interview.ts
│   └── profile.ts
│
├── configs/              # Configuration files
│   ├── backendConfig.ts
│   └── environment.ts
│
└── integrations/         # Third-party integrations
    └── supabase/         # Supabase client setup
```

### Key Pages

1. **Dashboard** (`/dashboard`) - User overview and quick actions
2. **Course Generator** (`/course-generator`) - Generate new courses
3. **Courses** (`/courses`) - Browse and manage courses
4. **Course Detail** (`/course/:id`) - View course content
5. **Resume Analyzer** (`/resume-analyzer`) - Analyze resumes
6. **Profile Builder** (`/profile-builder`) - Build and edit profile
7. **Mock Interview** (`/mock-interview`) - Practice interviews
8. **Interview Result** (`/interview-result/:id`) - View interview results
9. **DSA Sheet** (`/dsa-sheet`) - Practice DSA problems
10. **Settings** (`/settings`) - User settings

### State Management

- **TanStack Query** - Server state, caching, and synchronization
- **React Context** - Global state (auth, interview, resume)
- **Local State** - Component-specific state with `useState`

### Routing

Protected routes require authentication via JWT token. Unauthenticated users are redirected to `/auth`.

---

## 🗄️ Database Design

### Supabase PostgreSQL Schema

#### Core Tables

**1. users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. user_profiles**
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    summary TEXT,
    skills TEXT[],
    experience JSONB,
    education JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**3. user_resumes**
```sql
CREATE TABLE user_resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    file_size INTEGER,
    processing_status VARCHAR(50) DEFAULT 'pending',
    analysis_count INTEGER DEFAULT 0,
    last_analyzed_at TIMESTAMPTZ,
    latest_analysis_id UUID
);
```

**4. resume_analysis_history**
```sql
CREATE TABLE resume_analysis_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    job_description TEXT,
    resume_filename VARCHAR(500),
    resume_file_path TEXT,
    overall_score DECIMAL(5,2),
    content_quality INTEGER,
    formatting_structure INTEGER,
    keyword_optimization INTEGER,
    experience_relevance INTEGER,
    achievement_impact INTEGER,
    missing_skills TEXT[],
    improvement_suggestions TEXT[],
    resume_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**5. courses**
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    job_role VARCHAR(255),
    course_content JSONB,
    total_duration_weeks INTEGER,
    completion_time_estimate INTEGER, -- in minutes
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**6. course_chapters**
```sql
CREATE TABLE course_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**7. course_audio**
```sql
CREATE TABLE course_audio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL,
    chapter_id UUID,
    script TEXT NOT NULL,
    script_text TEXT, -- Alternative field name
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**8. interview_sessions**
```sql
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    interview_type VARCHAR(100),
    questions JSONB,
    answers JSONB,
    overall_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Relationships

```
users (1) ──→ (N) user_resumes
users (1) ──→ (1) user_profiles
users (1) ──→ (N) resume_analysis_history
users (1) ──→ (N) courses
users (1) ──→ (N) interview_sessions

user_resumes (1) ──→ (N) resume_analysis_history (via resume_id)
courses (1) ──→ (N) course_chapters
courses (1) ──→ (N) course_audio
```

### Supabase Storage Buckets

- **resume-files** - Stores uploaded resume PDFs and DOCX files
- **course-audio** - Stores generated audio files (if using external TTS)

---

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/auth/signin`
Login user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User"
  }
}
```

#### POST `/auth/signup`
Register new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Resume Analyzer Endpoints

#### POST `/resume/analyze`
Analyze resume for specific job role.

**Request (multipart/form-data):**
- `resume`: File (PDF or DOCX)
- `job_role`: string (required)
- `job_description`: string (optional)
- `user_id`: string (optional)

**Response:**
```json
{
  "status": "success",
  "analysis_id": "uuid",
  "results": {
    "overall_score": 75.5,
    "scoring": {
      "content_quality": 80,
      "formatting_structure": 75,
      "keyword_optimization": 70,
      "experience_relevance": 78,
      "achievement_impact": 72
    },
    "missing_skills": ["React", "TypeScript"],
    "improvement_suggestions": [
      "Add more quantifiable achievements",
      "Include relevant keywords"
    ]
  }
}
```

#### GET `/resume/user-resumes/{user_id}`
Get all resumes uploaded by user.

#### GET `/resume/analysis-history/{user_id}`
Get analysis history for user.

### Profile Service Endpoints

#### POST `/api/profile/extract-profile`
Extract profile data from resume.

**Request (multipart/form-data):**
- `resume`: File
- `user_id`: string

**Response:**
```json
{
  "status": "success",
  "resume_id": "uuid",
  "extracted_data": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "skills": ["React", "Python", "FastAPI"]
  }
}
```

#### GET `/api/profile/{user_id}`
Get user profile.

#### PUT `/api/profile/{user_id}`
Update user profile.

### Course Generation Endpoints

#### POST `/courses/generate`
Generate new course.

**Request:**
```json
{
  "title": "Full Stack Development",
  "description": "Learn full stack development",
  "job_role": "Full Stack Developer",
  "difficulty": "intermediate"
}
```

**Response:**
```json
{
  "status": "success",
  "course_id": "uuid",
  "course": {
    "title": "Full Stack Development",
    "modules": [...],
    "total_duration_weeks": 12
  }
}
```

#### GET `/courses`
Get all courses for user.

#### GET `/courses/{course_id}`
Get course details.

#### GET `/courses/{course_id}/content`
Get course content (chapters, quizzes, etc.).

### Interview Coach Endpoints

#### POST `/interviews/start`
Start interview session.

**Request:**
```json
{
  "job_role": "Software Engineer",
  "interview_type": "technical",
  "difficulty": "medium",
  "duration": 30
}
```

#### POST `/interviews/{interview_id}/answer`
Submit interview answer (with optional audio).

**Request (multipart/form-data):**
- `audio`: File (optional)
- `question_id`: string
- `facial_data`: JSON string (optional)

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library |
| TypeScript | 5.5.3 | Type safety |
| Vite | 5.4.2 | Build tool |
| React Router | 6.26.1 | Routing |
| TanStack Query | 5.56.2 | Data fetching |
| Tailwind CSS | 3.4.10 | Styling |
| ShadCN UI | Latest | Component library |
| Radix UI | Latest | UI primitives |
| Recharts | 2.12.7 | Data visualization |
| Framer Motion | 11.5.4 | Animations |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Programming language |
| FastAPI | 0.115.0 | Web framework |
| Uvicorn | 0.31.0 | ASGI server |
| asyncpg | 0.29.0 | PostgreSQL driver |
| PyJWT | 2.9.0 | JWT handling |
| PyPDF2 | 3.0.1 | PDF parsing |
| python-docx | 1.1.2 | DOCX parsing |
| Groq | 0.32.0 | AI API |
| google-generativeai | 0.8.3 | Gemini API |
| Supabase | 2.19.0 | Database client |

### AI & ML

| Service | Purpose |
|---------|---------|
| Groq API | Fast LLM inference (resume analysis, profile extraction) |
| Google Gemini API | Content generation (courses, questions) |
| Custom ViT Model | Emotion detection (facial expressions) |
| PyTorch | Deep learning framework |
| OpenCV | Computer vision |

### Database & Storage

| Technology | Purpose |
|------------|---------|
| Supabase (PostgreSQL) | Primary database |
| Supabase Storage | File storage (resumes, audio) |

---

## ✅ Implementation Status

### Completed Features ✅

#### Backend Services
- ✅ API Gateway with JWT authentication
- ✅ Resume Analyzer Service (full implementation)
- ✅ Profile Service (full implementation)
- ✅ Course Generation Service (Oboe-style parallel generation)
- ✅ Interview Coach Service (technical, aptitude, HR)
- ✅ Emotion Detection Service (real-time facial analysis)
- ⚠️ DSA Service (partial - frontend exists)

#### Frontend Pages
- ✅ Authentication (login/signup)
- ✅ Dashboard
- ✅ Course Generator
- ✅ Course Detail View
- ✅ Resume Analyzer
- ✅ Profile Builder
- ✅ Mock Interview
- ✅ Interview Results
- ✅ DSA Sheet (UI complete)
- ✅ Settings

#### Core Features
- ✅ Resume upload and parsing (PDF, DOCX)
- ✅ AI-powered resume analysis
- ✅ Profile data extraction from resumes
- ✅ Course generation with parallel processing
- ✅ Interview question generation
- ✅ Real-time emotion detection
- ✅ Audio transcription for interviews
- ✅ JWT authentication
- ✅ File storage in Supabase

### In Progress 🚧

- ⚠️ DSA Service backend completion
- ⚠️ Advanced analytics dashboard
- ⚠️ Real-time notifications

### Planned Features 📋

- 📋 WebSocket support for real-time updates
- 📋 Mobile app (React Native)
- 📋 Advanced progress tracking
- 📋 Social features (peer review)
- 📋 Integration with LinkedIn/GitHub
- 📋 ATS export functionality

---

## 📦 Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account (free tier works)
- Groq API key (free at groq.com)
- Google Gemini API key (free at makersuite.google.com)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd furniture-fusion-bazaar-main
```

### Step 2: Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add to .env:
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

### Step 3: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add to .env:
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_DB_URL=your_database_connection_string
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
```

### Step 4: Database Setup

1. Create Supabase project at https://supabase.com
2. Run migrations from `supabase/migrations/` folder
3. Create storage buckets:
   - `resume-files` (public)
   - `course-audio` (public)

### Step 5: Start Services

**Option 1: Start All Services (Windows)**
```bash
cd backend
.\start.bat
```

**Option 2: Start Individual Services**

Terminal 1 - API Gateway:
```bash
cd backend/api-gateway
uvicorn main:app --port 8000 --reload
```

Terminal 2 - Resume Analyzer:
```bash
cd backend/agents/resume-analyzer
uvicorn main:app --port 8003 --reload
```

Terminal 3 - Profile Service:
```bash
cd backend/agents/profile-service
uvicorn main:app --port 8006 --reload
```

Terminal 4 - Course Generation:
```bash
cd backend/agents/course-generation
uvicorn main:app --port 8008 --reload
```

Terminal 5 - Interview Coach:
```bash
cd backend/agents/interview-coach
uvicorn main:app --port 8002 --reload
```

Terminal 6 - Emotion Detection:
```bash
cd backend/agents/emotion-detection
python main.py
```

### Step 6: Verify Setup

```bash
# Test API Gateway
curl http://localhost:8000/health

# Test Resume Analyzer
curl http://localhost:8003/health

# Test Profile Service
curl http://localhost:8006/health
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
npm run build
```

2. Deploy `dist/` folder to Vercel or Netlify

3. Set environment variables:
- `VITE_GEMINI_API_KEY`
- `VITE_API_URL` (your backend URL)

### Backend Deployment (Railway/Render)

1. Create account on Railway or Render

2. Connect GitHub repository

3. Set environment variables in platform dashboard

4. Deploy each service separately or use Docker Compose

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] User registration
- [ ] User login
- [ ] JWT token validation
- [ ] Protected route access

#### Resume Analyzer
- [ ] Upload PDF resume
- [ ] Upload DOCX resume
- [ ] Analyze resume for job role
- [ ] View analysis results
- [ ] Check analysis history

#### Profile Builder
- [ ] Upload resume
- [ ] Extract profile data
- [ ] Edit profile information
- [ ] Add education/experience
- [ ] Update skills

#### Course Generation
- [ ] Generate new course
- [ ] View course content
- [ ] Complete chapters
- [ ] Take quizzes
- [ ] View flashcards

#### Interview Coach
- [ ] Start technical interview
- [ ] Start aptitude test
- [ ] Start HR interview
- [ ] Submit answers
- [ ] View results

### API Testing

Use Postman or curl:

```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## 🔮 Future Enhancements

### Short-term (1-3 months)
- Real-time collaboration features
- Advanced analytics dashboard
- Mobile app (React Native)
- Enhanced AI features

### Medium-term (3-6 months)
- Social features (peer review, communities)
- Premium subscription model
- Integration with LinkedIn/GitHub
- ATS export functionality

### Long-term (6-12 months)
- AI-powered job matching
- Enterprise features
- Multi-language support
- Certification programs

---

## 📊 Project Statistics

### Codebase Metrics
- **Frontend Files:** 150+ TypeScript/TSX files
- **Backend Files:** 20+ Python files
- **Database Tables:** 8+ tables
- **API Endpoints:** 50+ endpoints
- **Components:** 100+ React components

### Services Status
- ✅ **6 Services** Fully Operational
- ⚠️ **1 Service** Partially Complete
- 📋 **2 Services** Planned

### Features Completed
- ✅ **Resume Analysis** - 100%
- ✅ **Profile Building** - 100%
- ✅ **Course Generation** - 100%
- ✅ **Interview Coaching** - 100%
- ✅ **Emotion Detection** - 100%
- ⚠️ **DSA Practice** - 60%

---

## 📝 Conclusion

StudyMate is a **production-ready** AI-powered learning platform with comprehensive features for career development. The platform successfully integrates multiple AI services, provides real-time feedback, and offers a modern, user-friendly interface.

### Key Achievements

1. **Microservices Architecture** - Scalable and maintainable
2. **AI Integration** - Multiple AI models working together
3. **Real-time Features** - Live interview coaching with emotion detection
4. **Modern Stack** - Latest technologies and best practices
5. **Production Ready** - Fully functional with error handling

### Next Steps

1. Complete DSA Service backend
2. Add advanced analytics
3. Implement real-time notifications
4. Deploy to production
5. Gather user feedback and iterate

---

## 📞 Support & Contact

For questions or issues:
- Check documentation in `docs/` folder
- Review troubleshooting guides
- Open an issue on GitHub

---

**Document Version:** 2.0.0  
**Last Updated:** January 2025  
**Maintained By:** StudyMate Development Team
