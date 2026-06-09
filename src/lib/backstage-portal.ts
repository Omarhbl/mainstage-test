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

export type PartnerProject = {
  id: string;
  name: string;
  status: "Pending review" | "Live" | "Review" | "Scheduled" | "Completed";
  progress: number;
  startDate: string;
  endDate: string;
  poc: string;
  summary: string;
  scope: string;
  tasks?: PartnerProjectTask[];
};

export type PartnerProjectTask = {
  id: string;
  title: string;
  status: "Pending review" | "To do" | "In progress" | "Done";
  note?: string;
};

export type PartnerBudgetEntry = {
  id: string;
  projectId: string;
  label: string;
  type: "Budget" | "Quotation" | "Invoice";
  amount: string;
  status: "Pending review" | "Approved" | "Needs changes";
  submittedBy: string;
  updatedAt: string;
};

export type PartnerApproval = {
  id: string;
  projectId?: string;
  title: string;
  type: string;
  dueDate: string;
  status: "Waiting" | "Approved" | "Needs changes";
  assignee: string;
};

export type PartnerFile = {
  id: string;
  projectId?: string;
  name: string;
  category: string;
  updatedAt: string;
  format: string;
  size: string;
};

export type PartnerReport = {
  id: string;
  projectId?: string;
  title: string;
  period: string;
  summary: string;
  metric: string;
};

export type PartnerMessage = {
  id: string;
  projectId?: string;
  author: string;
  role: string;
  date: string;
  message: string;
};

export type PartnerLogEntry = {
  id: string;
  projectId?: string;
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
  projectsPage: {
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
  projects: PartnerProject[];
  budgetEntries: PartnerBudgetEntry[];
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
  projectsPage: {
    title: "Projects",
    subtitle:
      "Open each project to follow progress, documents, approvals, budgets, and ongoing discussion in one shared space.",
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
  campaigns: [],
  projects: [],
  budgetEntries: [],
  approvals: [],
  files: [],
  reports: [],
  invoices: [],
  messages: [],
  activityLog: [],
};

export const FALLBACK_BACKSTAGE_CLIENTS: BackstageClientAccount[] = [];

export function createBlankBackstagePortalSettings({
  companyName = "Partner",
  contactName = "",
  contactEmail = "contact@themainstagent.com",
}: {
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
} = {}): BackstagePortalSettings {
  const contactLabel = contactName || companyName || "Mainstage team";

  return {
    ...FALLBACK_BACKSTAGE_PORTAL_SETTINGS,
    shell: {
      ...FALLBACK_BACKSTAGE_PORTAL_SETTINGS.shell,
      title: `${companyName} Backstage`,
      description:
        "Create projects, submit budgets and timelines, follow Mainstage validation, and keep every update in one shared workspace.",
      contactEmail,
      contactDescription: `${contactLabel} can use this space to follow project approvals, files, budgets, and production updates.`,
    },
    overview: {
      title: `${companyName} project dashboard`,
      subtitle:
        "Start by creating a project request. Mainstage will review the timeline, budget, and requested elements before anything is finalized.",
    },
    projectsPage: {
      title: "Projects",
      subtitle:
        "Create a new project, then follow its status, budget validation, tasks, files, and conversation from one place.",
    },
    campaignsPage: {
      title: "Projects",
      subtitle:
        "Create a new project, then follow its status, budget validation, tasks, files, and conversation from one place.",
    },
    approvalsPage: {
      ...FALLBACK_BACKSTAGE_PORTAL_SETTINGS.approvalsPage,
      subtitle:
        "Review what Mainstage still needs to validate and what is already approved for each project.",
    },
    filesPage: {
      ...FALLBACK_BACKSTAGE_PORTAL_SETTINGS.filesPage,
      subtitle:
        "Files and deliverables uploaded by Mainstage will appear here once projects start moving.",
    },
    reportsPage: {
      ...FALLBACK_BACKSTAGE_PORTAL_SETTINGS.reportsPage,
      subtitle:
        "Invoices, quotations, and reports will appear here after Mainstage validates the project setup.",
    },
    messagesPage: {
      ...FALLBACK_BACKSTAGE_PORTAL_SETTINGS.messagesPage,
      subtitle:
        "Use this space to exchange notes with Mainstage and keep the follow-up history in one place.",
    },
    campaigns: [],
    projects: [],
    budgetEntries: [],
    approvals: [],
    files: [],
    reports: [],
    invoices: [],
    messages: [],
    activityLog: [],
  };
}
