# AI-Powered Intelligent Assessment & Personalized Learning Platform
> **Final-Year B.Tech Computer Science & Engineering Capstone Project**  
> *Production-Minded Higher Education EdTech Platform*

---

## 1. Project Overview

The **AI-Powered Intelligent Assessment & Personalized Learning Platform** is an enterprise-grade academic ecosystem engineered to solve the acute limitations of traditional standardized testing and static learning management systems. Designed with a dual-engine architecture, it bridges rigorous, institutional assessment creation with hyper-personalized student remediation.

- **Module A: AI-Powered Intelligent Assessment (Faculty Suite)**: Empowers educators to upload curriculum materials, synthesize Bloom-calibrated questions into a structured draft pool, conduct human-in-the-loop verification, maintain an immutable **Approved Question Bank**, assemble quota-controlled examinations with single-attempt enforcement, and monitor cohort analytics.
- **Module B: AI-Powered Personalized Learning (Scholar Cockpit)**: Provides students with an adaptive practice drill system, Socratic AI tutoring grounded in faculty materials, continuous radar gap analytics, personalized remediation study plans, interactive roadmap trees, and spaced-repetition flashcards.
- **The Core Unifying Invariant**: The **Student Learning Profile** forms a closed-loop data bridge between Module A and Module B, ensuring that assessment struggle points directly feed adaptive practice difficulty and tutoring guidance.

---

## 2. Problem Statement: The Traditional Assessment Crisis

Higher education institutions face severe systemic bottlenecks:
1. **Static, Uncalibrated Question Authoring**: Faculty spend dozens of hours writing exams manually or relying on repetitive textbook question pools prone to student memorization.
2. **Disconnected Assessment & Remediation**: After an exam, students receive a single scalar grade (e.g. 62%) with zero diagnostic insight into specific cognitive deficiencies or misconceptions.
3. **The AI Hallucination & Quality Hazard**: Uncontrolled AI quiz generators generate unverified, hallucinatory questions on-the-fly, leading to factual errors and loss of faculty trust.
4. **Lack of Adaptive Differentiation**: High-performing students face unchallenging busywork while struggling students face overwhelming failure without scaffolded remediation.
5. **Academic Integrity Vulnerabilities**: Online assessments suffer from rampant tab-switching, unauthorized assistance, and unmonitored multiple attempts.

Our platform directly resolves every dimension of this crisis.

---

## 3. Core Product Vision & The Central Product Loop

The platform operates around a continuous, self-reinforcing five-stage learning loop:

```
    ┌───────────────┐
    │   1. LEARN    │ ◄── Faculty Materials & Socratic AI Tutor
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │   2. ASSESS   │ ◄── Controlled Assessments & Single-Attempt Engine
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  3. ANALYZE   │ ◄── Automated Evaluation, Diagnostic Radar & Telemetry
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ 4. PERSONALIZE│ ◄── Adaptive Practice Matrix & Dynamic Study Plans
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  5. IMPROVE   │ ◄── Topic Re-Evaluation & Learning Profile Update
    └───────┬───────┘
            │
            └─────────► Returns to (1) LEARN for Next Competency
```

Every attempt in an assessment or adaptive drill immediately updates the student's rolling topic accuracy, recalculating their recommended difficulty tier for future practice sessions.

---

## 4. Key Features

### Module A: Teacher Assessment Platform
- **Curriculum Document Ingestion**: Upload multi-format course materials (PDF, PPTX, DOCX, TXT) with full text extraction and metadata indexing.
- **AI-Assisted Question Pool Generation**: Synthesizes candidate questions with Bloom's taxonomy classifications (Remember, Understand, Apply, Analyze, Evaluate, Create).
- **Strict Approval Gate**: All AI-generated items land in a **DRAFT** state. Teachers review, edit, calibrate distractors, reclassify types, or reject items. Only **APPROVED** questions enter the institutional question bank.
- **Assessment Assembler**: Specify exact difficulty distribution quotas (e.g., 5 Easy, 6 Medium, 4 Hard). The engine audits question bank inventory in real time and alerts faculty to deficits before publishing.
- **Single-Attempt Enforcement**: Formal assessments strictly restrict students to one attempt. Subsequent launch attempts are intercepted and locked.
- **Browser-Monitored Examination**: Active proctoring monitors tab departures, fullscreen departures, and blurred windows with verifiable audit logs.
- **Faculty Analytics Suite**: Real-time cohort pass rates, Bloom's cognitive distribution graphs, item discrimination metrics, and AI cohort deficiency diagnostics.

