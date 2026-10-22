import { FileCheck, UserCheck, User, ShieldAlert, FileText, CreditCard, Sparkles, Ban, RefreshCw, AlertTriangle, Scale, Copyright, Mail } from "lucide-react";
import { LegalPage } from "../components/legal";
import { APP_NAME, MINIMUM_AGE, SUPPORT_EMAIL } from "../lib/constants";

const SECTIONS = [
  {
    id: "agreement",
    icon: FileCheck,
    title: "Agreement to these terms",
    blocks: [
      `These Terms of Service ("Terms") are an agreement between you and ${APP_NAME} ("we", "us") about your use of the ${APP_NAME} website and app (the "Service"). By creating an account or using the Service, you agree to these Terms and to our Privacy Policy, Refund Policy, and Cookie Policy. If you do not agree, please do not use the Service.`,
    ],
  },
  {
    id: "eligibility",
    icon: UserCheck,
    title: "Eligibility and age",
    blocks: [
      [
        `You must be at least ${MINIMUM_AGE} years old to use ${APP_NAME}.`,
        "If you are under 18 (or the age of majority where you live), you need a parent or guardian's permission to use the Service, and they agree to these Terms on your behalf.",
        "Paid plans must be bought by an adult, or by a minor using a payment method with a parent or guardian's permission.",
      ],
    ],
  },
  {
    id: "accounts",
    icon: User,
    title: "Your account",
    blocks: [
      "Keep your account information accurate, keep your password secure, and don't share your account in a way that gets around plan limits. You are responsible for activity under your account. Tell us right away if you think someone has accessed it without permission.",
    ],
  },
  {
    id: "acceptable-use",
    icon: ShieldAlert,
    title: "Acceptable use",
    blocks: [
      "When using the Service, you agree not to:",
      [
        "Break the law, or infringe anyone's intellectual property or privacy.",
        "Upload content that is illegal, hateful, sexually explicit, or harassing, or that contains other people's personal data without their permission.",
        "Use the AI tools to cheat in a way that breaks your school's academic integrity rules, or to produce harmful content.",
        "Probe, overload, or disrupt the Service, get around rate limits or credit limits, or access other users' data.",
        "Scrape, resell, or reverse-engineer the Service, or use it to build a competing product.",
      ],
    ],
  },
  {
    id: "your-content",
    icon: FileText,
    title: "Your content",
    blocks: [
      "You own the tasks, notes, proof, and other content you add. You give us a limited license to store, process, and show that content only as needed to run the Service for you. That includes sending it to the service providers named in our Privacy Policy, such as OpenAI for AI features and proof checks. This license ends when you delete the content or your account.",
    ],
  },
  {
    id: "plans-billing",
    icon: CreditCard,
    title: "Paid plans and billing",
    blocks: [
      [
        "Premium and Power are monthly subscriptions billed in advance through Stripe at the price shown before you check out. Prices are in US dollars. Taxes may be added where they apply.",
        "Your subscription renews automatically each month until you cancel. You can cancel at any time in the app (Billing → Open billing portal). After you cancel, you keep access until the end of the period you have already paid for, and you will not be charged again.",
        "AI credits reset every month and don't roll over. Unused credits have no cash value.",
        "If we change the price, we will tell you at least 14 days in advance. The new price applies from your next billing period, and you can cancel before then.",
        "Refunds follow our Refund Policy.",
      ],
    ],
  },
  {
    id: "ai",
    icon: Sparkles,
    title: "AI features and proof verification",
    blocks: [
      "AI output is generated automatically and can be wrong, incomplete, or out of date. Check it before relying on it, especially for graded work or exams. AI proof checks are also automated and can make mistakes. If you think a proof was rejected unfairly, contact support. AI features are study aids. They are not professional, medical, legal, or academic advice.",
    ],
  },
  {
    id: "termination",
    icon: Ban,
    title: "Suspension and termination",
    blocks: [
      "You can stop using the Service and delete your account at any time from the Account page. We may suspend or close accounts that seriously or repeatedly break these Terms, or where the law requires it. Where reasonable, we will warn you first and give you a chance to fix the problem. If we close your account without a good reason, we will refund any unused prepaid time.",
    ],
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "Changes to the Service and these Terms",
    blocks: [
      "We may improve or change features over time. If we make a material change to these Terms, we will update the date above and tell you in the app before the change takes effect. If you keep using the Service after the change, you accept the new Terms. If you don't agree, you can cancel and delete your account.",
    ],
  },
  {
    id: "disclaimers",
    icon: AlertTriangle,
    title: "Disclaimers and limitation of liability",
    blocks: [
      "We work to keep the Service reliable, but it is provided \"as is\" and \"as available\", without warranties of any kind, to the extent the law allows. We do not guarantee any particular academic result.",
      "To the extent the law allows, our total liability for any claim relating to the Service is limited to the amount you paid us in the 12 months before the claim. We are not liable for indirect or consequential losses. Nothing in these Terms limits liability that cannot be limited by law, or takes away your rights under consumer protection laws where you live.",
    ],
  },
  {
    id: "law",
    icon: Scale,
    title: "Governing law and disputes",
    blocks: [
      `Please contact us first at ${SUPPORT_EMAIL}. Most problems can be fixed quickly that way. These Terms are governed by the laws of the place where ${APP_NAME}'s operator is based. If you are a consumer, you also keep the protection of the mandatory laws of the country where you live, and you can bring claims in your local courts.`,
    ],
  },
  {
    id: "licenses",
    icon: Copyright,
    title: "Intellectual property and third-party licenses",
    blocks: [
      `The ${APP_NAME} name, logo, design, and code belong to us. The Service includes third-party material used under its licenses:`,
      [
        "Inter and Space Grotesk fonts: SIL Open Font License 1.1, self-hosted.",
        "Lucide icons: ISC License.",
        "Open-source libraries including React, React Router, Tailwind CSS, Motion, and the Firebase and Stripe SDKs, under their MIT or Apache 2.0 licenses.",
        "Product screenshots and illustrations are our own. We do not use stock photos.",
      ],
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact",
    blocks: [`Questions about these Terms: ${SUPPORT_EMAIL}. We aim to reply within 5 business days.`],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`The rules for using ${APP_NAME}, including subscriptions, AI features, and your rights.`}
      sections={SECTIONS}
    />
  );
}
