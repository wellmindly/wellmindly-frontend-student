/* ============================================================================
   Legal content — single source of truth for the Privacy Policy and Terms of
   Service pages (/privacy, /terms).

   IMPORTANT — this is a grounded DRAFT, not legal advice. Every factual claim
   here reflects what the app actually does (observable data flows), but the
   bracketed [PLACEHOLDER: ...] tokens MUST be filled in and the whole document
   reviewed by a qualified lawyer before publishing — this is a mental-health
   product used by students (and possibly minors), so it carries real legal
   weight (GDPR / UAE PDPL / India DPDP / Australia Privacy Act, FERPA-adjacent
   university context, etc.). See docs/legal/play-data-safety.md for the matching
   Google Play Data Safety mapping and the full placeholder checklist.
   ========================================================================= */

export interface LegalBlock {
  kind: "p" | "ul";
  /** For kind "p". */
  text?: string;
  /** For kind "ul". */
  items?: string[];
}

export interface LegalSection {
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  tagline: string;
  /** Human-readable effective/last-updated date. */
  updated: string;
  /** Lead paragraphs shown before the numbered sections. */
  intro: string[];
  sections: LegalSection[];
}

const p = (text: string): LegalBlock => ({ kind: "p", text });
const ul = (items: string[]): LegalBlock => ({ kind: "ul", items });

/* ----------------------------------------------------------------- Privacy */

