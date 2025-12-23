# Agent Specification: 02_Resume_Agent ("The Analyst")

## 🌟 Executive Summary
The **Resume Agent** represents a "Recruiter-in-a-Box". It dynamically adapts its criteria based on the standard `Job Description (JD)` provided by the user. 

It is **NOT** a static rule engine. It uses LLMs to "read" the resume like a human, understanding context, impact, and nuance.

---

## 🛠️ The Tech Stack (Concrete Implementation)

| Component | Technology | Purpose |
|-----------|------------|---------|
| **PDF Parser** | `pypdf` + `pdf2image` | Extracts text layers from uploaded PDFs. |
| **OCR Engine** | `pytesseract` | **Fallback**: If PDF provides no text (image-based), we OCR it. |
| **Analysis Brain** | **Groq (Llama 3.1 70B)** | The intelligence. Fast (500 tokens/s) & smart enough for nuance. |
| **JSON Parser** | `Pydantic` | Ensures the LLM output is strictly formatted for our Frontend. |
| **Vector DB** | `MongoDB Atlas` | Stores the analysis result for the *Course Agent* to read. |

---

## 🧠 The "Dynamic" 5-Pillar Engine

The analysis dynamically changes based on the **Job Description**.

### 1. 🔍 ATS Discovery (The "Gatekeeper")
*   **Logic**: Can we mechanically extract text?
*   **Dynamic Check**:
    *   If `text_extraction_confidence < 50%` → **FAIL**.
    *   *Action*: Auto-convert resume to clean Markdown/DOCX format.

### 2. 🛠️ Competency Match (The "Hard Skills")
*   **Dynamic Weighting**:
    *   JD says: "Must have Python". (Python = **Critical Weight**).
    *   JD says: "Nice to have AWS". (AWS = **Bonus Weight**).
*   **Scoring**:
    *   Matched Critical Skill = +10 pts.
    *   Matched Bonus Skill = +2 pts.
    *   *Missing Critical Skill* = **Trigger Course Agent**.

### 3. 🤝 Behavioral Traits (The "Soft Skills")
*   **Logic**: Maps JD keywords like "Team player" or "Leader" to evidence in Resume.
*   **Extraction**:
    *   *JD*: "Looking for a **mentor**..."
    *   *Resume*: "Managed 3 junior devs..." -> **MATCH**.

### 4. 📈 Impact Analysis (The "Recruiter Eye")
*   **Logic**: Scans for **Quantifiable Action Verbs**.
*   **The Formula**:
    $$ Score = \frac{\text{Bullets with Numbers}}{\text{Total Bullets}} \times 100 $$
*   *Goal*: > 40% of bullet points should have numbers (%, $, x).

### 5. 📐 Structural Readiness (The "Visuals")
*   **Checks**:
    *   Page Count (Ideal: 1-2).
    *   Contact Info Presence (Phone/Email/LinkedIn).
    *   Section Headers (Experience, Education).

---

## 🔄 Technical Workflow & API Design

### POST `/api/resume/analyze`

**Request**:
```json
{
  "user_id": "12345",
  "job_description_text": "We need a Senior Python Developer with AWS experience...",
  "resume_file": "(Binary PDF Data)"
}
```

**Step 1: The "Reader" (Backend)**
```python
# dynamic_parser.py
try:
    text = pypdf.read(file)
except:
    text = tesseract.image_to_string(file) # OCR Fallback
```

**Step 2: The "Brain" (Groq Prompt)**
```python
system_prompt = f"""
You are a Senior Tech Recruiter. Analyze this resume for the specific JD.

JD Context: {jd_text}
Resume Context: {resume_text}

Task: Perform a 5-Pillar Analysis.
1. ATS_Discovery: Is the text clean?
2. Competency_Match: List MISSING "Must-Have" skills.
3. Behavioral_Traits: Find evidence of specific culture fit.
4. Impact_Analysis: Count bullets with metrics.
5. Structural_Readiness: Check formatting.

Return STRICT JSON.
"""
```

**Step 3: The "Response" (Frontend Usage)**
```json
{
  "total_score": 72,
  "pillars": {
    "competency_match": {
      "score": 60,
      "missing_critical": ["Docker", "Kubernetes"],
      "action": "TRIGGER_COURSE_AGENT" 
    },
    "impact_analysis": {
      "score": 50,
      "feedback": "You listed tasks, not results. Change 'Worked on API' to 'Scaled API to 10k users'."
    }
  }
}
```

---

## 🔌 Agentic Integration (The "Magic")

This is what makes it dynamic:

1.  **Resume Agent** finishes analysis.
2.  **Logic**: `If missing_critical contains "Docker"`:
3.  **Event Firing**: `redis.publish("SKILL_GAP", payload={"skill": "Docker"})`
4.  **Course Agent** wakes up -> **Generates "Docker Interview Crash Course"**.
5.  **User Notification**: "Your resume is weak on Docker. I've prepared a 20-min refresher course for you."

---

## ✅ Deliverable Checklist
- [ ] `POST /analyze` endpoint setup.
- [ ] OCR integration (Tesseract).
- [ ] Groq JSON Prompt engineering.
- [ ] Redis Event publisher for Course Agent.
