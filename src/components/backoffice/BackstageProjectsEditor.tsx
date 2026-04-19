"use client";

import { useMemo, useState } from "react";
import { updateBackstagePortalSettingsAction } from "@/app/backoffice/backstage/actions";
import type { BackstagePortalSettings } from "@/lib/backstage-portal";

type ProjectFormItem = {
  id: string;
  name: string;
  status: "Live" | "Review" | "Scheduled" | "Completed";
  progress: string;
  startDate: string;
  endDate: string;
  poc: string;
  summary: string;
  scope: string;
  budget: string;
};

type BudgetFormItem = {
  id: string;
  projectId: string;
  label: string;
  type: "Budget" | "Quotation" | "Invoice";
  amount: string;
  status: "Pending review" | "Approved" | "Needs changes";
  submittedBy: string;
  updatedAt: string;
};

function newProject(index: number): ProjectFormItem {
  return {
    id: `project-new-${index}`,
    name: "",
    status: "Live",
    progress: "0",
    startDate: "",
    endDate: "",
    poc: "",
    summary: "",
    scope: "",
    budget: "",
  };
}

function newBudget(index: number): BudgetFormItem {
  return {
    id: `budget-new-${index}`,
    projectId: "",
    label: "",
    type: "Budget",
    amount: "",
    status: "Pending review",
    submittedBy: "",
    updatedAt: "",
  };
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-body font-medium text-black/60">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-[12px] border border-black/10 bg-white px-4 py-4 outline-none focus:border-[#CE2127]"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]"
        />
      )}
    </label>
  );
}

