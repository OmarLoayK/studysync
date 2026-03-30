export const APP_NAME = "StudySync";
export const APP_TAGLINE = "A dark-mode study operating system for students who want structure, momentum, and premium AI help.";

export const APP_NAV_ITEMS = [
  { to: "/app", label: "Dashboard" },
  { to: "/app/ai", label: "AI Tools" },
  { to: "/app/billing", label: "Billing" },
  { to: "/app/account", label: "Account" },
  { to: "/app/settings", label: "Settings" },
];

export const MARKETING_METRICS = [
  { label: "Tasks shipped", value: "50K+" },
  { label: "Study streak wins", value: "91%" },
  { label: "Avg. weekly clarity", value: "7.4h saved" },
];

export const FEATURE_PILLARS = [
  {
    title: "Command-center dashboard",
    copy: "See what is due today, what is slipping, how your week is trending, and what to focus on next without hunting through clutter.",
  },
  {
    title: "Proof-backed accountability",
    copy: "Require a completion note, proof link, or premium image proof before tasks can be finished, with clearer proof logic across the app.",
  },
  {
    title: "Premium AI study engine",
    copy: "Generate study plans, quizzes, flashcards, topic explainers, and assignment breakdowns with cost-aware limits.",
  },
];

export const PLAN_DETAILS = {
  free: {
    key: "free",
    name: "Free",
    priceLabel: "$0",
    cadence: "/month",
    badge: "Starter",
    monthlyAiLimit: 0,
    features: [
      "Unlimited personal tasks",
      "Due today, overdue, upcoming, and completed tracking",
      "Priority levels and proof-note requirement",
      "Dashboard analytics and streak tracking",
      "Account, settings, and core study management",
    ],
    cta: "Open free workspace",
  },
  premium: {
    key: "premium",
    name: "Premium",
    priceLabel: "$5",
    cadence: "/month",
    badge: "Best value",
    monthlyAiLimit: 60,
    features: [
      "Everything in Free",
      "AI study planner, quiz, flashcards, explainer, and breakdown tools",
      "Interactive quizzes, better study plans, and proof image uploads",
      "Core analytics and smarter planning insights",
      "Stripe billing portal and subscription controls",
    ],
    cta: "Unlock premium",
  },
  power: {
    key: "power",
    name: "Power",
    priceLabel: "$20",
    cadence: "/month",
    badge: "Flagship AI",
    monthlyAiLimit: 240,
    features: [
      "Everything in Premium",
      "Best available AI model routing for deeper explanations and plans",
      "Higher monthly AI credits for heavy study sessions",
      "Longer quizzes, larger flashcard sets, and richer breakdowns",
      "Priority access to future advanced coaching features",
    ],
    cta: "Go power",
  },
};

export const PLAN_ORDER = ["free", "premium", "power"];
export const PAID_PLAN_KEYS = ["premium", "power"];
export const PREMIUM_PRICE_DOLLARS = 5;
export const POWER_PRICE_DOLLARS = 20;
export const DEFAULT_MONTHLY_AI_LIMIT = PLAN_DETAILS.premium.monthlyAiLimit;

