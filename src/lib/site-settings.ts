export type LegalPageEntry = {
  title: string;
  effectiveDate: string;
  content: string;
};

export type SiteSettings = {
  contactEmail: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  aboutPage: {
    title: string;
    introContent: string;
    signature: string;
    coverageTitle: string;
    coverageSubtitle: string;
    coverageItems: Array<{
      title: string;
      description: string;
      image: string;
    }>;
  };
  footerTagline: string;
  copyrightText: string;
  legalLinks: Array<{
    label: string;
    href: string;
  }>;
  legalPages: {
    terms: LegalPageEntry;
    privacy: LegalPageEntry;
    intellectual: LegalPageEntry;
    cookies: LegalPageEntry;
  };
};

export const FALLBACK_SITE_SETTINGS: SiteSettings = {
  contactEmail: "contact@themainstagent.com",
  instagramUrl: "#",
  youtubeUrl: "#",
  tiktokUrl: "#",
  aboutPage: {
    title: "About us",
    introContent: `Mainstage is a platform built for culture, entertainment, and the people shaping what's next.

We cover the stories, sounds, screens, and moments that move today's generation, from music and cinema to pop culture, live events, and the personalities driving the conversation.

At Mainstage, we believe culture deserves sharp storytelling, strong editorial taste, and a platform that understands both what is happening now and what is coming next. Our goal is to spotlight the artists, creators, trends, and cultural shifts that deserve attention, with content that feels relevant, fresh, and connected to real audiences.

Whether it is breaking news, must-read features, industry insights, or emerging voices, Mainstage exists to keep readers plugged into what matters. We are here to inform, inspire, and amplify the energy of entertainment in all its forms.`,
    signature: "For the culture. For the industry. For what's next.",
    coverageTitle: "What we cover?",
    coverageSubtitle:
      "A curated look at the stories, industries, and people shaping today's culture.",
    coverageItems: [
      {
        title: "Music",
        description: "From global icons to emerging artists shaping the sound of today.",
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Cinema",
        description: "New releases, industry insights, and stories behind the screen.",
        image:
          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Events",
        description: "The moments, formats, and live trends redefining how we experience culture.",
        image:
          "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "People",
        description: "Artists, creators, and personalities driving culture forward.",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Culture",
        description: "Movements, ideas, and shifts influencing lifestyle and creative expression.",
        image:
          "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Live Experiences",
        description: "Festivals, shows, and real-world moments that bring culture to life.",
        image:
          "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  footerTagline: "For the Culture. For the Industry.",
  copyrightText: "© Mainstage - 2026 All right reserved",
  legalLinks: [
    { label: "TERMS & CONDITIONS", href: "/terms-conditions" },
    { label: "PRIVACY POLICY", href: "/privacy-policy" },
    { label: "INTELLECTUAL PROPERTY", href: "/intellectual-property" },
    { label: "COOKIES POLICY", href: "/cookies-privacy" },
  ],
  legalPages: {
    terms: {
      title: "TERMS & CONDITIONS",
      effectiveDate: "04/02/2026",
      content: `Welcome to Mainstage.
These Terms of Use govern your access to and use of the website operated by Mainstage Ent.

By accessing or using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms.

1. Purpose of the Website
Mainstage is an online media platform dedicated to publishing editorial content related to entertainment, music, culture, lifestyle, and events. Content may include articles, interviews, opinions, multimedia, and curated features.

2. Access to the Website
The website is accessible free of charge to any user with internet access.
Mainstage reserves the right to suspend, restrict, or terminate access to all or part of the website at any time without notice.

3. Acceptable Use
Users agree to use the website responsibly and not to:

- Violate any applicable laws or regulations
- Attempt to gain unauthorized access to the website or its systems
- Interfere with the website's functionality or security
- Use automated systems (bots, scrapers) without authorization

4. Intellectual Property Rights
All content available on Mainstage, including but not limited to text, images, graphics, logos, videos, and design elements, is protected by intellectual property laws.
Unless otherwise stated, such content is the exclusive property of Mainstage.
Any reproduction, distribution, modification, or use without prior written consent is strictly prohibited.

5. User-Generated Content
Where applicable (comments, submissions, etc.), users agree that:

- Content must not be illegal, defamatory, abusive, or infringing
- Mainstage reserves the right to moderate, edit, or remove any content
- By submitting content, users grant Mainstage a non-exclusive, royalty-free license to use and publish it

6. External Links
The website may include links to third-party websites.
Mainstage is not responsible for such websites and assumes no responsibility for their content, practices, or availability.

7. Disclaimer of Warranties
Content is provided for informational and editorial purposes only.
Mainstage does not guarantee that:

- Information is always accurate, complete, or up to date
- The website will be uninterrupted or error-free

8. Limitation of Liability
To the fullest extent permitted by law, Mainstage shall not be liable for any direct or indirect damages resulting from:

- Use or inability to use the website
- Reliance on content published

9. Modifications
Mainstage reserves the right to update or modify these Terms at any time. Continued use of the website implies acceptance of any changes.`,
    },
    privacy: {
      title: "PRIVACY POLICY",
      effectiveDate: "04/02/2026",
      content: `At Mainstage, we are committed to protecting your personal data and respecting your privacy.

1. Data Collected
We may collect the following categories of data:

- Identity data: name (if provided)
- Contact data: email address
- Technical data: IP address, browser type, device
- Usage data: pages visited, time spent, interactions

2. Methods of Collection
Data is collected through:

- Contact forms
- Newsletter subscriptions
- Cookies and analytics tools

3. Purpose of Processing
We process your data to:

- Provide and improve our services
- Send newsletters and updates (with consent)
- Respond to inquiries
- Analyze website performance

4. Legal Basis
Processing is based on:

- User consent
- Legitimate interest (improving services, analytics)
- Legal obligations where applicable

5. Data Sharing
Your data is never sold.
It may be shared with:

- Hosting providers
- Analytics services
- Email/newsletter platforms

All partners are required to ensure data protection.

6. Data Retention
Personal data is retained only as long as necessary for the purposes described above or as required by law.

7. Security
We implement appropriate technical and organizational measures to protect your data from unauthorized access, loss, or misuse.

8. Your Rights
You have the right to:

- Access your personal data
- Request correction or deletion
- Withdraw consent
- Object to processing

Requests can be sent to contact@themainstagent.com

9. Updates
This policy may be updated periodically. Changes will be reflected on this page.`,
    },
    intellectual: {
      title: "INTELLECTUAL PROPERTY",
      effectiveDate: "",
      content: `All elements of the website are protected under intellectual property laws.
Any unauthorized use, reproduction, or distribution is strictly prohibited.

Mainstage endeavors to ensure the accuracy of information published but cannot guarantee completeness or accuracy at all times.

Mainstage shall not be held liable for:

- Errors or omissions
- Technical issues affecting access
- External content linked from the website`,
    },
    cookies: {
      title: "COOKIES PRIVACY",
      effectiveDate: "04/02/2026",
      content: `1. Introduction
This Cookie Policy explains how Mainstage uses cookies and similar technologies.

2. What Are Cookies
Cookies are small data files stored on your device that help improve your browsing experience.

3. Types of Cookies We Use

Essential Cookies
Required for the operation of the website.

Analytics Cookies
Used to understand how users interact with the website (e.g., traffic, behavior).

Performance Cookies
Help improve loading speed and functionality.

Functional Cookies
Remember user preferences and settings.

4. Third-Party Cookies
We may use third-party services such as:

- Google Analytics
- Social media integrations

These services may place cookies on your device.

5. Consent
When you first visit the website, you may be asked to accept or manage cookies.
By continuing to browse, you agree to the use of cookies unless disabled.

6. Managing Cookies
You can manage or disable cookies through your browser settings.
Please note that disabling cookies may affect website functionality.

7. Updates
This Cookie Policy may be updated at any time.`,
    },
  },
};
