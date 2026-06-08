import { useState } from 'react'
import AppShell from '../components/AppShell'
import { Panel, Card3D, StatusBadge } from '../components/ui'

export default function Roadmaps() {
  const [activeTab, setActiveTab] = useState('frontend')

  const roadmaps = {
    frontend: {
      title: "Frontend Developer Roadmap",
      description: "Learn how to build beautiful, responsive, and high-performance user interfaces.",
      milestones: [
        { month: "Months 1-2", title: "HTML, CSS & JavaScript Fundamentals", difficulty: "Beginner", skills: ["HTML5 semantic tags", "CSS Flexbox & Grid", "JS ES6+ syntax", "DOM Manipulation"], resources: ["freeCodeCamp Responsive Web Design", "MDN Web Docs", "JavaScript.info"] },
        { month: "Months 3-4", title: "Modern CSS & Package Managers", difficulty: "Beginner", skills: ["Tailwind CSS", "Sass", "NPM / Yarn", "Git & GitHub basics"], resources: ["Tailwind CSS Documentation", "Git Immersion", "Traversy Media Git Crash Course"] },
        { month: "Months 5-6", title: "React Framework Mastery", difficulty: "Intermediate", skills: ["React Components & Props", "React Hooks (useState, useEffect)", "State Management (Context API, Redux Toolkit)", "React Router"], resources: ["Official React Docs", "Scrimba Learn React", "Academind React Course"] },
        { month: "Months 7-8", title: "TypeScript & Next.js", difficulty: "Intermediate", skills: ["TS types, interfaces, generics", "Next.js Pages & App Router", "Server Component vs Client Component", "Data Fetching & SEO"], resources: ["TypeScript HandBook", "Next.js Learn Dashboard", "Jack Herrington TS Course"] },
        { month: "Months 9-10", title: "Testing, Build Tools & APIs", difficulty: "Advanced", skills: ["Jest & React Testing Library", "Vite / Webpack configurations", "REST & GraphQL integrations", "Web Performance Optimization"], resources: ["Testing JavaScript by Kent C. Dodds", "Vite Guide", "Apollo GraphQL Tutorial"] },
        { month: "Months 11-12", title: "System Design, DSA & Portfolio", difficulty: "Advanced", skills: ["Web Performance (LCP, FID)", "Data Structures (Arrays, Strings, Stacks)", "LeetCode Interview Questions", "Build 3 Capstone Projects"], resources: ["Frontend Interview Handbook", "LeetCode (75 questions)", "Portfolio guidelines"] }
      ]
    },
    backend: {
      title: "Backend Developer Roadmap",
      description: "Master server-side programming, databases, APIs, and microservices.",
      milestones: [
        { month: "Months 1-2", title: "Programming Basics & SQL Databases", difficulty: "Beginner", skills: ["Node.js or Python fundamentals", "SQL basics (PostgreSQL or MySQL)", "Basic DB queries & schemas", "Command line scripting"], resources: ["Node.js Developer Guide", "SQLbolt interactive course", "Python crash course"] },
        { month: "Months 3-4", title: "API Design & Express/FastAPI", difficulty: "Beginner", skills: ["REST API Principles", "Express.js / FastAPI framework", "Middlewares & Routing", "MVC Architecture"], resources: ["REST API Tutorial", "Express docs", "FastAPI tutorial"] },
        { month: "Months 5-6", title: "Advanced Databases & ORMs", difficulty: "Intermediate", skills: ["NoSQL Databases (MongoDB)", "ORM tools (Prisma, Mongoose, Sequelize)", "Database Indexing & Normalization", "Redis Caching"], resources: ["Prisma docs", "MongoDB University", "Redis Crash Course"] },
        { month: "Months 7-8", title: "Security & Authentication", difficulty: "Intermediate", skills: ["JWT Authentication", "OAuth 2.0 integration", "Hashing (bcrypt)", "CORS, Rate Limiting, OWASP Top 10"], resources: ["OWASP Cheat Sheet Series", "Auth0 OAuth Guide", "Web Dev Simplified Auth tutorial"] },
        { month: "Months 9-10", title: "Docker & System Architecture", difficulty: "Advanced", skills: ["Docker Containerization", "Docker Compose", "Message Queues (RabbitMQ/Kafka)", "Microservices Architecture"], resources: ["Docker Mastery on Udemy", "Kunal Kushwaha DevOps Course", "System Design Primer"] },
        { month: "Months 11-12", title: "Cloud Deployment & Scale", difficulty: "Advanced", skills: ["AWS Basics (EC2, S3, RDS)", "CI/CD Pipelines (GitHub Actions)", "Serverless Functions", "Scaling Database Connections"], resources: ["AWS Certified Cloud Practitioner", "GitHub Actions docs", "Vercel Serverless Guides"] }
      ]
    },
    fullstack: {
      title: "Full Stack Engineer Roadmap",
      description: "Bridge the gap between frontend and backend, mastering the entire application lifecycle.",
      milestones: [
        { month: "Months 1-3", title: "Frontend Core (React & CSS)", difficulty: "Beginner", skills: ["HTML/CSS/JS", "React.js core components", "Tailwind styling", "Client-side routing"], resources: ["Full Stack Open - Parts 1-3", "Scrimba React Course", "Tailwind docs"] },
        { month: "Months 4-6", title: "Backend Core (Node & Express)", difficulty: "Intermediate", skills: ["Node.js server", "REST API Development", "MongoDB & Supabase Integration", "Authentication & JWT"], resources: ["Full Stack Open - Parts 4-5", "Supabase Guides", "Express.js tutorials"] },
        { month: "Months 7-9", title: "TypeScript & Next.js Full-Stack", difficulty: "Intermediate", skills: ["TypeScript types in React & Node", "Next.js Fullstack Router", "Server Actions", "PostgreSQL database"], resources: ["Full Stack Open - Part 9", "Next.js Learn docs", "Prisma Postgres Setup"] },
        { month: "Months 10-12", title: "System Design, Testing & DevOps", difficulty: "Advanced", skills: ["Unit & Integration testing (Jest/Cypress)", "Docker Containerization", "System design basics", "Vercel & AWS deployments"], resources: ["Full Stack Open - Part 11", "Cypress Docs", "ByteByteGo System Design"] }
      ]
    },
    dataanalyst: {
      title: "Data Analyst & ML Roadmap",
      description: "Learn to process, analyze, and build predictive models from big data sets.",
      milestones: [
        { month: "Months 1-2", title: "Python & Advanced SQL", difficulty: "Beginner", skills: ["Python basics (Lists, Dicts, Loops)", "SQL Aggregations, Joins, Window Functions", "Excel for data analytics", "Jupyter Notebooks"], resources: ["Kaggle SQL Courses", "Python for Data Analysis book", "SQLZoo"] },
        { month: "Months 3-4", title: "Data Wrangling & Libraries", difficulty: "Intermediate", skills: ["Pandas DataFrames", "NumPy arrays", "Matplotlib & Seaborn plots", "Data cleaning & feature extraction"], resources: ["Kaggle Pandas Course", "Corey Schafer Pandas YouTube series", "Seaborn docs"] },
        { month: "Months 5-6", title: "BI Tools & Dashboards", difficulty: "Intermediate", skills: ["PowerBI or Tableau dashboards", "Creating interactive charts", "Storytelling with Data", "Presenting insights"], resources: ["Tableau Public Training", "PowerBI Learning Path", "Storytelling with Data Book"] },
        { month: "Months 7-8", title: "Statistics & ML Math", difficulty: "Intermediate", skills: ["Probability distributions", "Hypothesis testing & A/B testing", "Linear Algebra basics", "Calculus for Machine Learning"], resources: ["Khan Academy Statistics", "StatQuest YouTube Channel", "3Blue1Brown Linear Algebra"] },
        { month: "Months 9-10", title: "Supervised & Unsupervised ML", difficulty: "Advanced", skills: ["Scikit-Learn library", "Regression (Linear, Logistic)", "Classification (Trees, Random Forest)", "Clustering (K-Means)"], resources: ["Hands-On Machine Learning book", "Andrew Ng Machine Learning Specialization", "Kaggle Micro-courses"] },
        { month: "Months 11-12", title: "Deep Learning & Model Deployment", difficulty: "Advanced", skills: ["Neural Networks basics (TensorFlow/PyTorch)", "NLP or Computer Vision fundamentals", "Deploying models using Streamlit/FastAPI", "Data pipelines (ETL)"], resources: ["Fast.ai Deep Learning Course", "Streamlit Docs", "PyTorch Tutorials"] }
      ]
    },
    devops: {
      title: "DevOps & Cloud Engineer Roadmap",
      description: "Master infrastructure automation, CI/CD, container orchestration, and cloud computing.",
      milestones: [
        { month: "Months 1-2", title: "Linux Administration & Shell Scripting", difficulty: "Beginner", skills: ["Linux command line commands", "Bash scripting", "SSH keys & access management", "Basic networking (TCP/IP, DNS)"], resources: ["Linux Journey website", "Bash scripting guide", "NetworkChuck CCNA series"] },
        { month: "Months 3-4", title: "Git & Version Control Workflows", difficulty: "Beginner", skills: ["Git branches, rebasing, merging", "GitHub / GitLab settings", "SSH authentication", "Trunk-based development"], resources: ["Git Branching game", "Atlassian Git tutorial", "GitLab flow guide"] },
        { month: "Months 5-6", title: "CI/CD & Containers", difficulty: "Intermediate", skills: ["Docker containers & images", "GitHub Actions configurations", "Jenkins or GitLab CI pipelines", "Artifact management"], resources: ["Docker Deep Dive", "GitHub Actions tutorials", "TechWorld with Nana Docker tutorial"] },
        { month: "Months 7-8", title: "Infrastructure as Code (IaC)", difficulty: "Intermediate", skills: ["Terraform syntax & providers", "Ansible playbook automation", "CloudFormation basics", "State file management"], resources: ["HashiCorp Terraform Associate", "Ansible Docs", "Terraform Up & Running book"] },
        { month: "Months 9-10", title: "Container Orchestration (Kubernetes)", difficulty: "Advanced", skills: ["K8s Pods, Deployments, Services", "Helm charts", "K8s networking & storage", "Kubectl CLI commands"], resources: ["Certified Kubernetes Administrator (CKA)", "Kelsey Hightower Kubernetes the Hard Way"] },
        { month: "Months 11-12", title: "Cloud Platforms, Monitoring & Logging", difficulty: "Advanced", skills: ["AWS/GCP solutions architect core", "Prometheus & Grafana monitoring", "ELK stack (Elasticsearch, Logstash, Kibana)", "SRE principles"], resources: ["AWS Solutions Architect course", "Grafana dashboards guide", "Google SRE book"] }
      ]
    },
    mobile: {
      title: "Mobile App Developer Roadmap",
      description: "Build beautiful and scalable applications for iOS and Android devices.",
      milestones: [
        { month: "Months 1-2", title: "Mobile UI Layouts & Core Language", difficulty: "Beginner", skills: ["Dart (Flutter) or JS/TS (React Native)", "Kotlin basics for Android / Swift for iOS", "Mobile UI layouts and components", "Stateful widgets"], resources: ["Flutter documentation", "React Native Core Docs", "Swift Playgrounds"] },
        { month: "Months 3-4", title: "Navigation & Device Features", difficulty: "Beginner", skills: ["React Navigation or GoRouter", "Accessing Camera, Photos, GPS", "Local Storage (AsyncStorage, Hive)", "Responsive layouts"], resources: ["React Navigation guides", "Flutter Cookbook", "Device hardware API docs"] },
        { month: "Months 5-6", title: "State Management & APIs", difficulty: "Intermediate", skills: ["Redux / Zustand in RN or Bloc / Provider in Flutter", "REST API integration", "WebSockets implementation", "Caching offline data"], resources: ["Zustand Guide", "Flutter Bloc tutorial", "Axios mobile setup"] },
        { month: "Months 7-8", title: "Native Modules & App Performance", difficulty: "Intermediate", skills: ["Writing Kotlin/Swift bridges", "App size optimization", "Memory leak detection", "Offline-first sync systems"], resources: ["Native Bridges documentation", "Performance profiling in Android Studio & Xcode"] },
        { month: "Months 9-10", title: "Testing & Code Quality", difficulty: "Advanced", skills: ["Unit testing functions", "Widget & Component testing", "E2E testing (Detox/Appium)", "Crashlytics integration"], resources: ["Detox docs", "Flutter Testing guide", "Firebase Crashlytics guides"] },
        { month: "Months 11-12", title: "App Stores Deployment & CI/CD", difficulty: "Advanced", skills: ["Google Play Store submission", "Apple App Store guidelines", "Fastlane automation", "Push notifications setup"], resources: ["Fastlane docs", "Apple developer console guide", "Firebase Cloud Messaging"] }
      ]
    }
  }

  const getDifficultyTone = (diff) => {
    if (diff === "Beginner") return "green"
    if (diff === "Intermediate") return "blue"
    return "purple"
  }

  const currentRoadmap = roadmaps[activeTab]

  return (
    <AppShell>
      <div className="relative max-w-6xl mx-auto px-4 py-8 animate-fade-up">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-3 py-1.5 rounded-full glass border border-white/[0.08]">
            Career Guide Roadmaps
          </span>
          <h1 className="text-4xl font-extrabold text-white mt-4 tracking-tight">Interactive Career Roadmaps</h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Choose a specialization below to explore month-by-month learning milestones, required skills, and curated tutorials.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex flex-wrap gap-2.5 justify-center md:justify-start mb-10 bg-white/[0.02] border border-white/[0.04] p-2 rounded-2xl">
          {Object.keys(roadmaps).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === key
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {key === 'frontend' && '🖥️ Frontend'}
              {key === 'backend' && '⚙️ Backend'}
              {key === 'fullstack' && '🔋 Full Stack'}
              {key === 'dataanalyst' && '📊 Data & ML'}
              {key === 'devops' && '🚀 DevOps'}
              {key === 'mobile' && '📱 Mobile Dev'}
            </button>
          ))}
        </div>

        {/* Roadmap Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Timeline Info Panel */}
          <div className="md:col-span-1 space-y-6">
            <Panel className="sticky top-24">
              <h2 className="text-2xl font-black text-white">{currentRoadmap.title}</h2>
              <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                {currentRoadmap.description}
              </p>
              
              <div className="mt-8 space-y-4 pt-6 border-t border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-300">Green: Beginner basics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-300">Blue: Frameworks & ORMs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  <span className="text-sm text-gray-300">Violet: Scale, DevOps & Design</span>
                </div>
              </div>

              <div className="mt-8 bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4 text-xs text-cyan-300 leading-relaxed">
                📢 <strong>Tip:</strong> Don't try to learn everything at once. Focus on one milestone, build a small project, and then move forward!
              </div>
            </Panel>
          </div>

          {/* Timeline Milestones */}
          <div className="md:col-span-2 relative pl-6 md:pl-8 border-l border-white/[0.06] space-y-8">
            {currentRoadmap.milestones.map((mile, idx) => (
              <div key={idx} className="relative">
                {/* Timeline node circle */}
                <div className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full border-4 border-[#020617] ${
                  mile.difficulty === "Beginner" ? "bg-emerald-500" : mile.difficulty === "Intermediate" ? "bg-blue-500" : "bg-violet-500"
                } shadow-md`} />

                <Card3D className="group">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/5 px-3 py-1 rounded-md border border-cyan-500/10">
                      {mile.month}
                    </span>
                    <StatusBadge tone={getDifficultyTone(mile.difficulty)}>
                      {mile.difficulty}
                    </StatusBadge>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {mile.title}
                  </h3>

                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Key Skills to Learn:</h4>
                    <div className="flex flex-wrap gap-2">
                      {mile.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/[0.05]">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Curated Resources:</h4>
                    <ul className="space-y-1.5">
                      {mile.resources.map((res, rIdx) => (
                        <li key={rIdx} className="text-xs text-gray-400 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                          {res}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card3D>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