### Module B: Student Personalized Learning
- **Adaptive Practice Drills**: Selects questions strictly from approved bank items based on student topic mastery (e.g., 90% accuracy $\rightarrow$ HARD, 75% $\rightarrow$ MEDIUM, 35% $\rightarrow$ EASY).
- **Socratic AI Tutor**: Engages students with guided questions, step-by-step whiteboard walkthroughs, and conceptual scaffolding without giving away final answers.
- **Interactive Roadmap Trees**: Visual curriculum trees with branching subtopics, difficulty indicators, video/document guides, and progress trackers.
- **Diagnostic Radar & Mastery Index**: Multi-axis radar visualization tracking competencies across data structures, algorithms, and systems engineering.
- **Personalized Remediation Plans**: Dynamically synthesized 7-day study sprints with daily milestones targeting identified bottleneck concepts.
- **Active Recall Flashcards**: Spaced-repetition card decks for core formulas, invariants, and algorithmic time/space bounds.

---

## 5. Controlled Question Bank & Adaptive Question Selection (The Central USP)

### The Approval Workflow
1. Teacher selects subject, topic, and difficulty distribution.
2. AI synthesizes candidate questions saved as `DRAFT`.
3. Teacher inspects each question in the **Question Bank Review Drawer**.
4. Teacher can edit question text, modify options, adjust explanations, or convert question type (`mcq` $\leftrightarrow$ `true_false` $\leftrightarrow$ `fill_in_the_blank`) without losing text.
5. Teacher explicitly clicks **Approve**. Only approved items receive `approvalStatus = 'APPROVED'`.

### Adaptive Selection Algorithm
When a student launches a practice drill on a topic:
$$\text{Student Accuracy} = \frac{\text{Correct Attempts}}{\text{Total Attempts}} \times 100$$
- **Accuracy $\ge 80\%$**: System selects **HARD** questions.
- **Accuracy between $60\%$ and $79\%$**: System selects **MEDIUM** questions.
- **Accuracy $< 60\%$**: System selects **EASY** questions.
- If inventory in the primary difficulty is exhausted, the algorithm smoothly falls back to the adjacent difficulty level to prevent drill disruption.

---

## 6. 3D Learning Ecosystem Architecture (Three.js Visual Canvas)

The landing page features an interactive 3D WebGL scene rendered via Three.js (`src/components/landing/Ecosystem3DCanvas.tsx`):
- **Five Primary Nodes**:
  1. *Assessment Engine* (Soft Coral `#FF786B`)
  2. *AI Tutor* (Electric Violet `#8B5CF6`)
  3. *Cognitive Analytics* (Aurora Teal `#68E0D0`)
  4. *Personalized Learning* (Luminous Mint `#C7F36D`)
  5. *Student Progress Hub* (Warm Ivory `#F5F0E7`)
- **Glowing Energy Curves**: Quadratic 3D Bezier curves connect all nodes, pulsing with moving particle sprites that represent live student telemetry flowing between systems.
- **Raycasting & Interaction**: Hovering over any node triggers smooth spotlight scaling and updates a live floating HUD telemetry card with real-time operational status.
- **Accessibility & Performance Fallback**: Automatically checks for WebGL availability and `prefers-reduced-motion`. In non-WebGL or low-power environments, gracefully degrades to a responsive SVG network diagram.

---

## 7. Nocturne Aurora Design System & Color Tokens

The visual design language is built on the **Nocturne Aurora** color system:

| Token Name | Hex Code | Semantic Role |
| :--- | :--- | :--- |
| **Obsidian** | `#0E0C10` | Primary deep cosmic background |
| **Aubergine** | `#211522` | Secondary surface and elevated card container |
| **Electric Violet** | `#8B5CF6` | Primary action accent, AI copilot, and links |
| **Aurora Teal** | `#68E0D0` | Telemetry highlights, mastery nodes, and data badges |
| **Luminous Mint** | `#C7F36D` | High achievement indicators, passing grades, and success alerts |
| **Soft Coral** | `#FF786B` | Struggle topic alerts, deficit warnings, and difficulty indicators |
| **Warm Ivory** | `#F5F0E7` | Primary high-contrast text and interactive headings |
| **Dusty Lilac** | `#B9ADBF` | Secondary labels, captions, and muted timestamps |
| **Plum Gray** | `#3A2D3C` | Subtle structural borders and dividing rules |

---

