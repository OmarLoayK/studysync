import { Cookie, Shield, Ban, ExternalLink, Settings2, Mail } from "lucide-react";
import { LegalPage } from "../components/legal";
import { APP_NAME, SUPPORT_EMAIL } from "../lib/constants";

const SECTIONS = [
  {
    id: "what",
    icon: Cookie,
    title: "What cookies and local storage are",
    blocks: [
      "Cookies are small files a website saves in your browser. Local storage and IndexedDB are similar browser storage areas. In this policy, \"cookies\" covers all of them.",
    ],
  },
  {
    id: "what-we-use",
    icon: Shield,
    title: "What we use (strictly necessary only)",
    blocks: [
      `${APP_NAME} only uses storage that it needs to work. The law doesn't require consent for this kind of storage, but we still tell you about it:`,
      [
        "Firebase Authentication sign-in session (IndexedDB / local storage, set by Google Firebase). Keeps you signed in until you sign out.",
        "Reminder history (local storage, key studysync:reminder:…). Stops the same browser reminder from showing twice in one day. Only used if you turn reminders on.",
        "Cookie notice choice (local storage, key studysync:cookie-notice). Remembers that you dismissed the cookie notice so it doesn't keep appearing.",
      ],
    ],
  },
  {
    id: "what-we-dont",
    icon: Ban,
    title: "What we don't use",
    blocks: [
      "We don't use advertising cookies, analytics or tracking cookies, social media pixels, or cross-site tracking of any kind. Our fonts are hosted on our own site, so loading a page doesn't contact Google Fonts or other font services.",
    ],
  },
  {
    id: "third-party",
    icon: ExternalLink,
    title: "Third-party pages",
    blocks: [
      "When you check out or manage billing, you are sent to pages hosted by Stripe. Stripe sets its own cookies there for payments and fraud prevention, under Stripe's cookie and privacy policies. If you open a Google Doc you linked as proof, Google's own policies apply on that page.",
    ],
  },
  {
    id: "control",
    icon: Settings2,
    title: "Managing storage",
    blocks: [
      "Signing out clears your sign-in session. You can also clear site data in your browser settings at any time. If you block this storage, sign-in won't work. If we ever add optional cookies such as analytics, they will stay off until you turn them on in the cookie notice, and you will be able to change your choice at any time.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "Questions",
    blocks: [`Email ${SUPPORT_EMAIL}. We aim to reply within 5 business days.`],
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro={`Exactly what ${APP_NAME} stores in your browser, and what it doesn't.`}
      sections={SECTIONS}
    />
  );
}
