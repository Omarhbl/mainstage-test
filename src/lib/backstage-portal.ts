export type PartnerCampaign = {
  id: string;
  name: string;
  brand: string;
  status: "Live" | "Review" | "Scheduled";
  startDate: string;
  endDate: string;
  progress: number;
  budget: string;
  lead: string;
  objective: string;
};

export type PartnerApproval = {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  status: "Waiting" | "Approved" | "Needs changes";
  assignee: string;
};

export type PartnerFile = {
  id: string;
  name: string;
  category: string;
  updatedAt: string;
  format: string;
  size: string;
};

export type PartnerReport = {
  id: string;
  title: string;
  period: string;
  summary: string;
  metric: string;
};

export type PartnerMessage = {
  id: string;
  author: string;
  role: string;
  date: string;
  message: string;
};

export type PartnerLogEntry = {
  id: string;
  date: string;
  item: string;
  note: string;
};

export type BackstagePortalSettings = {
  gateway: {
    eyebrow: string;
    title: string;
    subtitle: string;
    existingEyebrow: string;
    existingTitle: string;
    existingDescription: string;
    existingCtaLabel: string;
    joinEyebrow: string;
    joinTitle: string;
    joinDescription: string;
    joinCtaLabel: string;
  };
  login: {
    eyebrow: string;
    title: string;
    subtitle: string;
    submitLabel: string;
    backLabel: string;
    contactLabel: string;
  };
  shell: {
    eyebrow: string;
    title: string;
    description: string;
    contactEmail: string;
    contactDescription: string;
  };
  overview: {
    title: string;
    subtitle: string;
  };
  campaignsPage: {
    title: string;
    subtitle: string;
  };
  approvalsPage: {
    title: string;
    subtitle: string;
  };
  filesPage: {
    title: string;
    subtitle: string;
  };
  reportsPage: {
    title: string;
    subtitle: string;
  };
  messagesPage: {
    title: string;
    subtitle: string;
  };
  campaigns: PartnerCampaign[];
  approvals: PartnerApproval[];
  files: PartnerFile[];
  reports: PartnerReport[];
  invoices: PartnerReport[];
  messages: PartnerMessage[];
  activityLog: PartnerLogEntry[];
};

export type BackstageClientAccount = {
  id: string;
  slug: string;
  companyName: string;
  logoUrl?: string;
  contactName: string;
  email: string;
  authUserId: string;
  createdAt: string;
  updatedAt: string;
  portalSettings: BackstagePortalSettings;
};