export const PRIVACY_POLICY: LegalDoc = {
  title: "Privacy Policy",
  tagline: "What we collect, why, and the control you have over it.",
  updated: "October 10, 2026",
  intro: [
    "WellMindly is a warm, private space for students to check in with how they feel, reflect, connect with peers, and book support. This policy explains what personal information we collect, how we use and protect it, and the choices and rights you have. We've tried to write it in plain language.",
    "This policy applies to the WellMindly student web app and Android app (together, the \"Service\"), operated by [PLACEHOLDER: legal entity name], [PLACEHOLDER: registered address] (\"WellMindly\", \"we\", \"us\"). If you do not agree with this policy, please do not use the Service.",
    "WellMindly is not a medical, diagnostic, or emergency service. If you are in crisis or may be in danger, use the in-app Crisis support screen or contact your local emergency services immediately.",
  ],
  sections: [
    {
      id: "info-we-collect",
      heading: "1. Information we collect",
      blocks: [
        p("We collect only what we need to run the Service and support your wellbeing. This includes:"),
        ul([
          "Account information: if you register with email, your email address and a password (which our backend stores only in hashed form). If you use Google Sign-In, we receive your name, email address, profile picture, and Google account identifier through the permissions you grant (profile, email).",
          "Wellbeing content you create: emotional check-ins (a 1–5 mood rating and any optional notes), self-discovery and assessment responses and results (which can include questions about mood and psychological wellbeing), WriteMindly journal entries, and the posts and replies you share in TalkMindly peer spaces.",
          "Coaching and booking details: the coach you select, session date and time, and any information you choose to add when booking.",
          "Messages you send us: for example, through the contact form (your name, email, and message).",
          "Technical and usage data: standard server logs such as IP address, device and browser type, timestamps, and in-app actions, used to operate, secure, and improve the Service.",
        ]),
        p("Some of this information — particularly assessment responses and journal entries — can reveal details about your mental and emotional health. We treat that as sensitive information and handle it with extra care, as described below."),
      ],
    },
    {
      id: "how-we-use",
      heading: "2. How we use your information",
      blocks: [
        p("We use your information to:"),
        ul([
          "Provide the Service — create and secure your account, show your check-ins, assessments, journal, peer spaces, and bookings, and keep you signed in.",
          "Generate WriteMindly reflections — your journal text is processed (including by AI, see Section 4) to generate the reflections you see.",
          "Operate peer support — display the posts and replies you choose to share in TalkMindly and keep those spaces safe through moderation.",
          "Respond to you — reply to messages and support requests.",
          "Keep the Service safe and reliable — detect abuse, prevent fraud, debug problems, and protect users.",
          "Meet legal obligations — where applicable law requires it.",
        ]),
        p("We do not sell your personal information. We do not show third-party advertising. We use privacy-conscious analytics services (such as Google Analytics with anonymized IP and Microsoft Clarity) to understand aggregate usage and improve user experience. Sensitive text inputs, private journal entries, and chat reflections are protected and masked from session recordings."),
      ],
    },
    {
      id: "legal-bases",
      heading: "3. Our legal bases for processing",
      blocks: [
        p("Where data-protection law requires a legal basis (for example, the EU/UK GDPR, UAE PDPL, India's DPDP Act, or Australia's Privacy Act), we rely on:"),
        ul([
          "Your consent — for sensitive wellbeing data such as mood check-ins, assessment responses, and journal entries. You can withdraw consent at any time by deleting the content or your account (see Section 8).",
          "Performance of a contract — to provide the features you ask us for, such as your account, bookings, and peer spaces.",
          "Our legitimate interests — to keep the Service secure, prevent abuse, and improve how it works, balanced against your rights.",
          "Legal obligation — where we must process data to comply with the law.",
        ]),
      ],
    },
    {
      id: "ai-processing",
      heading: "4. AI processing of WriteMindly entries",
      blocks: [
        p("When you write a WriteMindly journal entry, the text is sent to an AI service to generate a supportive reflection back to you. This processing is automated."),
        ul([
          "AI provider: [PLACEHOLDER: name the AI sub-processor, e.g. the model/API provider].",
          "Training: your entries are [PLACEHOLDER: \"not used to train the provider's models\" — confirm this is contractually true before publishing].",
          "The reflections are generated by software, may be imperfect, and are not professional, medical, or clinical advice.",
        ]),
        p("You can choose not to use WriteMindly; the rest of the Service works without it."),
      ],
    },
    {
      id: "sharing",
      heading: "5. When we share information",
      blocks: [
        p("We share personal information only in these limited situations:"),
        ul([
          "Service providers (sub-processors) who help us run the Service under contract — for example, our hosting and backend infrastructure provider [PLACEHOLDER: name], the AI provider named in Section 4, Google (for Google Sign-In), and our email delivery provider [PLACEHOLDER: name, if used]. They may only use the data to provide services to us.",
          "Peer spaces: anything you post in TalkMindly is visible to other users of that space. Please do not share information there you would not want others to see.",
          "Legal and safety reasons: if required by law, or where we believe in good faith it is necessary to protect the safety of you or others.",
          "Business transfers: if WellMindly is involved in a merger, acquisition, or asset sale, your information may be transferred, subject to this policy.",
        ]),
        p("We do not share your individual check-ins, assessment results, journal entries, or identity with your university or institution."),
      ],
    },
    {
      id: "google-services",
      heading: "6. Google Sign-In and Google Fonts",
      blocks: [
        p("If you choose Google Sign-In, Google authenticates you and shares the profile details described in Section 1 with us. Your use of Google Sign-In is also governed by Google's own privacy policy."),
        p("The web app loads fonts from Google Fonts, which may receive your IP address when the page loads them. We use Google Analytics with IP anonymization and Microsoft Clarity to understand aggregate usage trends and improve usability. We do not use Google advertising or remarketing services."),
      ],
    },

    {
      id: "retention",
      heading: "7. How long we keep your information",
      blocks: [
        p("We keep your personal information for as long as your account is active and for as long as needed to provide the Service. When you delete content or your account, we delete or anonymise the associated personal data within [PLACEHOLDER: retention period, e.g. 30 days], except where we must retain it to comply with the law, resolve disputes, or enforce our agreements."),
      ],
    },
    {
      id: "your-rights",
      heading: "8. Your rights and choices",
      blocks: [
        p("Depending on where you live, you may have the right to:"),
        ul([
          "Access the personal information we hold about you.",
          "Correct information that is inaccurate or incomplete.",
          "Delete your account and associated personal data.",
          "Withdraw consent you previously gave for processing sensitive data.",
          "Object to or restrict certain processing, and request a copy of your data in a portable format.",
        ]),
        p("You can delete your account from within the app, or request any of the above by contacting us at Info@wellmindly.com. We will respond within the time required by applicable law. If you believe we have not resolved your concern, you may contact your local data-protection authority."),
      ],
    },
    {
      id: "security",
      heading: "9. How we protect your information",
      blocks: [
        p("We use technical and organisational measures to protect your information, including encryption of data in transit (HTTPS), hashing of passwords, access controls, and authenticated sessions. No method of transmission or storage is completely secure, so we cannot guarantee absolute security, but we work to protect your data and to respond promptly to any incident."),
      ],
    },
    {
      id: "international",
      heading: "10. International data transfers",
      blocks: [
        p("WellMindly operates across several countries, including the United Arab Emirates, Oman, Malaysia, Australia, and India. Your information may be processed in, or transferred to, countries other than your own, which may have different data-protection laws. Where required, we put appropriate safeguards in place for such transfers. [PLACEHOLDER: name the primary country where data is stored and the safeguards used, e.g. standard contractual clauses.]"),
      ],
    },
    {
      id: "children",
      heading: "11. Children and younger users",
      blocks: [
        p("The Service is intended for students aged [PLACEHOLDER: minimum age, e.g. 16] and older. If you are below the age of majority in your country, you may use the Service only with the involvement and consent of a parent or guardian, where the law requires it. We do not knowingly collect personal information from children under [PLACEHOLDER: age] without appropriate consent. If you believe a child has provided us personal information without consent, contact us at Info@wellmindly.com and we will take appropriate steps to delete it."),
      ],
    },
    {
      id: "changes",
      heading: "12. Changes to this policy",
      blocks: [
        p("We may update this policy from time to time. When we make material changes, we will update the \"Last updated\" date above and, where appropriate, notify you in the app. Your continued use of the Service after an update means you accept the revised policy."),
      ],
    },
    {
      id: "contact",
      heading: "13. How to contact us",
      blocks: [
        p("For any question about this policy or your personal information, contact us at:"),
        ul([
          "Email: Info@wellmindly.com",
          "Phone: +971 50 731 2108",
          "Postal address: [PLACEHOLDER: registered address]",
          "Data protection / grievance officer: [PLACEHOLDER: name and contact, if required in your jurisdiction]",
        ]),
      ],
    },
  ],
};

