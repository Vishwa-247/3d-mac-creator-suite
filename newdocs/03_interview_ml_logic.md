# Interview Module - Agentic ML Architecture Deep Dive

## 🎯 Objective
Build a real-time, multi-modal interview coach that analyzes both **visual** (face emotion) and **audio** (speech emotion + content) cues to provide human-like feedback.

---

## 🏗️ High-Level Architecture

```mermaid
graph TD
    User[User Webcam + Mic] --> Frontend[React Frontend]
    
    Frontend --> |Video Frames (30 FPS)| MediaPipe[MediaPipe Mesh]
    Frontend --> |Face ROI (1 FPS)| EmotionAPI[Mini-Xception API]
    Frontend --> |Audio Chunk (5s)| SpeechAPI[Speech Emotion API]
    
    MediaPipe --> |"Gaze: Center, Blink: Low"| LogicLayer[Metric Logic Layer]
    EmotionAPI --> |"Neutral: 0.9"| LogicLayer
    SpeechAPI --> |"Tone: Steady"| LogicLayer
    
    LogicLayer --> |"Confidence: 85%"| Aggregator[Feedback Aggregator]
    
    Aggregator --> |Real-time Nudges| Frontend
    Aggregator --> |Final Report| AgentMemory[Agent Memory]
```

---

## 🧠 1. Visual Emotion Detection (Face)

### **Current State**:
- You have a basic implementation in `backend/agents/emotion-detection`.
- Uses `haarcascade` for fece detection (slow, outdated).
- Uses a pre-trained ViT model (good, but heavy).

### **Upgrade Plan: Agentic & Real-time**

We will combine **Deep Learning (Emotion)** with **Geometric Vision (MediaPipe)** to get a full signal.

#### **Step 1: The "Signals" (Raw Data)**
1.  **Face Expression** (Mini-Xception Model):
    - Output: `Happy: 0.1`, `Neutral: 0.8`, `Fear: 0.05`
2.  **Gaze & Head Pose** (MediaPipe Face Mesh):
    - **Gaze**: Is user looking at camera? (Yes/No)
    - **Head Nod**: Is user nodding? (Agreement/Engagement)
    - **Blink Rate**: Blinks per minute (High = Stress).

#### **Step 2: The "Mapping Layer" (Interview Metrics)**
We translate raw signals into **4 Key Interview Metrics**:

| Raw Signals (Inputs) | Interview Metric (Output 0-100) | Interpretation |
|----------------------|---------------------------------|----------------|
| `Happy` + `Neutral` + `Steady Gaze` | **Confidence** | Calm, composed, making eye contact. |
| `Head Nod` + `Forward Lean` + `Gaze` | **Engagement** | Actively listening and interested. |
| `Fear` + `Rapid Blinks` + `Shaky Voice` | **Nervousness** | Stressed, anxious (needs calming). |
| `Sad` + `Looking Down` + `Monotone` | **Low Energy** | Disengaged or unsure. |

#### **Step 3: Model Selection (Speed vs Accuracy)**
We need a model that uses **MediaPipe** for geometry and **Mini-Xception** for emotion.

| Model | Role | Speed (CPU) | Recommendation |
|-------|------|-------------|----------------|
| **MediaPipe Face Mesh** | Gaze, Blinks, Head Pose | ⚡ Super Fast (5ms) | **Essential for Confidence** |
| **Mini-Xception** | Emotion (Happy/Sad/etc) | ⚡ Fast (20ms) | **Use for Real-time Feedback** |
| **ViT (Transformer)** | Deep Emotion Analysis | 🐢 Slow (200ms) | Use only for final report |

#### **Step 4: Dataset Sourcing (Free)**
1.  **Emotion**: **FER2013** (Kaggle) - for training the Mini-Xception model.
2.  **Gaze/Pose**: **MediaPipe Pre-trained** - No training needed! logic-based calculation.

1. **Download Dataset**:
   ```bash
   # We will create a script to auto-download this
   kaggle datasets download -d msambare/fer2013
   ```

2. **Preprocessing**:
   - Data Augmentation: Rotation, zoom, horizontal flip (crucial for webcam variability).
   - Normalization: Scale pixel values to 0-1.

3. **Training Script (`backend/ml/train_emotion.py`)**:
   - Framework: PyTorch or TensorFlow (Keras).
   - **Recommendation**: TensorFlow/Keras is easier for deployment (TFLite).

4. **Inference Optimization**:
   - Convert trained model to **ONNX** or **TFLite**.
   - This makes it run 4x-5x faster on standard CPUs.

---

## 🎤 2. Audio Emotion Detection (Speech)

### **Why we need it**:
A user might *smile* (visual = happy) but have a *shaky voice* (audio = nervous). Combining both gives "True Confidence Score".

### **Dataset Sourcing (Free)**
We will use **RAVDESS** (Ryerson Audio-Visual Database of Emotional Speech and Song).
- **Link**: [RAVDESS on Kaggle](https://www.kaggle.com/uwrfkaggler/ravdess-emotional-speech-audio)
- **Classes**: Calm, Happy, Sad, Angry, Fearful, Disgust, Surprise.
- **Format**: WAV audio files.

### **Model Architecture**
- **Input**: MFCCs (Mel-frequency cepstral coefficients) extracted from audio.
- **Model**: **1D CNN** or **LSTM**.
- **Output**: Probability of ["Confident", "Nervous", "Monotone", "Excited"].

---

## 🤖 3. The "Agentic" Feedback Loop

Real magic happens when we combine these signals.

### **Scenario: The "Fake Smile" Candidate**
1. **Visual Agent** detects: `Happy (0.9)` (User is smiling).
2. **Audio Agent** detects: `Fearful (0.7)` (Voice is shaky).
3. **Content Agent** detects: `Hesitation words` ("Um, uh, I think...").

**Agentic Decision Engine:**
> *"User is masking nervousness with a smile. Intervention needed."*

**Action:**
- **Real-time**: Show a subtle prompt: "Take a deep breath. You're doing great."
- **Post-Interview**: "You smiled often, but your vocal tone indicated stress. Try practicing slower breathing."

---

## 🛠️ Implementation Steps

### **Phase 1: Visual ML Pipeline (Week 1)**
- [ ] Create `backend/ml/datasets/` directory.
- [ ] Write `download_fer2013.py` script.
- [ ] Build `MiniXception` model architecture in PyTorch.
- [ ] Train model on local machine (or Google Colab) and save `.pth` file.
- [ ] Update `backend/agents/emotion-detection/main.py` to use the new lightweight model.

### **Phase 2: Audio ML Pipeline (Week 2)**
- [ ] Download RAVDESS dataset.
- [ ] Create feature extraction pipeline (Librosa -> MFCC).
- [ ] Train simple 1D CNN for Speech Emotion Recognition (SER).
- [ ] Create new microservice: `backend/agents/speech-emotion`.

### **Phase 3: Integration (Week 3)**
- [ ] Update Frontend to send audio blobs + video frames.
- [ ] Build **Aggregator Logic** in the Orchestrator to combine scores.
- [ ] Store session metadata in MongoDB `interview_sessions` for long-term progress tracking.

---

## 📦 Deliverables for You
1. **Training Notebooks**: I will generate clean, commented Jupyter notebooks for training both Face and Voice models.
2. **Pre-trained Weights**: We can start with public weights so you don't *have* to train immediately.
3. **Inference API**: Fast, optimized FastAPI endpoints.

## 🚀 Next Step
Shall I create the **Training Notebook for Face Emotion** first, or do you want to set up the **Dataset Downloader** script?
