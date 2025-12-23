# Agent Specification: 01_Onboarding_Agent ("The Architect")

## 🌟 Executive Summary
The **Onboarding Agent** is the entry point to the platform. Unlike traditional apps that use static forms ("Enter Name", "Select Role"), this agent acts as a **Career Counselor**. 

It conducts a **Conversational Diagnosis** to build a comprehensive `User Profile` that powers all other agents. It doesn't just ask *what* you want to do; it understands *how* you learn and *why* you are here.

---

## 🧠 Core Capabilities (The "Diagnosis")

### 1. 🎯 Goal Decomposition
It turns vague desires into concrete technical roadmaps.
*   **User:** "I want to be a Full Stack Dev."
*   **Agent (Internal Thought):** "Full Stack is too broad. I need to narrow it down."
*   **Agent (User Facing):** "Great choice! Do you prefer the **MERN stack** (MongoDB, Express, React, Node) or a **Python-based** backend (Django/FastAPI)?"

### 2. 🧠 Learning Style Profiling
It determines *how* the Course Agent should teach this user.
*   **Question:** "When you learn a new tool, do you prefer to **watch a tutorial first** or **jump into the docs**?"
*   **Inference:**
    *   "Watch tutorial" → Tag as `Visual_Learner` (Prioritize Video/Diagrams).
    *   "Jump into docs" → Tag as `Text_Learner` (Prioritize Articles/Documentation).
    *   "Just write code" → Tag as `Kinesthetic_Learner` (Prioritize Coding Sandboxes).

### 3. 🔍 Skill Gap Analysis (The "Pre-Test")
It acts as a dynamic examiner.
*   **Context:** User claims to know "React".
*   **Agent Action:** "Since you know React, how would you handle state management for a large e-commerce app? Redux, Context API, or something else?"
*   **Result:**
    *   *User answers well*: Mark React as `Intermediate/Advanced`.
    *   *User struggles*: Mark React as `Beginner` and schedule a "React Fundamentals" refresher.

---

## 🗣️ User Flow (The Script)

**Phase 1: The "Vibe Check" (0-2 mins)**
*   **Agent**: "Hi VISHWA! I'm your Career Architect. Are we preparing for a specific **Interview** coming up, or are we **General Upskilling**?"
*   *User*: "I have an interview at Amazon next week."
*   **Agent Strategy**: Enable `Urgent Mode`. Skip long courses. Activate **Interview Agent** and **DSA Agent** immediately.

**Phase 2: The "Deep Dive" (2-5 mins)**
*   **Agent**: "Amazon focuses heavily on DSA and Leadership Principles. Let's check your DSA base. Can you reverse a linked list in your head?"
*   *User*: "Uh, I think so..."
*   **Agent Strategy**: Flag `Linked Lists` as `Weak`. Add "Linked Lists" to the **Immediate To-Do List**.

**Phase 3: The "Commitment" (Final step)**
*   **Agent**: "Okay, we have 7 days. I've built a 'Amazon Crash Course' for you. I need you to commit to **2 hours a day**. Can you do that?"
*   *User*: "Yes."
*   **Agent Action**: Triggers **Accountability Agent** to set reminders for 2 hours daily.

---

## 🛠️ Technical Implementation

### 1. Input/Output
*   **Input**: Natural Language (Chat interface).
*   **Output**: JSON Object (The "User Persona").

### 2. The "Persona" JSON (Stored in MongoDB `users` collection)
The agent's ultimate deliverable is populating this document:

```json
{
  "_id": "user_123",
  "name": "User",
  "profile": {
    "career_goal": "Senior Backend Engineer",
    "timeline": "3 months",
    "urgency": "high", // "high" (Interview prep) vs "low" (Upskilling)
    "learning_style": "visual", // "visual", "text", "interactive"
    "current_stack": ["Python", "FastAPI"],
    "target_stack": ["Go", "Kubernetes"],
    "skill_levels": {
      "python": 8,
      "docker": 2, // Needs course
      "system_design": 4
    }
  },
  "settings": {
    "daily_commitment_minutes": 120,
    "notification_frequency": "aggressive" // "gentle" vs "aggressive"
  }
}
```

### 3. Agent Prompts (System Instructions)
**Model**: `Llama 3.1 70B` (Groq) - We need high intelligence/reasoning here, not just speed.

```xml
<system_prompt>
You are the Onboarding Architect. Your goal is NOT to answer questions, but to DIAGNOSE the user.
Step 1: Determine Urgency (Interview vs Learning).
Step 2: Determine Learning Style.
Step 3: Assess Current Skills (Ask 1 targeted technical question).

DO NOT ask for a resume yet (The Resume Agent handles that).
DO NOT start teaching yet (The Course Agent handles that).

Keep messages short, encouraging, and professional.
</system_prompt>
```

---

## 🔌 Integration with Other Agents

1.  **→ To Resume Agent**: "User is targeting 'Backend Dev'. Please parse their resume and highlight missing Backend keywords."
2.  **→ To Course Agent**: "User is a 'Visual Learner' and doesn't know 'Docker'. Generate a *Video-heavy* Docker course."
3.  **→ To Accountability Agent**: "User promised 2 hours/day. If they don't log in by 8 PM, send a notification."

---

## ✅ Success Metrics for this Agent
1.  **Completion Rate**: > 90% of users finish the onboarding chat.
2.  **Profile Depth**: Successfully populates > 80% of the `profile` JSON fields.
3.  **User Sentiment**: User feels "understood" (measured by first-week retention).