/* ------------------------------------------------------------------- Terms */

export const TERMS_OF_SERVICE: LegalDoc = {
  title: "Terms of Service",
  tagline: "The agreement between you and WellMindly when you use the app.",
  updated: "October 10, 2026",
  intro: [
    "These Terms of Service (\"Terms\") govern your use of the WellMindly student web app and Android app (the \"Service\"), operated by [PLACEHOLDER: legal entity name] (\"WellMindly\", \"we\", \"us\"). By creating an account or using the Service, you agree to these Terms and to our Privacy Policy.",
    "WellMindly is a wellbeing and peer-support tool, not a medical, diagnostic, therapeutic, or emergency service. It does not provide professional advice and is not a substitute for care from a qualified professional. If you are in crisis or may be in danger, use the in-app Crisis support screen or contact your local emergency services immediately.",
  ],
  sections: [
    {
      id: "eligibility",
      heading: "1. Who can use WellMindly",
      blocks: [
        p("You must be at least [PLACEHOLDER: minimum age, e.g. 16] years old to use the Service. If you are below the age of majority in your country, you may use the Service only with the consent and involvement of a parent or guardian where the law requires it. By using the Service you confirm that you meet these requirements and that the information you give us is accurate."),
      ],
    },
    {
      id: "what-it-is",
      heading: "2. What the Service is — and isn't",
      blocks: [
        p("WellMindly helps you check in with how you feel, reflect through journaling and self-discovery, connect with peers, and book optional coaching or counselling sessions."),
        p("The Service — including WriteMindly reflections, assessment results, and peer conversations — is for self-reflection and support only. It does not diagnose, treat, or cure any condition, and nothing in it is professional, medical, psychological, or legal advice. Always seek the advice of a qualified professional for medical or mental-health concerns, and never disregard or delay seeking it because of something you read in the Service."),
      ],
    },
    {
      id: "account",
      heading: "3. Your account",
      blocks: [
        p("You are responsible for keeping your login credentials secure and for activity under your account. Tell us promptly at Info@wellmindly.com if you believe your account has been accessed without permission. You may close your account at any time (see Section 9)."),
      ],
    },
    {
      id: "community",
      heading: "4. Community guidelines for peer spaces",
      blocks: [
        p("TalkMindly and other peer spaces work only if they stay safe and kind. When you post, you agree not to:"),
        ul([
          "Harass, bully, threaten, or demean anyone.",
          "Post hateful, discriminatory, violent, or sexually explicit content.",
          "Encourage or glorify self-harm, suicide, eating disorders, or substance abuse.",
          "Share other people's private or identifying information without their consent.",
          "Spam, advertise, impersonate others, or post illegal content.",
        ]),
        p("We may moderate, remove content, or suspend accounts that break these guidelines. If you see someone who may be at risk, point them to the in-app Crisis support screen and, if there is immediate danger, contact local emergency services."),
      ],
    },
    {
      id: "ai-features",
      heading: "5. AI features",
      blocks: [
        p("WriteMindly generates reflections from your journal entries using an automated AI service. These reflections are produced by software, may be inaccurate or incomplete, and are not advice. Use your own judgment and seek professional support when you need it."),
      ],
    },
    {
      id: "your-content",
      heading: "6. Your content",
      blocks: [
        p("You keep ownership of the content you create — your check-ins, assessment responses, journal entries, posts, and messages. You grant WellMindly a limited, non-exclusive licence to store, process, and display that content solely to operate and provide the Service to you (for example, to show your journal back to you or to display a post you share in a peer space). We do not claim ownership of your content and we do not sell it."),
      ],
    },
    {
      id: "acceptable-use",
      heading: "7. Acceptable use",
      blocks: [
        p("You agree not to misuse the Service, including by attempting to access it in unauthorised ways, disrupting or overloading it, reverse-engineering it, scraping data, or using it for any unlawful purpose."),
      ],
    },
    {
      id: "ip",
      heading: "8. Our intellectual property",
      blocks: [
        p("The Service itself — its software, design, branding, and content we create — belongs to WellMindly or its licensors and is protected by law. These Terms do not give you any right to use our name, logo, or trademarks without our prior written permission."),
      ],
    },
    {
      id: "termination",
      heading: "9. Suspension and termination",
      blocks: [
        p("You may stop using the Service and delete your account at any time from within the app or by contacting Info@wellmindly.com. We may suspend or terminate your access if you break these Terms, if required by law, or to protect the Service or its users. Sections that by their nature should survive termination (such as content licences already granted, disclaimers, and limitation of liability) will continue to apply."),
      ],
    },
    {
      id: "disclaimers",
      heading: "10. Disclaimers",
      blocks: [
        p("The Service is provided \"as is\" and \"as available\", without warranties of any kind, whether express or implied, to the fullest extent permitted by law. We do not warrant that the Service will be uninterrupted, error-free, or secure, or that any content or reflection is accurate or suitable for your situation."),
      ],
    },
    {
      id: "liability",
      heading: "11. Limitation of liability",
      blocks: [
        p("To the fullest extent permitted by law, WellMindly and its operators will not be liable for any indirect, incidental, special, or consequential damages, or for any loss arising from your reliance on the Service or on any content or reflection within it. [PLACEHOLDER: this clause is jurisdiction-dependent and must be reviewed and adjusted by a lawyer — some protections for consumers cannot be excluded by law.]"),
      ],
    },
    {
      id: "changes",
      heading: "12. Changes to these Terms",
      blocks: [
        p("We may update these Terms from time to time. When we make material changes, we will update the \"Last updated\" date above and, where appropriate, notify you in the app. Your continued use of the Service after an update means you accept the revised Terms."),
      ],
    },
    {
      id: "governing-law",
      heading: "13. Governing law",
      blocks: [
        p("These Terms are governed by the laws of [PLACEHOLDER: governing jurisdiction, e.g. the United Arab Emirates], without regard to conflict-of-laws rules, and any disputes will be subject to [PLACEHOLDER: courts / dispute-resolution venue]. Nothing in these Terms removes mandatory rights you have under the law of your own country of residence."),
      ],
    },
    {
      id: "contact",
      heading: "14. How to contact us",
      blocks: [
        p("Questions about these Terms? Contact us at Info@wellmindly.com or +971 50 731 2108."),
      ],
    },
  ],
};
