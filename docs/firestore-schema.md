# Firestore Schema

## `users/{uid}`

```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "createdAt": "timestamp|string",
  "updatedAt": "timestamp|string",
  "onboarding": {
    "completed": true,
    "focusArea": "general"
  },
  "plan": {
    "tier": "free|premium",
    "status": "inactive|active|trialing|canceled|past_due",
    "badgeLabel": "Starter|Best value",
    "stripeCustomerId": "cus_...",
    "stripeSubscriptionId": "sub_...",
    "stripePriceId": "price_...",
    "currentPeriodEnd": "ISO string",
    "cancelAtPeriodEnd": false
  },
  "usage": {
    "aiMonthKey": "2026-03",
    "aiGenerationsUsed": 0,
    "aiGenerationsLimit": 60
  },
  "stats": {
    "currentStreak": 0,
    "longestStreak": 0,
    "tasksCompleted": 0,
    "focusHoursThisWeek": 0
  },
  "settings": {
    "weeklyGoalHours": 10,
    "preferredStudyWindow": "18:00-20:00",
    "availableStudyHours": "Mon 2h...",
    "reminderStyle": "focus-first",
    "requireProofBeforeCompletion": true
  },
  "studyProfile": {
    "schoolName": "",
    "courseLoad": "",
    "goal": "Build consistency"
  }
}
```

## `users/{uid}/tasks/{taskId}`

```json
{
  "title": "string",
  "course": "string",
  "description": "string",
  "dueDate": "YYYY-MM-DD",
  "priority": "High|Medium|Low",
  "estimatedMinutes": 60,
  "proofLink": "string",
  "completionNote": "string",
  "completed": false,
  "completedAt": "ISO string",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

## Server-generated premium collections

- `users/{uid}/aiGenerations`
- `users/{uid}/studyPlans`
- `users/{uid}/quizzes`
- `users/{uid}/flashcards`
- `users/{uid}/notes`
