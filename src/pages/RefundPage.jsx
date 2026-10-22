import { XCircle, BadgeCheck, CalendarClock, AlertCircle, Globe, Mail } from "lucide-react";
import { LegalPage } from "../components/legal";
import { APP_NAME, SUPPORT_EMAIL } from "../lib/constants";

const SECTIONS = [
  {
    id: "cancel",
    icon: XCircle,
    title: "Cancel any time",
    blocks: [
      "You can cancel Premium or Power at any time in the app (Billing → Open billing portal). You don't need to email anyone. Canceling stops future renewals, and you keep paid features until the end of the period you have already paid for.",
    ],
  },
  {
    id: "first-payment",
    icon: BadgeCheck,
    title: "14-day refund on your first payment",
    blocks: [
      "If you're not happy, email us within 14 days of your first payment for a plan and we will refund that payment in full. You don't need to give a reason. Your subscription will be canceled and your account will go back to the Free plan.",
    ],
  },
  {
    id: "renewals",
    icon: CalendarClock,
    title: "Renewals",
    blocks: [
      "Monthly renewals are generally not refundable once a new billing period has started. We will still refund a renewal if:",
      [
        "You ask within 7 days of the renewal charge and haven't used any AI credits in the new period.",
        "You were charged after you canceled, or charged twice.",
        "A service problem on our side stopped you from using paid features for a large part of the period.",
      ],
    ],
  },
  {
    id: "not-covered",
    icon: AlertCircle,
    title: "What isn't refunded",
    blocks: [
      [
        "Partial months after the cases above. Canceling simply stops the next renewal.",
        "Unused AI credits. They reset monthly and have no cash value.",
        "Accounts closed for serious or repeated breaches of our Terms of Service, except where the law requires a refund.",
      ],
    ],
  },
  {
    id: "consumer-rights",
    icon: Globe,
    title: "Your legal rights",
    blocks: [
      "This policy adds to your legal rights. It doesn't replace them. If you are a consumer in the EU, the UK, or another country with a statutory right of withdrawal or other mandatory refund rights, those rights still apply.",
    ],
  },
  {
    id: "how-to",
    icon: Mail,
    title: "How to request a refund",
    blocks: [
      `Email ${SUPPORT_EMAIL} from your account email with the subject "Refund request". We reply within 5 business days. Approved refunds go back to your original payment method through Stripe and usually show up within 5–10 business days, depending on your bank.`,
    ],
  },
];

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro={`How cancellations and refunds work for ${APP_NAME} Premium and Power.`}
      sections={SECTIONS}
    />
  );
}
