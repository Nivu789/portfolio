
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | c3v.solutions",
  description:
    "Privacy Policy for c3v.solutions and its WhatsApp automation services.",
};

const sections = [
  {
    title: "1. Introduction",
    content: `c3v.solutions ("we", "our", or "us") respects your privacy and is committed to protecting personal information. This policy explains how we collect, use, process and protect information when you visit our website or interact with our WhatsApp automation services.`,
  },
  {
    title: "2. Information We Process",
    content: `Depending on your interaction with our services, we may process contact information such as names and phone numbers, WhatsApp messages and enquiries, business information voluntarily provided during conversations, and technical information such as diagnostic information and server logs.`,
  },
  {
    title: "3. How We Use Information",
    content: `We process information to respond to customer enquiries, provide automated WhatsApp replies, facilitate customer support and lead enquiries, manage bookings when configured, maintain service reliability and prevent misuse.`,
  },
  {
    title: "4. WhatsApp and Third-Party Services",
    content: `Our services use the WhatsApp Business Platform provided by Meta Platforms, Inc. Messages and associated information are processed through Meta's infrastructure and our service infrastructure to deliver the requested functionality.`,
  },
  {
    title: "5. Data Storage and Retention",
    content: `We do not intentionally maintain a database of customer WhatsApp conversations or message contents. Limited technical information may appear in temporary application or hosting logs for troubleshooting and service monitoring. Our backend services are hosted using Render and are subject to its applicable privacy and retention practices. We do not sell personal information.`,
  },
  {
    title: "6. Business Customer Data",
    content: `We may process information on behalf of businesses using our WhatsApp automation services. Those businesses are responsible for ensuring they have the necessary permissions and legal basis to process their customers' personal information.`,
  },
  {
    title: "7. Sharing of Information",
    content: `Information may be processed by Meta Platforms, Inc., Render and other service providers necessary to operate our services. We may also disclose information when required by applicable law.`,
  },
  {
    title: "8. Data Security",
    content: `We take reasonable technical and organisational measures to protect information against unauthorised access, disclosure, alteration or destruction. However, no electronic transmission or storage method can be guaranteed to be completely secure.`,
  },
  {
    title: "9. Your Privacy Rights",
    content: `Depending on applicable law, you may request access to, correction or deletion of your personal information, withdraw consent where applicable, or ask how your information is processed. Contact us using the email address below.`,
  },
  {
    title: "10. Children's Privacy",
    content: `Our services are not intentionally designed to collect personal information from children without appropriate authorisation. Please contact us if you believe a child has provided personal information improperly.`,
  },
  {
    title: "11. Changes to This Policy",
    content: `We may update this Privacy Policy periodically. Updates will be published on this page with a revised effective date.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-20 text-gray-900">
      <article className="mx-auto max-w-3xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gray-500">
          c3v.solutions
        </p>

        <h1 className="mb-4 text-4xl font-semibold tracking-tight">
          Privacy Policy
        </h1>

        <p className="mb-12 text-sm text-gray-500">
          Effective Date: 22 November 2026
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl font-semibold">
                {section.title}
              </h2>
              <p className="text-base leading-8 text-gray-600">
                {section.content}
              </p>
            </section>
          ))}

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              12. Contact Information
            </h2>
            <p className="leading-8 text-gray-600">
              For questions, privacy requests or concerns:
            </p>
            <p className="mt-4 leading-8">
              <strong>Business:</strong> c3v.solutions
              <br />
              <strong>Email:</strong>{" "}
              <a
                href="mailto:c3v.solutions@gmail.com"
                className="underline"
              >
                c3v.solutions@gmail.com
              </a>
              <br />
              <strong>Website:</strong>{" "}
              <a href="https://c3v.solutions" className="underline">
                c3v.solutions
              </a>
            </p>
          </section>
        </div>

        <footer className="mt-16 border-t pt-6 text-sm text-gray-400">
          © 2026 c3v.solutions. All rights reserved.
        </footer>
      </article>
    </main>
  );
}