export const FALLBACK_BACKSTAGE_PORTAL_SETTINGS: BackstagePortalSettings = {
  gateway: {
    eyebrow: "Partner Space",
    title: "Backstage for partners, follow-ups, and campaign visibility.",
    subtitle:
      "This space is designed for partners who want to follow activations, monitor deliverables, and stay aligned with what is moving across Mainstage.",
    existingEyebrow: "Already a partner?",
    existingTitle: "Enter your client space",
    existingDescription:
      "Access the follow-up area to review updates, stay close to live campaigns, and keep conversations moving with the Mainstage team.",
    existingCtaLabel: "Already a partner? Log in",
    joinEyebrow: "Want to join us?",
    joinTitle: "Become a partner",
    joinDescription:
      "If you are exploring a collaboration, a brand placement, or a custom content partnership, let's start the conversation.",
    joinCtaLabel: "Become a partner, let's talk",
  },
  login: {
    eyebrow: "Client Login",
    title: "Welcome to the partner backstage",
    subtitle:
      "This login is reserved for partner follow-up access. We can connect the live authentication flow here once the client monitoring space is ready.",
    submitLabel: "Enter partner space",
    backLabel: "Back to partner options",
    contactLabel: "Need access? Contact us",
  },
  shell: {
    eyebrow: "Client space",
    title: "Partner Backstage",
    description:
      "Monitor campaigns, review deliverables, follow approvals, and keep every follow-up in one place.",
    contactEmail: "contact@themainstagent.com",
    contactDescription:
      "Reach out for approvals, reporting questions, or production follow-up.",
  },
  overview: {
    title: "Campaign overview",
    subtitle:
      "Track the live campaign, keep approvals moving, review uploaded deliverables, and stay aligned with the Mainstage team in real time.",
  },
  campaignsPage: {
    title: "Campaigns",
    subtitle:
      "Review each live or upcoming partnership, track timing, and keep visibility on what is moving right now.",
  },
  approvalsPage: {
    title: "Approvals",
    subtitle:
      "Keep sign-offs moving with a clean view of what is approved, what needs changes, and what is still waiting on feedback.",
  },
  filesPage: {
    title: "Deliverables",
    subtitle:
      "Access uploaded deliverables, production exports, and campaign files in one place so your team always knows what is ready to download.",
  },
  reportsPage: {
    title: "Reports and billing",
    subtitle:
      "Review weekly performance snapshots, campaign reporting, and invoice follow-up from one clean reporting space.",
  },
  messagesPage: {
    title: "Messages and notes",
    subtitle:
      "Follow the full conversation with Mainstage, keep internal notes in view, and review the follow-up history around each campaign.",
  },
  campaigns: [
    {
      id: "cmp-1",
      name: "Spring Culture Takeover",
      brand: "Mainstage x Partner",
      status: "Live",
      startDate: "08/04/2026",
      endDate: "24/04/2026",
      progress: 78,
      budget: "92,000 MAD",
      lead: "Nabila Harboul",
      objective:
        "Drive visibility across homepage, article placements, and social highlights.",
    },
    {
      id: "cmp-2",
      name: "Artist Launch Pulse",
      brand: "Partner Campaign",
      status: "Review",
      startDate: "18/04/2026",
      endDate: "02/05/2026",
      progress: 42,
      budget: "48,000 MAD",
      lead: "Omar Harboul",
      objective:
        "Validate creative and lock the final editorial rollout before launch.",
    },
  ],
  approvals: [
    {
      id: "apr-1",
      title: "Homepage hero visual",
      type: "Creative",
      dueDate: "15/04/2026",
      status: "Waiting",
      assignee: "Partner team",
    },
    {
      id: "apr-2",
      title: "Sponsored article copy",
      type: "Editorial",
      dueDate: "16/04/2026",
      status: "Needs changes",
      assignee: "Mainstage editorial",
    },
    {
      id: "apr-3",
      title: "Instagram story pack",
      type: "Social",
      dueDate: "13/04/2026",
      status: "Approved",
      assignee: "Partner team",
    },
  ],
  files: [
    {
      id: "file-1",
      name: "Campaign master deck",
      category: "Presentation",
      updatedAt: "14/04/2026",
      format: "PDF",
      size: "12.4 MB",
    },
    {
      id: "file-2",
      name: "Homepage hero export",
      category: "Creative",
      updatedAt: "14/04/2026",
      format: "PNG",
      size: "3.8 MB",
    },
    {
      id: "file-3",
      name: "Social assets pack",
      category: "Social",
      updatedAt: "12/04/2026",
      format: "ZIP",
      size: "48.1 MB",
    },
    {
      id: "file-4",
      name: "Performance snapshot",
      category: "Reporting",
      updatedAt: "11/04/2026",
      format: "XLSX",
      size: "1.1 MB",
    },
  ],
  reports: [
    {
      id: "rep-1",
      title: "Weekly campaign report",
      period: "08/04/2026 - 14/04/2026",
      summary:
        "Homepage placements generated the strongest visibility lift this week.",
      metric: "Reach: 182K",
    },
    {
      id: "rep-2",
      title: "Content performance review",
      period: "Week 2",
      summary:
        "Article engagement held steady, with social highlights outperforming projected taps.",
      metric: "CTR: 4.8%",
    },
  ],
  invoices: [
    {
      id: "inv-1",
      title: "Invoice #MS-0426-01",
      period: "Issued 12/04/2026",
      summary:
        "First campaign billing milestone covering homepage placement and creative production.",
      metric: "Amount: 38,000 MAD",
    },
    {
      id: "inv-2",
      title: "Invoice #MS-0426-02",
      period: "Issued 14/04/2026",
      summary:
        "Reporting and social delivery batch prepared for partner accounting follow-up.",
      metric: "Amount: 12,500 MAD",
    },
  ],
  messages: [
    {
      id: "msg-1",
      author: "Mainstage Team",
      role: "Campaign lead",
      date: "14/04/2026",
      message:
        "The homepage banner is now live. We are waiting on final approval for the article headline before pushing the next placement.",
    },
    {
      id: "msg-2",
      author: "Partner Team",
      role: "Brand manager",
      date: "13/04/2026",
      message:
        "We reviewed the social pack and approved story slides 1, 2, and 4. Please adjust the CTA copy on slide 3.",
    },
    {
      id: "msg-3",
      author: "Mainstage Team",
      role: "Editorial",
      date: "12/04/2026",
      message:
        "The sponsored article draft has been uploaded to the portal. You can review the structure and leave consolidated feedback.",
    },
  ],
  activityLog: [
    {
      id: "log-1",
      date: "14/04/2026",
      item: "Banner delivered",
      note: "Homepage banner received and staged for publication.",
    },
    {
      id: "log-2",
      date: "13/04/2026",
      item: "Creative feedback",
      note: "Partner team approved 3 out of 4 social story slides.",
    },
    {
      id: "log-3",
      date: "12/04/2026",
      item: "Article uploaded",
      note: "Sponsored feature draft added for partner review.",
    },
  ],
};

export const FALLBACK_BACKSTAGE_CLIENTS: BackstageClientAccount[] = [];