export const AI_TOOLS = [
  {
    key: "planner",
    label: "AI Study Planner",
    shortLabel: "Planner",
    description: "Turn assignments, exams, and weekly time availability into a realistic study schedule.",
    fields: [
      { name: "assignments", label: "Assignments and deadlines", type: "textarea", placeholder: "Chemistry worksheet due Wednesday, History essay due Friday..." },
      { name: "examDate", label: "Exam dates", type: "text", placeholder: "Biology midterm on April 12" },
      { name: "availableHours", label: "Available study hours", type: "text", placeholder: "Mon 2h, Tue 3h, Thu 2h, Sat 4h" },
    ],
  },
  {
    key: "quiz",
    label: "AI Quiz Generator",
    shortLabel: "Quiz",
    description: "Generate practice questions from notes, a lecture summary, or any study topic.",
    fields: [
      { name: "topic", label: "Topic", type: "text", placeholder: "Cellular respiration" },
      {
        name: "questionCount",
        label: "Number of questions",
        type: "number",
        min: 3,
        max: 12,
        placeholder: "5",
        defaultValue: "5",
      },
      {
        name: "format",
        label: "Question type",
        type: "select",
        defaultValue: "multiple-choice",
        options: [
          { value: "multiple-choice", label: "Multiple choice" },
          { value: "true-false", label: "True or false" },
        ],
      },
      { name: "notes", label: "Notes or source material", type: "textarea", placeholder: "Paste your notes, lecture recap, or chapter summary..." },
    ],
  },
  {
    key: "flashcards",
    label: "AI Flashcard Generator",
    shortLabel: "Flashcards",
    description: "Convert messy notes into clean front/back flashcards for fast revision sessions.",
    fields: [
      { name: "topic", label: "Topic", type: "text", placeholder: "French Revolution key events" },
      { name: "notes", label: "Notes", type: "textarea", placeholder: "Paste notes that should become flashcards..." },
    ],
  },
  {
    key: "explainer",
    label: "AI Topic Explainer",
    shortLabel: "Explainer",
    description: "Ask for a simpler explanation of a hard topic, including examples and next steps.",
    fields: [
      { name: "topic", label: "Topic", type: "text", placeholder: "The chain rule" },
      { name: "context", label: "Context or confusion points", type: "textarea", placeholder: "I get lost when..." },
    ],
  },
  {
    key: "breakdown",
    label: "AI Study Breakdown",
    shortLabel: "Breakdown",
    description: "Split a big assignment or exam prep sprint into manageable phases with clear checkpoints.",
    fields: [
      { name: "goal", label: "Assignment or exam goal", type: "text", placeholder: "Prepare for organic chemistry final" },
      { name: "constraints", label: "Constraints", type: "textarea", placeholder: "Only 6 days left, soccer practice on Tuesday..." },
    ],
  },
];

export const TASK_TEMPLATES = [
  {
    key: "homework",
    label: "Homework",
    description: "Fast capture for smaller assignments and practice sets.",
    values: {
      title: "Homework set",
      course: "",
      description: "List the key questions or problems you need to finish.",
      priority: "Medium",
      estimatedMinutes: 60,
    },
  },
  {
    key: "essay",
    label: "Essay draft",
    description: "Break a writing assignment into a clear deliverable.",
    values: {
      title: "Essay draft",
      course: "",
      description: "Outline thesis, evidence, and the next writing checkpoint.",
      priority: "High",
      estimatedMinutes: 120,
    },
  },
  {
    key: "exam",
    label: "Exam prep",
    description: "Set up a focused revision block with proof and notes.",
    values: {
      title: "Exam prep session",
      course: "",
      description: "Define the topics, chapters, or problem types you will cover.",
      priority: "High",
      estimatedMinutes: 90,
    },
  },
  {
    key: "review",
    label: "Reading review",
    description: "Capture reading and revision tasks without filling every field from scratch.",
    values: {
      title: "Reading review",
      course: "",
      description: "Summarize the chapter or reading target and what proof you will leave.",
      priority: "Low",
      estimatedMinutes: 45,
    },
  },
];

export const DEFAULT_SETTINGS = {
  weeklyGoalHours: 10,
  preferredStudyWindow: "18:00-20:00",
  availableStudyHours: "Mon 2h, Tue 2h, Wed 1h, Thu 2h, Fri 1h, Sat 2h",
  reminderStyle: "focus-first",
  browserReminders: false,
  deadlineReminderDays: 1,
  requireProofBeforeCompletion: true,
};

export const DEFAULT_PLAN = {
  tier: "free",
  status: "inactive",
  badgeLabel: PLAN_DETAILS.free.badge,
  stripeCustomerId: "",
  stripeSubscriptionId: "",
  stripePriceId: "",
  currentPeriodEnd: "",
  cancelAtPeriodEnd: false,
};

export const DEFAULT_USAGE = {
  aiMonthKey: "",
  aiGenerationsUsed: 0,
  aiGenerationsLimit: DEFAULT_MONTHLY_AI_LIMIT,
  aiWindowKey: "",
  aiRequestsInWindow: 0,
};
