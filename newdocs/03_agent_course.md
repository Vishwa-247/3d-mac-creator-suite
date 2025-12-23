# Agent 03: The Course Agent (Adaptive Learning Engine)

## 1. Agent Role & Purpose
**Role:** The "Teacher" & "Curriculum Designer".
**Purpose:** To dynamically generate personalized learning modules based on user goals, skill gaps (from Resume/Onboarding agents), or explicit user requests. Unlike static platforms (Udemy/Coursera), this agent *builds* the course for the user in real-time, adapting content depth and modality.

## 2. Key Capabilities
1.  **Dynamic Syllabus Generation**: Creates a structured learning path (Chapters -> Sub-topics) tailored to the user's specific gap (e.g., "Learn React for a Senior Dev role" vs "Learn React for a total beginner").
2.  **Multi-Modal Content**:
    *   📖 **Read Mode**: Markdown tutorials with analogies and ASCII diagrams.
    *   🎧 **Listen Mode**: Text-to-Speech (Google TTS) scripts for commuting/audio-learners.
    *   💻 **Practice Mode**: Coding challenges (Judge0) embedded directly in the flow.
3.  **Adaptive Remediation**: If a user fails a concept quiz, the agent *immediately* generates a remedial mini-chapter to explain that specific concept differently (e.g., "Explain it like I'm 5") before allowing progress.

## 3. Triggers & Inputs
*   **Explicit**: User types "Help me learn Recursion" in the dashboard.
*   **Implicit (Event-Driven)**:
    *   `SKILL_GAP_DETECTED` (from Resume Agent): e.g., "Missing Docker experience".
    *   `INTERVIEW_MISTAKE` (from Interview Agent): e.g., "Failed to optimize Space Complexity".
    *   `QUIZ_FAILED`: User scored < 70% on "useEffect hook".

## 4. Technical Stack
*   **Brain**: **Gemini 1.5 Flash** (Best for long-context generation & structured output).
*   **Memory**: **MongoDB Vector Search** (To retrieve user's learning style & past failures).
*   **Code Execution**: **Judge0** (Self-hosted via Docker) for running specific coding exercises.
*   **Audio**: **Google TTS API** (Free tier) for generating audio lectures.

## 5. Agent Workflow

### Step 1: Syllabus Generation (The "Blueprint")
**Input**: Topic ("System Design"), User Context ("Junior Dev expecting promotion").
**Prompt Strategy**:
> "Act as a Senior Staff Engineer. Create a 4-week syllabus for a Junior Dev to master System Design. Break it into modules. For each module, list 3 key concepts and 1 practical project."

**Output (JSON)**:
```json
{
  "course_id": "sys_design_101",
  "modules": [
    { "title": "Load Balancing", "concepts": ["L4 vs L7", "Consistent Hashing"], "project": "Configuring Nginx" }
  ]
}
```

### Step 2: Content Generation (Just-in-Time)
The agent generates content *one module at a time* to manage latency and cost.
**Input**: Module Title ("Load Balancing").
**Prompt Strategy**:
> "Generate a comprehensive tutorial on Load Balancing.
> 1. Start with a real-world analogy (e.g., a supermarket checkout).
> 2. Explain technical deep-dive.
> 3. Provide a Python code snippet simulating a Round Robin algorithm.
> 4. Create 3 quiz questions to test understanding."

### Step 3: Interactive Practice
For coding topics, the agent generates a specific JSON payload for the frontend:
```json
{
  "type": "code_challenge",
  "problem_statement": "Implement a function that balances requests...",
  "solution_template": "def load_balancer(requests):",
  "test_cases": [{"input": "[1,2,3]", "expected": "..."}]
}
```
The Frontend sends user code -> Backend -> **Judge0** -> Result -> Agent.

### Step 4: The Loop (Remediation)
If `Quiz Score < 70%`:
1.  **Pause** the syllabus.
2.  **Generate** a "Remediation Node":
    > "The user failed the quiz on Consistent Hashing. Explain it again using a 'Ring of Servers' visual analogy. Keep it under 300 words."
3.  **Present** to user -> Retake Quiz -> Resume Syllabus.

## 6. API Endpoints (FastAPI)

### `POST /api/course/initialize`
*   **Body**: `{ topic: string, context_id: string }`
*   **Action**: Calls Gemini Flash to generate full syllabus structure.
*   **Stores**: Creates `Course` document in MongoDB with `status: "in_progress"`.

### `POST /api/course/generate-module`
*   **Body**: `{ course_id: string, module_index: number }`
*   **Action**: Checks if content exists. If not, calls Gemini Flash.
*   **Returns**: Markdown content, Audio URL (cached), Quiz JSON.

### `POST /api/course/submit-quiz`
*   **Body**: `{ answers: map<string, string> }`
*   **Action**: Grades answers.
*   **Logic**:
    *   If Pass: Updates `user_roadmaps`.
    *   If Fail: Triggers `generate_remediation` task.

## 7. Integration with Frontend (Lovable)
*   **CourseLayout**: Standard sidebar (Syllabus) + Main Content Area.
*   **ContentRenderer**:
    *   Renders Markdown with syntax highlighting.
    *   Embeds `AudioPlayer` for Listen Mode.
    *   Embeds `MonacoEditor` for Practice Mode.
*   **QuizModal**: Pops up at end of module. Blocking (must pass to proceed).