function StatusButton({
  active,
  label,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[38px] items-center justify-center rounded-[10px] px-3 text-[12px] font-body font-semibold uppercase tracking-[0.12em] transition-colors ${
        active ? tone : "border border-black/10 bg-white text-black/52 hover:border-[#CE2127]/35"
      }`}
    >
      {label}
    </button>
  );
}

export default function BackstageProjectsEditor({
  settings,
  redirectTarget,
  clientSlug,
  clientContext,
}: {
  settings: BackstagePortalSettings;
  redirectTarget: string;
  clientSlug?: string;
  clientContext?: React.ReactNode;
}) {
  const [pageTitle, setPageTitle] = useState(settings.projectsPage.title);
  const [pageSubtitle, setPageSubtitle] = useState(settings.projectsPage.subtitle);
  const [projects, setProjects] = useState<ProjectFormItem[]>(
    settings.projects.length
      ? settings.projects.map((item, index) => ({
          id: item.id || `project-${index + 1}`,
          name: item.name,
          status: item.status,
          progress: String(item.progress ?? 0),
          startDate: item.startDate,
          endDate: item.endDate,
          poc: item.poc,
          summary: item.summary,
          scope: item.scope,
          budget:
            settings.campaigns.find((campaign) => campaign.id === item.id)?.budget ?? "",
        }))
      : [newProject(1)]
  );
  const [budgetEntries, setBudgetEntries] = useState<BudgetFormItem[]>(
    settings.budgetEntries.length
      ? settings.budgetEntries.map((item, index) => ({
          id: item.id || `budget-${index + 1}`,
          projectId: item.projectId,
          label: item.label,
          type: item.type,
          amount: item.amount,
          status: item.status,
          submittedBy: item.submittedBy,
          updatedAt: item.updatedAt,
        }))
      : [newBudget(1)]
  );

  const projectOptions = useMemo(
    () =>
      projects
        .filter((item) => item.name.trim())
        .map((item) => ({
          id: item.id,
          name: item.name.trim(),
        })),
    [projects]
  );

  function updateProject(index: number, patch: Partial<ProjectFormItem>) {
    setProjects((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  }

  function updateBudget(index: number, patch: Partial<BudgetFormItem>) {
    setBudgetEntries((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  }

  return (
    <form action={updateBackstagePortalSettingsAction}>
      <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
        <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
          Projects
        </p>
        <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
          Edit client projects and budgets
        </h2>

        <input type="hidden" name="section" value="campaigns" />
        <input type="hidden" name="redirect_target" value={redirectTarget} />
        <input type="hidden" name="client_slug" value={clientSlug ?? ""} />
        <input type="hidden" name="project_count" value={String(projects.length)} />
        <input type="hidden" name="budget_count" value={String(budgetEntries.length)} />

        {clientContext}

        <div className="mt-5 space-y-4">
          <Field label="Page title" value={pageTitle} onChange={setPageTitle} />
          <input type="hidden" name="projects_page_title" value={pageTitle} />
          <Field
            label="Page subtitle"
            value={pageSubtitle}
            onChange={setPageSubtitle}
            textarea
          />
          <input type="hidden" name="projects_page_subtitle" value={pageSubtitle} />
        </div>

        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[16px] font-body font-bold text-[#181818]">Projects</p>
              <p className="mt-1 text-[14px] font-body leading-[1.7] text-black/58">
                Create and maintain every client project from one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setProjects((current) => [...current, newProject(current.length + 1)])}
              className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#CE2127] px-4 text-[14px] font-body font-semibold text-[#CE2127] transition-colors hover:bg-[#CE2127] hover:text-white"
            >
              Add project
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {projects.map((item, index) => (
              <div
                key={`project-card-${item.id}-${index}`}
                className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[13px] font-body font-semibold uppercase tracking-[0.14em] text-black/50">
                    {item.name.trim() ? item.name : `Project ${index + 1}`}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setProjects((current) =>
                        current.length > 1
                          ? current.filter((_, itemIndex) => itemIndex !== index)
                          : [newProject(1)]
                      )
                    }
                    className="inline-flex h-[34px] items-center justify-center rounded-[10px] border border-[#9f1b20]/20 px-3 text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-[#9f1b20] transition-colors hover:bg-[#fff1f2]"
                  >
                    Delete project
                  </button>
                </div>

                <input type="hidden" name={`project_id_${index + 1}`} value={item.id} />

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field
                    label="Project name"
                    value={item.name}
                    onChange={(value) => updateProject(index, { name: value })}
                  />
                  <label className="block">
                    <span className="text-[13px] font-body font-medium text-black/60">
                      Status
                    </span>
                    <select
                      value={item.status}
                      onChange={(event) =>
                        updateProject(index, {
                          status: event.target.value as ProjectFormItem["status"],
                        })
                      }
                      className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]"
                    >
                      <option value="Live">Live</option>
                      <option value="Review">Review</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </label>
                  <input type="hidden" name={`project_name_${index + 1}`} value={item.name} />
                  <input type="hidden" name={`project_status_${index + 1}`} value={item.status} />

                  <Field
                    label="Progress %"
                    value={item.progress}
                    onChange={(value) => updateProject(index, { progress: value })}
                  />
                  <Field
                    label="Assigned POC"
                    value={item.poc}
                    onChange={(value) => updateProject(index, { poc: value })}
                  />
                  <input type="hidden" name={`project_progress_${index + 1}`} value={item.progress} />
                  <input type="hidden" name={`project_poc_${index + 1}`} value={item.poc} />

                  <Field
                    label="Start date"
                    value={item.startDate}
                    onChange={(value) => updateProject(index, { startDate: value })}
                  />
                  <Field
                    label="End date"
                    value={item.endDate}
                    onChange={(value) => updateProject(index, { endDate: value })}
                  />
                  <input type="hidden" name={`project_start_date_${index + 1}`} value={item.startDate} />
                  <input type="hidden" name={`project_end_date_${index + 1}`} value={item.endDate} />

                  <Field
                    label="Budget summary"
                    value={item.budget}
                    onChange={(value) => updateProject(index, { budget: value })}
                  />
                  <div />
                  <input type="hidden" name={`project_budget_${index + 1}`} value={item.budget} />

                  <div className="md:col-span-2">
                    <Field
                      label="Short summary"
                      value={item.summary}
                      onChange={(value) => updateProject(index, { summary: value })}
                      textarea
                    />
                    <input
                      type="hidden"
                      name={`project_summary_${index + 1}`}
                      value={item.summary}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Scope / milestones"
                      value={item.scope}
                      onChange={(value) => updateProject(index, { scope: value })}
                      textarea
                    />
                    <input type="hidden" name={`project_scope_${index + 1}`} value={item.scope} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[16px] font-body font-bold text-[#181818]">
                Budgets, quotations, and invoices
              </p>
              <p className="mt-1 text-[14px] font-body leading-[1.7] text-black/58">
                Validate financial items before they are considered final.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setBudgetEntries((current) => [...current, newBudget(current.length + 1)])
              }
              className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#CE2127] px-4 text-[14px] font-body font-semibold text-[#CE2127] transition-colors hover:bg-[#CE2127] hover:text-white"
            >
              Add budget item
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {budgetEntries.map((item, index) => (
              <div
                key={`budget-card-${item.id}-${index}`}
                className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[13px] font-body font-semibold uppercase tracking-[0.14em] text-black/50">
                    {item.label.trim() ? item.label : `Budget item ${index + 1}`}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setBudgetEntries((current) =>
                        current.length > 1
                          ? current.filter((_, itemIndex) => itemIndex !== index)
                          : [newBudget(1)]
                      )
                    }
                    className="inline-flex h-[34px] items-center justify-center rounded-[10px] border border-[#9f1b20]/20 px-3 text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-[#9f1b20] transition-colors hover:bg-[#fff1f2]"
                  >
                    Delete item
                  </button>
                </div>

                <input type="hidden" name={`budget_id_${index + 1}`} value={item.id} />

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-[13px] font-body font-medium text-black/60">
                      Project
                    </span>
                    <select
                      value={item.projectId}
                      onChange={(event) =>
                        updateBudget(index, { projectId: event.target.value })
                      }
                      className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]"
                    >
                      <option value="">Choose a project</option>
                      {projectOptions.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Label"
                    value={item.label}
                    onChange={(value) => updateBudget(index, { label: value })}
                  />
                  <input type="hidden" name={`budget_project_${index + 1}`} value={item.projectId} />
                  <input type="hidden" name={`budget_label_${index + 1}`} value={item.label} />

                  <label className="block">
                    <span className="text-[13px] font-body font-medium text-black/60">
                      Type
                    </span>
                    <select
                      value={item.type}
                      onChange={(event) =>
                        updateBudget(index, {
                          type: event.target.value as BudgetFormItem["type"],
                        })
                      }
                      className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]"
                    >
                      <option value="Budget">Budget</option>
                      <option value="Quotation">Quotation</option>
                      <option value="Invoice">Invoice</option>
                    </select>
                  </label>
                  <Field
                    label="Amount"
                    value={item.amount}
                    onChange={(value) => updateBudget(index, { amount: value })}
                  />
                  <input type="hidden" name={`budget_type_${index + 1}`} value={item.type} />
                  <input type="hidden" name={`budget_amount_${index + 1}`} value={item.amount} />

                  <Field
                    label="Submitted by"
                    value={item.submittedBy}
                    onChange={(value) => updateBudget(index, { submittedBy: value })}
                  />
                  <Field
                    label="Updated at"
                    value={item.updatedAt}
                    onChange={(value) => updateBudget(index, { updatedAt: value })}
                  />
                  <input
                    type="hidden"
                    name={`budget_submitted_by_${index + 1}`}
                    value={item.submittedBy}
                  />
                  <input
                    type="hidden"
                    name={`budget_updated_at_${index + 1}`}
                    value={item.updatedAt}
                  />

                  <div className="md:col-span-2">
                    <span className="text-[13px] font-body font-medium text-black/60">
                      Validation status
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusButton
                        active={item.status === "Pending review"}
                        label="Pending review"
                        tone="bg-[#fff6e6] text-[#8a5b00]"
                        onClick={() => updateBudget(index, { status: "Pending review" })}
                      />
                      <StatusButton
                        active={item.status === "Approved"}
                        label="Approved"
                        tone="bg-[#eef8f0] text-[#2f7a3a]"
                        onClick={() => updateBudget(index, { status: "Approved" })}
                      />
                      <StatusButton
                        active={item.status === "Needs changes"}
                        label="Needs changes"
                        tone="bg-[#fff1f2] text-[#9f1b20]"
                        onClick={() => updateBudget(index, { status: "Needs changes" })}
                      />
                    </div>
                    <input
                      type="hidden"
                      name={`budget_status_${index + 1}`}
                      value={item.status}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white"
        >
          Save projects and budgets
        </button>
      </div>
    </form>
  );
}