## 8. System Architecture & High-Level Diagrams

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT FRONTEND (React 19 + Vite)             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────┐ │
│  │ Teacher Portal        │  │ Student Cockpit       │  │ Admin Deck  │ │
│  │ (Question Bank, Exam) │  │ (Tutor, Radar, Quiz)  │  │ (Governance)│ │
│  └───────────┬───────────┘  └───────────┬───────────┘  └──────┬──────┘ │
└──────────────┼──────────────────────────┼─────────────────────┼────────┘
               │                          │                     │
               ▼                          ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BACKEND PROXY & REST API (Express on Node.js)      │
│  • /api/question-bank/*          • /api/assessments/*                  │
│  • /api/student/learning-profile • /api/ai/teacher-agent               │
│  • /api/auth/send-otp            • /api/institutions, /api/courses     │
└──────────────┬──────────────────────────┬─────────────────────┬────────┘
               │                          │                     │
               ▼                          ▼                     ▼
┌──────────────────────────┐  ┌───────────────────────┐  ┌───────────────┐
│ Google Gemini 3.8 Flash  │  │ Google Cloud Firestore│  │ Mongoose/Mongo│
│ AI Synthesis & Socratic  │  │ Real-time DB & State  │  │ Relational/   │
│ Tutoring Engine          │  │ Security Rules Guard  │  │ Academic Model│
└──────────────────────────┘  └───────────────────────┘  └───────────────┘
```

---

## 9. Technology Stack

- **Frontend**:
  - React 19 (Hooks, Context, Functional Architecture)
  - TypeScript 5.8
  - Tailwind CSS 4 with custom Nocturne Aurora palette extensions
  - Three.js (`^0.186.1`) for 3D ecosystem visualization
  - Lucide React for crisp, semantic iconography
  - Motion / Framer Motion for micro-interactions
- **Backend & Middleware**:
  - Node.js with Express 4
  - Vite middleware integration (`vite.middlewares`)
  - Server-side Gemini SDK (`@google/genai`)
  - Institutional OTP email service (`nodemailer`)
  - Native Node.js `zlib` stream decompressor for `.pptx` / `.docx` XML parsing
- **Database & Persistence**:
  - Google Cloud Firestore (Primary real-time data layer with granular security rules)
  - Mongoose Models & TypeScript Schemas (`server/models/academicModels.ts`, `server/models/themeModels.ts`)
  - In-Memory Hybrid Seed Store with LocalStorage synchronization
- **AI & Cognitive Models**:
  - Primary: `gemini-3.8-flash` via `@google/genai`
  - Fallback: `gemini-flash-latest` with timeout racing and contextual heuristic fallbacks

---

## 10. Database Models & Schema Specifications

The system defines 10 core entities in `server/models/academicModels.ts` and `server/models/themeModels.ts`:

1. **`Institution`**: University details, domain verification, branding, active flag.
2. **`Course`**: Academic course offering, department, semester, faculty assignments, enrolled students.
3. **`Subject`**: Academic subject, course mapping, syllabus topic array, credit hours.
4. **`Material`**: Uploaded syllabus documents, PDF/PPTX/DOCX metadata, summary, chunks count.
5. **`Question`**: Complete question bank item with text, type (`mcq`, `true_false`, `fill_in_the_blank`), options, correct answer, explanation, subject, topic, difficulty (`EASY`, `MEDIUM`, `HARD`), and approval status (`DRAFT`, `APPROVED`, `REJECTED`).
6. **`Assessment`**: Assessment configuration with title, duration, total marks, difficulty distribution (`easy`, `medium`, `hard`), question IDs, single attempt constraint (`maxAttempts: 1`), and proctoring parameters.
7. **`AssessmentAttempt`**: Student exam submission, started/submitted timestamps, answers map, score, percentage, pass/fail status, violation logs, and topic breakdown.
8. **`LearningProfile`**: Persistent student learning dossier, rolling topic accuracy matrix, weak/strong topic sets, and next recommended remediation actions.
9. **`AuditLog`**: Tamper-evident administrative action log recording user, action, target entity, IP address, and timestamp.
10. **`UserThemePreference` & `InstitutionTheme`**: Granular role-based visual settings, contrast modes, and institution branding.

---

## 11. Folder Structure

```
├── .aistudio/
│   └── artifacts/             # Project implementation plans and logs
├── public/
│   ├── assets/                # Reference diagrams, logos, and roadmaps
│   └── favicon.ico
├── server/
│   ├── api.ts                 # Complete Express REST API router & Gemini endpoints
│   ├── emailService.ts        # Institutional OTP verification engine
│   └── models/
│       ├── academicModels.ts  # Mongoose schemas for all 9 academic entities
│       └── themeModels.ts     # User & Institution theme schemas
├── src/
│   ├── components/
│   │   ├── admin/             # Admin Governance Deck & Branding Panel
│   │   ├── auth/              # Institutional Login & OTP verification modal
│   │   ├── common/            # Toast, Confirmation modals, Badges
│   │   ├── landing/           # Landing page & Three.js 3D Ecosystem Canvas
│   │   ├── student/           # PracticeQuizView, ExamEngine, TutorView, RadarView
│   │   └── teacher/           # QuestionBankView, CreateAssessmentView, AnalyticsView
│   ├── context/
│   │   ├── AuthContext.tsx    # Multi-role authentication & session state
│   │   └── ThemeContext.tsx   # Nocturne Aurora theme provider
│   ├── design-system/
│   │   └── tokens.ts          # Nocturne Aurora color constants and design tokens
│   ├── lib/
│   │   ├── firebase.ts        # Firebase client SDK initialization
│   │   └── institutions.ts    # Verified university consortium registry
│   ├── services/
│   │   ├── learningProfileService.ts  # Learning profile synchronization
│   │   ├── questionSelectionService.ts# Approved bank filtering & adaptive selector
│   │   └── ragService.ts              # Independent RAG architectural interface
│   ├── types/
│   │   └── index.ts           # Unified TypeScript domain definitions
│   ├── App.tsx                # Master routing, navigation, and role orchestration
│   ├── main.tsx               # Client entry point
│   └── index.css              # Global styles & Tailwind imports
├── firestore.rules            # Firestore security rules
├── package.json               # Dependencies and scripts
├── server.ts                  # Production & dev server entry point
├── vite.config.ts             # Vite build configuration
└── README.md                  # Comprehensive platform documentation
```

---

## 12. Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (Auto-provisioned in AI Studio)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 13. Installation & Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or higher

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/institution/intelligent-assessment-platform.git
   cd intelligent-assessment-platform
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY into .env
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## 14. Development Commands & Scripts

- `npm run dev`: Boots the full-stack Express server with integrated Vite HMR on port 3000.
- `npm run build`: Executes TypeScript compilation (`tsc -b`) and bundles client assets via Vite.
- `npm run lint`: Validates TypeScript syntax, unused imports, and strict type adherence.
- `npm start`: Runs the production server (`node server.ts`).

---

## 15. REST API Documentation

### System Health
- `GET /healthz` $\rightarrow$ Plain text `OK` (Cloud Run readiness probe).
- `GET /api/health` $\rightarrow$ `{ "success": true, "message": "Server is running" }`.

### Authentication
- `POST /api/auth/send-otp` $\rightarrow$ Sends a 6-digit institutional OTP code.
- `POST /api/auth/verify-otp` $\rightarrow$ Validates the OTP and activates the session.

### Controlled Question Bank
- `POST /api/question-bank/inventory` $\rightarrow$ Returns counts of Approved vs Draft questions broken down by Easy, Medium, and Hard.
- `POST /api/question-bank/select-for-assessment` $\rightarrow$ Selects approved questions strictly matching the requested `{ easy, medium, hard }` quotas. Returns error code `INSUFFICIENT_APPROVED_QUESTIONS` if a deficit exists.
- `POST /api/question-bank/select-adaptive-practice` $\rightarrow$ Retrieves questions matching student mastery tier for a given topic.

### Academic Resources & Materials
- `GET /api/institutions` / `POST /api/institutions` $\rightarrow$ Consortium university management.
- `GET /api/courses` / `POST /api/courses` $\rightarrow$ Course offerings and enrollment.
- `GET /api/subjects` / `POST /api/subjects` $\rightarrow$ Subject curriculum specifications.
- `GET /api/materials` / `POST /api/materials` $\rightarrow$ Curriculum document uploads.
- `GET /api/study-plans` / `POST /api/study-plans` $\rightarrow$ Dynamic remediation study plan generation.
- `GET /api/audit-logs` $\rightarrow$ Administrative security event trail.

### Cognitive AI Services
- `POST /api/ai/diagnose-cohort-deficiency` $\rightarrow$ Analyzes cohort submissions and detects the single most pressing pedagogical misconception.
- `POST /api/ai/teacher-agent` $\rightarrow$ Generates rubrics, lesson plans, exam blueprints, and ABET compliance artifacts across 60 educator workflows.
- `POST /api/ai/copilot-chat` $\rightarrow$ Interactive custom cockpit tool builder with plain-English whiteboard proofs.

---

## 16. Roles, Permissions & Access Control (RBAC)

The platform enforces three distinct operational personas:

1. **Student (`role: 'student'`)**:
   - Practice adaptive quizzes on any curriculum topic.
   - Launch formal proctored examinations (strictly 1 attempt per assessment).
   - Consult Socratic AI tutor for conceptual hints and walkthroughs.
   - View personalized diagnostic radar and study plans.
   - Interactive roadmaps and spaced repetition flashcards.
   - Cannot view draft questions, answer keys, or other students' attempts.

2. **Teacher (`role: 'teacher'`)**:
   - Ingest course syllabus documents and curriculum slides.
   - Trigger AI draft question generation.
   - Review, edit, convert, approve, and delete question bank items.
   - Create assessments with strict difficulty quotas.
   - Inspect cohort progression, item discrimination, and struggle gaps.
   - Launch Atom AI diagnostic inquiries on individual students.

3. **Administrator (`role: 'admin'`)**:
   - Institutional domain verification and consortium registration.
   - User account lifecycle management (activation, role changes, suspension).
   - Global institutional branding and UI theme configuration.
   - Tamper-evident audit log review.

---

## 17. Proctoring & Anti-Cheating Protocol

To guarantee exam credibility in remote and unproctored environments:
- **Strict Single-Attempt Enforcement**: Assessment attempts are tracked in both localStorage and the backend. Once an attempt is submitted or initiated, subsequent access attempts are permanently blocked with a dedicated "Attempt Already Completed" barrier.
- **Tab Departures**: Detects window blur and document visibility state changes. Violations trigger an immediate warning toast and append a timestamped log to `violationLogs`.
- **Fullscreen Lock**: Assessments launch in browser fullscreen. Escaping fullscreen increments the violation tally.
- **Exceeding Violation Threshold**: If violations exceed the configured threshold (default: 3), the exam is auto-submitted and flagged for faculty review.
- **Keyboard Protection**: Common developer inspection shortcuts (`F12`, `Ctrl+Shift+I`, `Ctrl+U`) and copy-paste shortcuts are intercepted and prevented.

---

## 18. Independent RAG Architecture Boundary (`IRAGService`)

In accordance with architectural modularity, the Retrieval-Augmented Generation boundary is isolated in `src/services/ragService.ts`:
- **Interface Segregation**: Exposes `IRAGService`, `RetrievedDocumentChunk`, and `RAGRetrievalResult` without coupling to vendor-specific vector databases (e.g. Pinecone, Weaviate, Milvus) or heavy orchestration libraries (LangChain, LlamaIndex).
- **Anti-Hallucination Grounding**: All AI Tutor responses require verified citations linking back to uploaded document chunks. Unsubstantiated claims are flagged with confidence penalties.
- **Future Integration Ready**: Teams can drop in an embedding pipeline (e.g. `text-embedding-004` + PostgreSQL `pgvector` or Cloud SQL) behind this exact interface with zero frontend modifications.

---

## 19. Testing, Verification & Lint Discipline

The platform maintains zero-error compilation and linting discipline:
- **Build Verification**: `npm run build` verifies clean Vite bundle generation and TypeScript type soundness.
- **Lint Verification**: `npm run lint` enforces zero undefined variables, correct import paths, and strict typing.
- **Graceful Offline Degeneracy**: All Gemini endpoints feature structured heuristic fallback generators, guaranteeing that network interruptions or rate limits never break the user experience.

---

## 20. Known Limitations, Future Scope & Capstone Defense Notes

### Capstone Defense Highlights
- **Human-in-the-Loop AI**: Emphasize to the academic evaluation committee that AI does *not* autonomously create unverified exams for students; it acts as an intelligent assistant to faculty, with strict teacher review and approval gates.
- **Psychometric Validity**: Questions are indexed by Bloom's Cognitive Taxonomy and difficulty quotas, moving assessment design from haphazard guesses to psychometric rigor.
- **Personalized Closed Loop**: The central USP is the seamless bridge from assessment struggle points to instant adaptive practice drills.

### Future Scope & Production Roadmap
- **Self-Hosted Vector Embeddings**: Implement PostgreSQL `pgvector` behind `src/services/ragService.ts` for dense semantic search over multi-gigabyte textbook libraries.
- **Live Video Proctoring with WebRTC**: Add real-time gaze tracking and secondary device detection using client-side TensorFlow.js models.
- **LTI 1.3 / Canvas / Moodle Integration**: Connect grade passback via the IMS Global Learning Tools Interoperability standard.
- **Multi-Faculty Co-Authoring**: Real-time collaborative question drafting with version control and difference diffing.

---

*Authored by Final-Year B.Tech Computer Science & Engineering Students — AI-Powered Intelligent Assessment & Personalized Learning Platform.*
