# 🚀 AI Study Planner (IdeaForge)

**AI Study Planner** is a high-performance, AI-driven educational platform designed to streamline JEE preparation. It uses LLMs to help students organize their syllabus, track progress with gamified elements, and get expert guidance through a global AI Tutor.

![Dashboard Preview](https://github.com/urjitgadwala/AI-Study-Planner/raw/main/.github/screenshots/dashboard.png)

## ✨ Core Features

- **🤖 Global AI Tutor**: A persistent Gemini 1.5-powered assistant available across the entire dashboard to answer quick questions or provide deep dives into complex JEE topics.
- **📥 Intelligent Syllabus Management**:
    - **PDF Import**: Upload syllabus PDFs and let AI automatically extract and categorize topics.
    - **Bulk Management**: Easily add or delete topics manually or in batches.
- **📊 Real-time Progress Tracking**: Visualize mastery across Physics, Chemistry, and Mathematics with interactive charts and milestone tracking.
- **🎮 Gamified Learning**: Earn XP, level up, and maintain study streaks to stay motivated.
- **🌓 Premium UI/UX**: State-of-the-art glassmorphism design with full Light/Dark mode support and fluid micro-animations.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI & Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Next-Themes](https://github.com/pacocoursey/next-themes)
- **AI Core**: [Google Gemini 1.5 Flash/Pro](https://ai.google.dev/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **PDF Processing**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **State Management**: Local & Hook-based sync with persistent mock DB

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- NPM or Yarn
- A Google AI (Gemini) API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/urjitgadwala/AI-Study-Planner.git
   cd AI-Study-Planner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your keys:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   NEXTAUTH_SECRET=your_nextauth_secret
   # If using Google Auth:
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see your AI Study Planner in action!

## 🧪 Project Structure

```text
ideaforge/
├── src/
│   ├── app/            # Next.js App Router (Layouts, Pages)
│   ├── components/     # Reusable UI Components (Chat, Modals, Charts)
│   ├── lib/            # Utilities (AI, DB, Scheduler)
│   └── public/         # Static Assets
├── .env                # API Keys (Git-ignored)
└── package.json        # Dependencies & Scripts
```

## 🤝 Contributing

We welcome contributions! Whether it's adding new JEE topics, improving the AI prompt engineering, or enhancing the UI, feel free to fork the repo and submit a PR.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Built by Urjit Gadwala *
