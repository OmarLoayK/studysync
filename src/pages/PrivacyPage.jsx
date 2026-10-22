import { Database, Cpu, Scale, Users, Globe, Clock, Lock, UserCheck, Baby, Mail, Cookie, RefreshCw, AtSign } from "lucide-react";
import { LegalPage } from "../components/legal";
import { APP_NAME, MINIMUM_AGE, SUPPORT_EMAIL } from "../lib/constants";

const SECTIONS = [
  {
    id: "who-we-are",
    icon: AtSign,
    title: "Who we are",
    blocks: [
      `${APP_NAME} ("we", "us") is a study-planning web app operated from California, United States of America. We are the data controller for the personal information described in this policy. You can reach us about anything privacy-related at ${SUPPORT_EMAIL}.`,
    ],
  },
  {
    id: "what-we-collect",
    icon: Database,
    title: "What we collect",
    blocks: [
      "We only collect what we need to run the product:",
      [
        "Account details: your email address and the display name you choose. Your password is handled by Firebase Authentication. We never see or store it.",
        "Study content you create: tasks, courses, descriptions, due dates, priorities, completion notes, proof links, and proof images you upload.",
        "Optional profile and settings: school name, course load, study goal, study windows, weekly goal, and reminder preferences. You can leave these blank.",
        "AI tool inputs and results: the text you enter into an AI tool and the study plan, quiz, flashcards, or explanation it returns.",
        "Billing status: your Stripe customer ID, subscription plan, status, and renewal date. Card details are entered on Stripe's own page and never reach our servers.",
        "Usage counters: how many AI credits and proof checks you have used, so we can enforce plan limits.",
        "Signup consent record: the date you accepted these policies, the policy version, and your confirmation that you meet the minimum age.",
        "Technical data: our hosting and database providers process IP addresses and basic request logs to deliver the service and protect it from abuse.",
      ],
      "We do not collect your location, contacts, or device identifiers for advertising. We do not use analytics or advertising trackers.",
    ],
  },
  {
    id: "how-we-use",
    icon: Scale,
    title: "How we use it and why (legal bases)",
    blocks: [
      [
        "To provide the service you signed up for: your account, dashboard, tasks, proof checks, AI tools, and subscription (performance of a contract).",
        "To keep the service secure and prevent abuse, including rate limits and fraud prevention (legitimate interests).",
        "To send browser study reminders, only if you turn them on and grant notification permission (consent, which you can withdraw at any time in Settings or your browser).",
        "To keep billing and tax records where the law requires it (legal obligation).",
      ],
      "We do not sell your personal information, share it for cross-context behavioral advertising, or use it to build advertising profiles.",
    ],
  },
  {
    id: "ai-and-proof",
    icon: Cpu,
    title: "AI features and proof verification",
    blocks: [
      "When you use an AI tool, the text you enter and your study-time preferences are sent to OpenAI to generate a result. We do not send your name or email address. Requests are made with storage turned off, and OpenAI's API terms say API data is not used to train its models. OpenAI may keep request data for up to 30 days for abuse monitoring.",
      "When you complete a task with proof, we check that the proof matches the task. For a Google Doc link, our server downloads the document's public text and images and sends them to OpenAI for the check. Proof images you upload are sent to OpenAI for the same check. Images that fail the check are deleted right away. Images that pass are stored in your account.",
      "AI results are saved to your account so you can see them again. They are deleted when you delete your account.",
      "Please don't put sensitive information (such as health details or ID numbers) into AI tools or proof documents.",
    ],
  },
  {
    id: "service-providers",
    icon: Users,
    title: "Service providers we share data with",
    blocks: [
      "We use a small number of providers (\"subprocessors\") to run the app. Each one only receives what it needs for its job:",
      [
        "Google Firebase (Authentication, Firestore database, Cloud Storage): account login, your data, and proof images.",
        "Vercel: website hosting and the server functions that handle billing, AI, and proof checks.",
        "Stripe: payment processing, subscriptions, invoices, and the billing portal.",
        "OpenAI: AI generation and proof verification, as described above.",
        "Google Docs: only when you submit a public Google Doc link as proof, so we can read that document.",
      ],
      "We may also disclose information if the law requires it, to protect our users' or the public's rights and safety, or as part of a business transfer such as a merger. If that happens, this policy will continue to apply to your data.",
    ],
  },
  {
    id: "international",
    icon: Globe,
    title: "International transfers",
    blocks: [
      "Our providers store and process data in the United States and other countries. Where data from the EEA, UK, or Switzerland is transferred, our providers rely on recognised safeguards such as the EU Standard Contractual Clauses and the EU-U.S. Data Privacy Framework.",
    ],
  },
  {
    id: "retention",
    icon: Clock,
    title: "How long we keep data",
    blocks: [
      [
        "Account, tasks, proof images, settings, and AI history: we keep these until you delete them or delete your account.",
        "When you delete your account, we cancel any active subscription and permanently delete your profile, tasks, proof images, AI history, and login. Deletion starts immediately. Copies in provider backups may last up to about 30 days before they are overwritten.",
        "Billing records: Stripe keeps payment and invoice records for as long as tax and accounting laws require.",
        "Server logs: these are kept by our hosting providers for a short time, usually days to weeks.",
      ],
    ],
  },
  {
    id: "security",
    icon: Lock,
    title: "Security",
    blocks: [
      "Data is encrypted in transit (HTTPS) and at rest by our providers. Database and storage access rules only let you read your own data. Server endpoints check your login before doing anything. No system is perfectly secure. If a breach affects your personal data, we will tell you and the relevant authorities when the law requires it.",
    ],
  },
  {
    id: "your-rights",
    icon: UserCheck,
    title: "Your rights and choices",
    blocks: [
      "Depending on where you live (for example under the GDPR, UK GDPR, or California CCPA/CPRA), you have the right to:",
      [
        "Access your personal data and get a copy of it in a portable format.",
        "Correct inaccurate data. You can edit most of it yourself in Account and Settings.",
        "Delete your data. You can do this yourself any time in Account → Delete account.",
        "Object to or restrict certain processing.",
        "Withdraw consent, for example by turning off browser reminders.",
        "Not be discriminated against for exercising these rights.",
        "Complain to your local data protection authority.",
      ],
      `To make a request, email ${SUPPORT_EMAIL} from the address on your account. We will respond within 30 days. California residents get a response within 45 days, as the CCPA allows. We may need to confirm your identity first. You can also use an authorized agent.`,
    ],
  },
  {
    id: "california",
    icon: Scale,
    title: "California residents",
    blocks: [
      [
        "Categories collected in the last 12 months: identifiers (email address), customer records (Stripe customer ID and subscription status), internet activity (request logs), and the education-related content you choose to add (tasks and proof). The sources, purposes, and recipients are described above.",
        "We do not sell or share personal information as the CCPA defines those terms. We do not use or disclose sensitive personal information to infer characteristics about you.",
        "Shine the Light (Civil Code § 1798.83): we do not disclose personal information to third parties for their own direct marketing.",
        "Do Not Track: we do not track you across other websites, so our behavior is the same whether or not your browser sends a Do Not Track or Global Privacy Control signal.",
        "Minors (Business & Professions Code § 22581): users under 18 can delete any task, proof, or other content they posted, or their whole account, at any time in the app. They can also email us to have it removed.",
      ],
    ],
  },
  {
    id: "children",
    icon: Baby,
    title: "Children's privacy",
    blocks: [
      `${APP_NAME} is not intended for children under ${MINIMUM_AGE}, and we do not knowingly collect personal information from them. Everyone who signs up must confirm they are at least ${MINIMUM_AGE}. Users under 18 (or the age of majority where they live) must have a parent or guardian's permission. In the EEA and UK, that includes anyone under the local age of digital consent (13–16, depending on the country).`,
      `If you believe a child under ${MINIMUM_AGE} has created an account, contact ${SUPPORT_EMAIL} and we will delete the account and its data promptly. Parents and guardians of teen users can contact us to review or delete their child's data.`,
    ],
  },
  {
    id: "emails",
    icon: Mail,
    title: "Emails",
    blocks: [
      "We only send emails you need to use your account, such as password-reset emails (sent through Firebase) and payment receipts (sent by Stripe). We do not send marketing emails or newsletters.",
      "If we ever add optional emails like product updates, we will ask for your permission first and include an unsubscribe link in every one.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies and local storage",
    blocks: [
      "We only use storage that is strictly necessary for the app to work: keeping you signed in, remembering reminders you have already seen, and remembering that you dismissed the cookie notice. We do not use advertising or analytics cookies. See our Cookie Policy for details.",
    ],
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "Changes to this policy",
    blocks: [
      "If we make a material change, we will update the date at the top of this page and tell you in the app before the change takes effect. If the law requires it, we will ask for your consent again.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`What ${APP_NAME} collects, why, who it's shared with, and the control you have over it.`}
      sections={SECTIONS}
    />
  );
}
