# Product Requirements Document (PRD): Social Media Comment Collector & AI Analyzer (Next.js)

## 1. Project Overview
The **Social Media Comment Collector & AI Analyzer** is a web-based automation platform built with Next.js. It integrates with official APIs and Webhooks from major social media platforms (TikTok, Instagram, and Meta/Facebook) to automatically capture incoming user comments, store them in a secure database, process them using AI (Google Gemini API) for sentiment analysis and auto-reply suggestions, and display them on a unified dashboard.

---

## 2. Target Audience & Goals
* **Target Audience:** Content creators, community managers, social media marketers, and small business owners handling multiple platforms.
* **Core Goals:**
  * Eliminate manual comment monitoring by centralizing comments from TikTok, IG, and Meta into one dashboard.
  * Automate sentiment tracking and categorization using AI.
  * Accelerate engagement via AI-generated suggested replies.

---

## 3. Core Features & Functional Requirements

### 3.1. Social Media Webhook Integration
* **FR-1.1 (Meta/Instagram/Facebook):** Provide a secure webhook endpoint to receive real-time comment event notifications from Meta Graph API.
* **FR-1.2 (TikTok):** Implement webhook/polling sync mechanisms to capture comments from TikTok content.
* **FR-1.3 (Security):** Verify incoming webhook payloads using platform-specific signatures (e.g., App Secret verification) to prevent unauthorized requests.

### 3.2. Data Ingestion & Storage
* **FR-2.1:** Store captured comments in a relational database (via Prisma/Drizzle ORM) with attributes: `id`, `platform`, `postId`, `commentId`, `username`, `message`, `timestamp`, `sentiment`, and `aiReply`.
* **FR-2.2:** Avoid duplicate entries by enforcing unique constraints on platform-specific `commentId`.

### 3.3. AI-Powered Analysis (Google Gemini API)
* **FR-3.1:** Automatically trigger an AI analysis job upon receiving a new comment.
* **FR-3.2:** Prompt Gemini to classify the sentiment into one of three categories: `Positive`, `Neutral`, or `Negative`.
* **FR-3.3:** Generate a polite, contextual draft response (auto-reply suggestion) based on the comment's content.

### 3.4. Unified Dashboard (Next.js Frontend)
* **FR-4.1:** Display a real-time feed of all incoming comments categorized by platform (TikTok, Instagram, Meta).
* **FR-4.2:** Filter comments by sentiment, platform, or date range.
* **FR-4.3:** View AI analytics summary (e.g., total comments, sentiment breakdown ratio).

---

## 4. Technical Architecture & Tech Stack
* **Framework:** Next.js (App Router, utilizing Server Actions and API Routes)
* **Styling:** Tailwind CSS & shadcn/ui components
* **Database & ORM:** PostgreSQL (Supabase/Neon) with Prisma ORM
* **AI Integration:** `@google/genai` SDK (Google Gemini model, e.g., `gemini-2.5-flash`)
* **Deployment:** Vercel or custom VPS

---

## 5. Non-Functional Requirements
* **Performance:** Webhook endpoint response time must be under 500ms to comply with platform timeouts.
* **Security:** API keys and webhooks secrets must be stored securely in environment variables (`.env.local`).
* **Scalability:** Architecture must support future addition of more platforms (e.g., YouTube, X/Twitter).

---

## 6. Development Milestones & Phases
1. **Phase 1 (Foundation):** Setup Next.js project layout, database schema, and Prisma ORM configuration.
2. **Phase 2 (Webhook Handlers):** Implement mock/real webhook receivers for Meta and TikTok comments.
3. **Phase 3 (AI Integration):** Integrate Google Gemini API SDK to handle automated sentiment analysis and response generation.
4. **Phase 4 (Dashboard UI):** Build the admin dashboard to visualize comments, filters, and analytics.
5. **Phase 5 (Testing & Deployment):** End-to-end testing and production deployment on Vercel/VPS.