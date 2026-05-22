"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/frontend/components/brand-logo";
import type {
  AdminMediaAsset,
  AdminMediaType,
  AdminProject,
  AdminProjectStatus,
  AdminSiteSettings,
  AdminStore,
  ContactMessage,
  ContactMessageStatus
} from "@/shared/admin-types";
import { defaultAdminSiteSettings } from "@/shared/site-settings";
import { portfolioCategoryOptions } from "@/frontend/content/portfolio-content";

type AdminView =
  | "dashboard"
  | "upload"
  | "projects"
  | "homepage"
  | "messages"
  | "settings";

type AuthStatus = "checking" | "guest" | "authenticated";

type Credentials = {
  email: string;
  password: string;
};

type UploadDraft = {
  title: string;
  category: string;
  mediaType: AdminMediaType;
  description: string;
};

type AdminApiResponse = {
  email?: string;
  data?: AdminStore;
  error?: string;
};

type PublicAdminSummary = {
  publicProjects: number;
  mediaAssets: number;
  categories: number;
};

const emptyAdminData: AdminStore = {
  projects: [],
  media: [],
  messages: [],
  settings: defaultAdminSiteSettings
};

const adminNavItems: Array<{ id: AdminView; label: string; kicker: string }> = [
  { id: "dashboard", label: "Dashboard", kicker: "Overview" },
  { id: "upload", label: "Upload Media", kicker: "New work" },
  { id: "projects", label: "Manage Projects", kicker: "Portfolio" },
  { id: "homepage", label: "Control Home", kicker: "Homepage" },
  { id: "messages", label: "Messages", kicker: "Inbox" },
  { id: "settings", label: "Settings", kicker: "Profile" }
];

const projectStatusOrder: AdminProjectStatus[] = [
  "Draft",
  "Review",
  "Published",
  "Featured"
];

const messageStatusOrder: ContactMessageStatus[] = [
  "Unread",
  "Open",
  "Replied"
];

const addCategoryOption = "__add_category__";

const homepageControls: Array<{
  key: keyof Pick<
    AdminSiteSettings["homepage"],
    | "heroVideoEnabled"
    | "featuredProjectsEnabled"
    | "ratingCommentsEnabled"
    | "bookingCtaEnabled"
  >;
  label: string;
}> = [
  { key: "heroVideoEnabled", label: "Hero video" },
  { key: "featuredProjectsEnabled", label: "Featured projects" },
  { key: "ratingCommentsEnabled", label: "Rating comments" },
  { key: "bookingCtaEnabled", label: "Book now section" }
];

function getNextProjectStatus(status: AdminProjectStatus) {
  const currentIndex = projectStatusOrder.indexOf(status);
  return projectStatusOrder[(currentIndex + 1) % projectStatusOrder.length];
}

function getNextMessageStatus(status: ContactMessageStatus) {
  const currentIndex = messageStatusOrder.indexOf(status);
  return messageStatusOrder[(currentIndex + 1) % messageStatusOrder.length];
}

function addUniqueCategory(categories: string[], category: string) {
  const nextCategory = category.trim();

  if (
    nextCategory &&
    !categories.some(
      (currentCategory) =>
        currentCategory.toLowerCase() === nextCategory.toLowerCase()
    )
  ) {
    categories.push(nextCategory);
  }
}

function isKnownCategory(category: string, categoryOptions: string[]) {
  return categoryOptions.some((option) => option === category);
}

function readCategorySelection(value: string, currentCategory: string) {
  if (value !== addCategoryOption) {
    return value;
  }

  return window.prompt("New category name")?.trim() || currentCategory;
}

function getDashboardStats(data: AdminStore) {
  const liveProjects = data.projects.filter((project) =>
    ["Published", "Featured"].includes(project.status)
  ).length;
  const draftUpdates = data.projects.filter((project) =>
    ["Draft", "Review"].includes(project.status)
  ).length;
  const unreadMessages = data.messages.filter(
    (message) => message.status === "Unread"
  ).length;

  return [
    {
      label: "Live Projects",
      value: String(liveProjects),
      note: `${data.projects.length} total projects saved`
    },
    {
      label: "Media Assets",
      value: String(data.media.length),
      note: "Saved media records and uploads"
    },
    {
      label: "New Messages",
      value: String(unreadMessages),
      note: `${data.messages.length} total contact messages`
    },
    {
      label: "Draft Updates",
      value: String(draftUpdates),
      note: "Projects still in progress"
    }
  ];
}

function getRecentActivity(data: AdminStore) {
  const projectActivity = data.projects.slice(0, 3).map((project) => {
    return `${project.title} is ${project.status.toLowerCase()} in ${project.category}.`;
  });

  if (data.media[0]) {
    projectActivity.unshift(`${data.media[0].title} media was saved to the library.`);
  }

  return projectActivity.length
    ? projectActivity.slice(0, 4)
    : ["No saved admin activity yet."];
}

function getMessageReplyHref(message: ContactMessage) {
  const subject = `Re: ERISHOT ${message.service}`;
  const body = [
    `Hi ${message.firstName},`,
    "",
    "",
    "ERISHOT",
    "",
    "---",
    `Original message from ${message.firstName} ${message.lastName}:`,
    message.message
  ].join("\n");

  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: message.email,
    su: subject,
    body
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

async function readApiResponse(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as AdminApiResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "The admin request failed.");
  }

  return payload;
}

export function AdminPortal() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: ""
  });
  const [sessionEmail, setSessionEmail] = useState("");
  const [adminData, setAdminData] = useState<AdminStore>(emptyAdminData);
  const [settingsDraft, setSettingsDraft] =
    useState<AdminSiteSettings>(defaultAdminSiteSettings);
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [uploadDraft, setUploadDraft] = useState<UploadDraft>({
    title: "",
    category: "Weddings",
    mediaType: "Photo",
    description: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploadNotice, setUploadNotice] = useState("");
  const [isSavingUpload, setIsSavingUpload] = useState(false);
  const [editingMediaId, setEditingMediaId] = useState("");
  const [savingMediaId, setSavingMediaId] = useState("");
  const [deletingMediaId, setDeletingMediaId] = useState("");
  const [projectNotice, setProjectNotice] = useState("");
  const [updatingProjectId, setUpdatingProjectId] = useState("");
  const [messageNotice, setMessageNotice] = useState("");
  const [updatingMessageId, setUpdatingMessageId] = useState("");
  const [settingsNotice, setSettingsNotice] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [publicSummary, setPublicSummary] = useState<PublicAdminSummary>({
    publicProjects: 0,
    mediaAssets: 0,
    categories: 0
  });
  const loginStats = [
    { label: "Live projects", value: publicSummary.publicProjects },
    { label: "Media assets", value: publicSummary.mediaAssets },
    { label: "Categories", value: publicSummary.categories }
  ];

  const applyAdminData = useCallback((data: AdminStore | undefined) => {
    const nextData = data ?? emptyAdminData;

    setAdminData(nextData);
    setSettingsDraft(nextData.settings);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session", {
          cache: "no-store"
        });
        const payload = await readApiResponse(response);

        if (!isMounted) {
          return;
        }

        setSessionEmail(payload.email ?? "");
        applyAdminData(payload.data);
        setAuthStatus("authenticated");
      } catch {
        if (isMounted) {
          setAuthStatus("guest");
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [applyAdminData]);

  useEffect(() => {
    let isMounted = true;

    async function loadPublicSummary() {
      try {
        const response = await fetch("/api/admin/public-summary", {
          cache: "no-store"
        });
        const payload = (await response.json()) as PublicAdminSummary;

        if (isMounted) {
          setPublicSummary(payload);
        }
      } catch {
        if (isMounted) {
          setPublicSummary({
            publicProjects: 0,
            mediaAssets: 0,
            categories: 0
          });
        }
      }
    }

    loadPublicSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeItem = useMemo(
    () => adminNavItems.find((item) => item.id === activeView) ?? adminNavItems[0],
    [activeView]
  );
  const unreadMessageCount = useMemo(
    () => adminData.messages.filter((message) => message.status === "Unread").length,
    [adminData.messages]
  );
  const uploadCategoryOptions = useMemo(() => {
    const categories: string[] = [...portfolioCategoryOptions];

    adminData.projects.forEach((project) =>
      addUniqueCategory(categories, project.category)
    );
    adminData.media.forEach((asset) => addUniqueCategory(categories, asset.category));
    addUniqueCategory(categories, uploadDraft.category);

    return categories;
  }, [adminData.media, adminData.projects, uploadDraft.category]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });
      const payload = await readApiResponse(response);

      setSessionEmail(payload.email ?? credentials.email);
      applyAdminData(payload.data);
      setCredentials((current) => ({ ...current, password: "" }));
      setAuthStatus("authenticated");
      setActiveView("dashboard");
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Could not sign in."
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    setAuthStatus("guest");
    setCredentials((current) => ({ ...current, password: "" }));
    setSessionEmail("");
    applyAdminData(emptyAdminData);
    setActiveView("dashboard");
    setUploadNotice("");
    setProjectNotice("");
    setMessageNotice("");
    setSettingsNotice("");
  }

  async function handleUploadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadNotice("");

    if (!uploadDraft.title.trim()) {
      setUploadNotice("Add a project title before saving media.");
      return;
    }

    const formData = new FormData();
    formData.append("title", uploadDraft.title);
    formData.append("category", uploadDraft.category);
    formData.append("mediaType", uploadDraft.mediaType);
    formData.append("description", uploadDraft.description);

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    setIsSavingUpload(true);

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData
      });
      const payload = await readApiResponse(response);

      applyAdminData(payload.data);
      setUploadDraft({
        title: "",
        category: "Weddings",
        mediaType: "Photo",
        description: ""
      });
      setSelectedFile(null);
      setFileInputKey((current) => current + 1);
      setUploadNotice(
        "Media saved as Draft. Move it to Published or Featured in Manage Projects to show it publicly."
      );
    } catch (error) {
      setUploadNotice(
        error instanceof Error ? error.message : "Could not save media."
      );
    } finally {
      setIsSavingUpload(false);
    }
  }

  async function handleMediaUpdate(mediaId: string, draft: UploadDraft) {
    setUploadNotice("");
    setSavingMediaId(mediaId);

    try {
      const response = await fetch(
        `/api/admin/media/${encodeURIComponent(mediaId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(draft)
        }
      );
      const payload = await readApiResponse(response);

      applyAdminData(payload.data);
      setEditingMediaId("");
      setUploadNotice("Media details updated.");
    } catch (error) {
      setUploadNotice(
        error instanceof Error ? error.message : "Could not update media."
      );
    } finally {
      setSavingMediaId("");
    }
  }

  async function handleMediaDelete(asset: AdminMediaAsset) {
    const confirmed = window.confirm(
      `Delete ${asset.title}? This removes the media from the admin library and public portfolio.`
    );

    if (!confirmed) {
      return;
    }

    setUploadNotice("");
    setDeletingMediaId(asset.id);

    try {
      const response = await fetch(
        `/api/admin/media/${encodeURIComponent(asset.id)}`,
        {
          method: "DELETE"
        }
      );
      const payload = await readApiResponse(response);

      applyAdminData(payload.data);
      setUploadNotice(`${asset.title} was deleted.`);
    } catch (error) {
      setUploadNotice(
        error instanceof Error ? error.message : "Could not delete media."
      );
    } finally {
      setDeletingMediaId("");
    }
  }

  async function handleProjectStatusAdvance(project: AdminProject) {
    const nextStatus = getNextProjectStatus(project.status);
    setProjectNotice("");
    setUpdatingProjectId(project.id);

    try {
      const response = await fetch(
        `/api/admin/projects/${encodeURIComponent(project.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: nextStatus })
        }
      );
      const payload = await readApiResponse(response);

      applyAdminData(payload.data);
      setProjectNotice(`${project.title} moved to ${nextStatus}.`);
    } catch (error) {
      setProjectNotice(
        error instanceof Error ? error.message : "Could not update project."
      );
    } finally {
      setUpdatingProjectId("");
    }
  }

  async function handleMessageStatusAdvance(message: ContactMessage) {
    const nextStatus = getNextMessageStatus(message.status);
    setMessageNotice("");
    setUpdatingMessageId(message.id);

    try {
      const response = await fetch(
        `/api/admin/messages/${encodeURIComponent(message.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: nextStatus })
        }
      );
      const payload = await readApiResponse(response);

      applyAdminData(payload.data);
      setMessageNotice(`${message.firstName} ${message.lastName} moved to ${nextStatus}.`);
    } catch (error) {
      setMessageNotice(
        error instanceof Error ? error.message : "Could not update message."
      );
    } finally {
      setUpdatingMessageId("");
    }
  }

  async function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsNotice("");
    setIsSavingSettings(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settingsDraft)
      });
      const payload = await readApiResponse(response);

      applyAdminData(payload.data);
      setSettingsNotice("Settings saved to the database.");
    } catch (error) {
      setSettingsNotice(
        error instanceof Error ? error.message : "Could not save settings."
      );
    } finally {
      setIsSavingSettings(false);
    }
  }

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 text-fog">
        <div className="border border-white/10 bg-charcoal p-8 text-center shadow-glow">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.3em] text-gold">
            ERISHOT Admin
          </p>
          <h1 className="mt-4 text-3xl font-black uppercase text-white">
            Checking session
          </h1>
        </div>
      </main>
    );
  }

  if (authStatus === "guest") {
    return (
      <main className="min-h-screen overflow-hidden bg-ink text-fog">
        <section className="relative flex min-h-screen items-center px-5 py-10 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(169,132,69,0.2),transparent_34%),linear-gradient(120deg,rgba(255,255,255,0.04),transparent_45%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gold/40" />

          <div className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <a href="/" className="inline-flex text-[0.68rem] font-black uppercase tracking-[0.34em] text-white">
                ERISHOT
              </a>

              <div className="max-w-xl">
                <p className="mb-4 text-[0.7rem] font-black uppercase tracking-[0.32em] text-gold">
                  Admin Portal
                </p>
                <h1 className="text-5xl font-black uppercase leading-[0.88] text-white sm:text-7xl">
                  Control the edit
                </h1>
                <p className="mt-6 max-w-md text-sm leading-7 text-white/58">
                  Sign in to manage ERISHOT projects, uploaded files, homepage
                  content, client messages, and account settings from one
                  cinematic workspace.
                </p>
              </div>

              <div className="grid max-w-xl grid-cols-3 border-y border-white/10 py-5 text-center">
                {loginStats.map(({ label, value }, index) => (
                  <div key={label} className={index === 1 ? "border-x border-white/10" : ""}>
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-white/45">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              onSubmit={handleLogin}
              className="border border-white/10 bg-charcoal/88 p-5 shadow-glow backdrop-blur sm:p-8"
            >
              <div className="mb-8 flex items-start justify-between gap-5">
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.28em] text-gold">
                    Secure entry
                  </p>
                  <h2 className="mt-3 text-3xl font-black uppercase text-white">
                    Login
                  </h2>
                </div>
                <div className="border border-gold/35 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.22em] text-gold">
                  Private
                </div>
              </div>

              <div className="space-y-5">
                <label className="block">
                  <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
                    Email
                  </span>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(event) =>
                      setCredentials((current) => ({
                        ...current,
                        email: event.target.value
                      }))
                    }
                    placeholder="admin@erishot.com"
                    className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-gold"
                  />
                </label>

                <label className="block">
                  <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
                    Password
                  </span>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(event) =>
                      setCredentials((current) => ({
                        ...current,
                        password: event.target.value
                      }))
                    }
                    placeholder="Use configured password"
                    className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-gold"
                  />
                </label>
              </div>

              {loginError ? (
                <p className="mt-4 border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
                  {loginError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="mt-7 w-full bg-white px-5 py-4 text-[0.7rem] font-black uppercase tracking-[0.24em] text-ink transition hover:bg-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isLoggingIn ? "Signing in" : "Enter Dashboard"}
              </button>
            </motion.form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink text-fog">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-charcoal/92 px-5 py-5 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div>
              <a href="/" className="text-[0.68rem] font-black uppercase tracking-[0.34em] text-white">
                ERISHOT
              </a>
              <p className="mt-3 text-[0.62rem] font-black uppercase tracking-[0.24em] text-gold">
                Admin Control
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="border border-white/15 px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.2em] text-white/70 transition hover:border-gold hover:text-gold lg:hidden"
            >
              Logout
            </button>
          </div>

          <nav className="mt-7 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {adminNavItems.map((item) => {
              const isActive = item.id === activeView;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`min-w-44 border px-4 py-4 text-left transition lg:w-full ${
                    isActive
                      ? "border-gold bg-gold/10 text-white"
                      : "border-white/10 bg-ink/35 text-white/62 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span className="block text-[0.62rem] font-black uppercase tracking-[0.22em] text-gold">
                    {item.kicker}
                  </span>
                  <span className="mt-1 block text-sm font-black uppercase">
                    {item.label}
                    {item.id === "messages" && unreadMessageCount ? (
                      <span className="ml-2 inline-flex min-w-6 justify-center bg-gold px-2 py-1 text-[0.58rem] text-ink">
                        {unreadMessageCount}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 hidden w-full border border-white/15 px-4 py-4 text-left text-[0.68rem] font-black uppercase tracking-[0.22em] text-white/60 transition hover:border-gold hover:text-gold lg:block"
          >
            Logout
          </button>
        </aside>

        <section className="flex-1 px-5 py-7 sm:px-8 lg:px-10">
          <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.28em] text-gold">
                {activeItem.kicker}
              </p>
              <h1 className="mt-2 text-4xl font-black uppercase leading-none text-white sm:text-5xl">
                {activeItem.label}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveView("messages")}
                className={`px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.2em] transition ${
                  unreadMessageCount
                    ? "animate-pulse border border-gold bg-gold text-ink shadow-glow"
                    : "border border-white/10 text-white/45 hover:border-gold hover:text-gold"
                }`}
              >
                {unreadMessageCount
                  ? `Urgent messages ${unreadMessageCount}`
                  : "Notifications 0"}
              </button>
              <div className="border border-white/10 px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.2em] text-white/45">
                Signed in as {sessionEmail || "admin"}
              </div>
            </div>
          </header>

          {activeView === "dashboard" ? <DashboardView data={adminData} /> : null}
          {activeView === "upload" ? (
            <UploadView
              categoryOptions={uploadCategoryOptions}
              draft={uploadDraft}
              fileInputKey={fileInputKey}
              editingMediaId={editingMediaId}
              deletingMediaId={deletingMediaId}
              isSaving={isSavingUpload}
              media={adminData.media}
              notice={uploadNotice}
              savingMediaId={savingMediaId}
              selectedFile={selectedFile}
              onChange={setUploadDraft}
              onDeleteMedia={handleMediaDelete}
              onEditMedia={setEditingMediaId}
              onFileChange={setSelectedFile}
              onUpdateMedia={handleMediaUpdate}
              onSubmit={handleUploadSubmit}
            />
          ) : null}
          {activeView === "projects" ? (
            <ProjectsView
              notice={projectNotice}
              projects={adminData.projects}
              updatingProjectId={updatingProjectId}
              onAdvance={handleProjectStatusAdvance}
            />
          ) : null}
          {activeView === "homepage" ? (
            <HomepageView
              isSaving={isSavingSettings}
              notice={settingsNotice}
              settings={settingsDraft}
              onChange={setSettingsDraft}
              onSubmit={handleSettingsSubmit}
            />
          ) : null}
          {activeView === "messages" ? (
            <MessagesView
              messages={adminData.messages}
              notice={messageNotice}
              updatingMessageId={updatingMessageId}
              onAdvance={handleMessageStatusAdvance}
            />
          ) : null}
          {activeView === "settings" ? (
            <SettingsView
              isSaving={isSavingSettings}
              notice={settingsNotice}
              settings={settingsDraft}
              onChange={setSettingsDraft}
              onSubmit={handleSettingsSubmit}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function DashboardView({ data }: { data: AdminStore }) {
  const dashboardStats = getDashboardStats(data);
  const recentActivity = getRecentActivity(data);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className="border border-white/10 bg-charcoal p-5">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-white/45">
              {stat.label}
            </p>
            <p className="mt-5 text-5xl font-black text-white">{stat.value}</p>
            <p className="mt-3 text-sm text-white/52">{stat.note}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="border border-white/10 bg-charcoal p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black uppercase text-white">Production Pulse</h2>
            <span className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-gold">
              Live
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {["Shoot", "Edit", "Publish"].map((step, index) => (
              <div key={step} className="border border-white/10 bg-ink p-4">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-gold">
                  0{index + 1}
                </p>
                <h3 className="mt-4 text-lg font-black uppercase text-white">{step}</h3>
                <p className="mt-3 text-sm leading-6 text-white/52">
                  {[
                    "Capture briefs, shoot dates, and client notes.",
                    "Review selects, color direction, and delivery drafts.",
                    "Send approved work into homepage and portfolio slots."
                  ][index]}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-white/10 bg-charcoal p-5 sm:p-6">
          <h2 className="text-xl font-black uppercase text-white">Recent Activity</h2>
          <div className="mt-6 space-y-4">
            {recentActivity.map((item, index) => (
              <div key={item} className="flex gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                <span className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-gold">
                  0{index + 1}
                </span>
                <p className="text-sm leading-6 text-white/64">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function UploadView({
  categoryOptions,
  draft,
  deletingMediaId,
  editingMediaId,
  fileInputKey,
  isSaving,
  media,
  notice,
  savingMediaId,
  selectedFile,
  onChange,
  onDeleteMedia,
  onEditMedia,
  onFileChange,
  onUpdateMedia,
  onSubmit
}: {
  categoryOptions: string[];
  draft: UploadDraft;
  deletingMediaId: string;
  editingMediaId: string;
  fileInputKey: number;
  isSaving: boolean;
  media: AdminMediaAsset[];
  notice: string;
  savingMediaId: string;
  selectedFile: File | null;
  onChange: (draft: UploadDraft) => void;
  onDeleteMedia: (asset: AdminMediaAsset) => void;
  onEditMedia: (mediaId: string) => void;
  onFileChange: (file: File | null) => void;
  onUpdateMedia: (mediaId: string, draft: UploadDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [mediaSearch, setMediaSearch] = useState("");
  const filteredMedia = useMemo(() => {
    const query = mediaSearch.trim().toLowerCase();

    if (!query) {
      return media;
    }

    return media.filter((asset) =>
      [asset.title, asset.fileName, asset.category]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [media, mediaSearch]);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={onSubmit} className="border border-white/10 bg-charcoal p-5 sm:p-6">
        <h2 className="text-xl font-black uppercase text-white">Save New Media</h2>
        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
              Project title
            </span>
            <input
              value={draft.title}
              onChange={(event) => onChange({ ...draft, title: event.target.value })}
              placeholder="Project name"
              className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-gold"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
                Category
              </span>
              <select
                value={draft.category}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    category: readCategorySelection(
                      event.target.value,
                      draft.category
                    )
                  })
                }
                className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition focus:border-gold"
              >
                {!isKnownCategory(draft.category, categoryOptions) ? (
                  <option>{draft.category}</option>
                ) : null}
                {categoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
                <option value={addCategoryOption}>Add new category...</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
                Media type
              </span>
              <select
                value={draft.mediaType}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    mediaType: event.target.value as AdminMediaType
                  })
                }
                className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition focus:border-gold"
              >
                <option>Photo</option>
                <option>Video</option>
                <option>Gallery</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
              Media file
            </span>
            <input
              key={fileInputKey}
              type="file"
              accept="image/*,video/*"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white file:mr-4 file:border-0 file:bg-white file:px-4 file:py-2 file:text-[0.62rem] file:font-black file:uppercase file:tracking-[0.18em] file:text-ink"
            />
          </label>

          <label className="block">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
              Description
            </span>
            <textarea
              value={draft.description}
              onChange={(event) => onChange({ ...draft, description: event.target.value })}
              placeholder="Short project note"
              rows={5}
              className="mt-3 w-full resize-none border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-gold"
            />
          </label>
        </div>

        {selectedFile ? (
          <p className="mt-5 border border-white/10 bg-ink px-4 py-3 text-sm text-white/60">
            Selected: {selectedFile.name}
          </p>
        ) : null}

        {notice ? (
          <p className="mt-5 border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 bg-white px-5 py-4 text-[0.7rem] font-black uppercase tracking-[0.22em] text-ink transition hover:bg-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? "Saving Media" : "Save Media"}
        </button>
      </form>

      <article className="border border-white/10 bg-charcoal p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-black uppercase text-white">Saved Media</h2>
          <span className="border border-gold/40 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.18em] text-gold">
            {media.length} assets
          </span>
        </div>
        <label className="mt-5 block">
          <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
            Search media
          </span>
          <input
            value={mediaSearch}
            onChange={(event) => setMediaSearch(event.target.value)}
            placeholder="Search by project title or name"
            className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-gold"
          />
        </label>
        <div className="mt-6 space-y-4">
          {filteredMedia.length ? (
            filteredMedia.map((asset) => (
              <MediaLibraryItem
                key={asset.id}
                asset={asset}
                categoryOptions={categoryOptions}
                isDeleting={deletingMediaId === asset.id}
                isEditing={editingMediaId === asset.id}
                isSaving={savingMediaId === asset.id}
                onCancelEdit={() => onEditMedia("")}
                onDelete={() => onDeleteMedia(asset)}
                onEdit={() => onEditMedia(asset.id)}
                onSave={(nextDraft) => onUpdateMedia(asset.id, nextDraft)}
              />
            ))
          ) : media.length ? (
            <div className="flex min-h-80 items-center justify-center border border-dashed border-gold/35 bg-ink/70 px-6 text-center">
              <div>
                <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-gold">
                  No matches
                </p>
                <p className="mt-4 max-w-sm text-sm leading-6 text-white/54">
                  Try a different project title, file name, or category.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center border border-dashed border-gold/35 bg-ink/70 px-6 text-center">
              <div>
                <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-gold">
                  Empty library
                </p>
                <p className="mt-4 max-w-sm text-sm leading-6 text-white/54">
                  Saved uploads will appear here after the first media record is
                  created.
                </p>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

function MediaLibraryItem({
  asset,
  categoryOptions,
  isDeleting,
  isEditing,
  isSaving,
  onCancelEdit,
  onDelete,
  onEdit,
  onSave
}: {
  asset: AdminMediaAsset;
  categoryOptions: string[];
  isDeleting: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSave: (draft: UploadDraft) => void;
}) {
  const [draft, setDraft] = useState<UploadDraft>({
    title: asset.title,
    category: asset.category,
    mediaType: asset.mediaType,
    description: asset.description
  });

  useEffect(() => {
    if (isEditing) {
      setDraft({
        title: asset.title,
        category: asset.category,
        mediaType: asset.mediaType,
        description: asset.description
      });
    }
  }, [asset, isEditing]);

  function handleSave() {
    onSave(draft);
  }

  if (isEditing) {
    return (
      <div className="grid gap-4 border border-gold/35 bg-ink p-3 md:grid-cols-[4.5rem_1fr]">
        <MediaThumb asset={asset} />
        <div className="grid gap-3">
          <input
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            className="w-full border border-white/10 bg-charcoal px-3 py-3 text-sm text-white outline-none transition focus:border-gold"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  category: readCategorySelection(
                    event.target.value,
                    draft.category
                  )
                })
              }
              className="w-full border border-white/10 bg-charcoal px-3 py-3 text-sm text-white outline-none transition focus:border-gold"
            >
              {!isKnownCategory(draft.category, categoryOptions) ? (
                <option>{draft.category}</option>
              ) : null}
              {categoryOptions.map((category) => (
                <option key={category}>{category}</option>
              ))}
              <option value={addCategoryOption}>Add new category...</option>
            </select>
            <select
              value={draft.mediaType}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  mediaType: event.target.value as AdminMediaType
                })
              }
              className="w-full border border-white/10 bg-charcoal px-3 py-3 text-sm text-white outline-none transition focus:border-gold"
            >
              <option>Photo</option>
              <option>Video</option>
              <option>Gallery</option>
            </select>
          </div>
          <textarea
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            rows={3}
            className="w-full resize-none border border-white/10 bg-charcoal px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-gold"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="bg-white px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.18em] text-ink transition hover:bg-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSaving ? "Saving" : "Save"}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={onCancelEdit}
              className="border border-white/10 px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.18em] text-white/60 transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-55"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 border border-white/10 bg-ink p-3 md:grid-cols-[4.5rem_1fr_auto]">
      <MediaThumb asset={asset} />
      <div className="min-w-0">
        <p className="truncate text-sm font-black uppercase text-white">
          {asset.title}
        </p>
        <p className="mt-2 text-[0.62rem] font-black uppercase tracking-[0.18em] text-gold">
          {asset.mediaType} / {asset.category}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">
          {asset.description || "No description saved yet."}
        </p>
        <p className="mt-2 truncate text-sm text-white/34">
          {asset.fileName ?? "Metadata saved without a file"}
        </p>
      </div>
      <div className="flex flex-wrap items-start gap-3 md:flex-col md:items-end">
        <button
          type="button"
          onClick={onEdit}
          className="border border-gold/35 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.18em] text-gold transition hover:bg-gold hover:text-ink"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={onDelete}
          className="border border-white/10 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.18em] text-white/55 transition hover:border-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isDeleting ? "Deleting" : "Delete"}
        </button>
      </div>
    </div>
  );
}

function MediaThumb({ asset }: { asset: AdminMediaAsset }) {
  if (asset.url && asset.fileType?.startsWith("image/")) {
    return (
      <Image
        src={asset.url}
        alt=""
        width={72}
        height={72}
        className="h-[4.5rem] w-[4.5rem] object-cover"
      />
    );
  }

  return (
    <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center bg-charcoal text-[0.62rem] font-black uppercase tracking-[0.16em] text-gold">
      {asset.mediaType}
    </div>
  );
}

function ProjectsView({
  notice,
  projects,
  updatingProjectId,
  onAdvance
}: {
  notice: string;
  projects: AdminProject[];
  updatingProjectId: string;
  onAdvance: (project: AdminProject) => void;
}) {
  return (
    <article className="border border-white/10 bg-charcoal">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-black uppercase text-white">Project Library</h2>
          <p className="mt-2 text-sm text-white/50">Review status, category, and saved state.</p>
        </div>
        <span className="border border-gold/40 px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.2em] text-gold">
          {projects.length} saved
        </span>
      </div>

      {notice ? (
        <p className="border-b border-gold/20 bg-gold/10 px-5 py-4 text-sm text-gold sm:px-6">
          {notice}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 text-[0.62rem] font-black uppercase tracking-[0.22em] text-white/42">
              <th className="px-5 py-4 sm:px-6">Title</th>
              <th className="px-5 py-4 sm:px-6">Category</th>
              <th className="px-5 py-4 sm:px-6">Status</th>
              <th className="px-5 py-4 sm:px-6">Date</th>
              <th className="px-5 py-4 sm:px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-white/10 last:border-b-0">
                <td className="px-5 py-5 text-sm font-black uppercase text-white sm:px-6">
                  {project.title}
                </td>
                <td className="px-5 py-5 text-sm text-white/58 sm:px-6">{project.category}</td>
                <td className="px-5 py-5 sm:px-6">
                  <span className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-gold">
                    {project.status}
                  </span>
                </td>
                <td className="px-5 py-5 text-sm text-white/58 sm:px-6">{project.date}</td>
                <td className="px-5 py-5 sm:px-6">
                  <button
                    type="button"
                    disabled={updatingProjectId === project.id}
                    onClick={() => onAdvance(project)}
                    className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-white/60 transition hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingProjectId === project.id
                      ? "Saving"
                      : `Move to ${getNextProjectStatus(project.status)}`}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function HomepageView({
  isSaving,
  notice,
  settings,
  onChange,
  onSubmit
}: {
  isSaving: boolean;
  notice: string;
  settings: AdminSiteSettings;
  onChange: (settings: AdminSiteSettings) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-2">
      <article className="border border-white/10 bg-charcoal p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black uppercase text-white">Control Home</h2>
          <button
            type="button"
            onClick={() => setIsEditing((current) => !current)}
            className="border border-gold/35 px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.2em] text-gold transition hover:bg-gold hover:text-ink"
          >
            {isEditing ? "Editing" : "Edit"}
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {homepageControls.map((control) => (
            <label
              key={control.key}
              className="flex items-center justify-between gap-5 border border-white/10 bg-ink px-4 py-4"
            >
              <span className="text-sm font-black uppercase text-white">{control.label}</span>
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={Boolean(settings.homepage[control.key])}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    homepage: {
                      ...settings.homepage,
                      [control.key]: event.target.checked
                    }
                  })
                }
                className="h-5 w-5 accent-[#a98445] disabled:cursor-not-allowed disabled:opacity-40"
              />
            </label>
          ))}
        </div>
      </article>

      <article className="border border-white/10 bg-charcoal p-5 sm:p-6">
        <h2 className="text-xl font-black uppercase text-white">Front Page Copy</h2>
        <div className="mt-6 space-y-5">
          {[
            ["heroEyebrow", "Hero eyebrow"],
            ["heroHeadline", "Hero headline"],
            ["heroSubtitle", "Hero subtitle"],
            ["heroVideoUrl", "Hero video URL"],
            ["heroImageUrl", "Hero image URL"],
            ["heroPrimaryLabel", "Primary button text"],
            ["heroSecondaryLabel", "Secondary button text"],
            ["featuredSectionTitle", "Featured section title"],
            ["bookingCta", "Booking CTA"]
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
                {label}
              </span>
              {key === "heroSubtitle" ? (
                <textarea
                  value={String(
                    settings.homepage[key as keyof AdminSiteSettings["homepage"]]
                  )}
                  disabled={!isEditing}
                  onChange={(event) =>
                    onChange({
                      ...settings,
                      homepage: {
                        ...settings.homepage,
                        [key]: event.target.value
                      }
                    })
                  }
                  rows={4}
                  className="mt-3 w-full resize-none border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                <input
                value={String(
                  settings.homepage[key as keyof AdminSiteSettings["homepage"]]
                )}
                disabled={!isEditing}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    homepage: {
                      ...settings.homepage,
                      [key]: event.target.value
                    }
                  })
                }
                  className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
                />
              )}
            </label>
          ))}
        </div>

        {notice ? (
          <p className="mt-5 border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!isEditing || isSaving}
          className="mt-6 bg-white px-5 py-4 text-[0.7rem] font-black uppercase tracking-[0.22em] text-ink transition hover:bg-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? "Saving Settings" : "Save Home Page"}
        </button>
      </article>
    </form>
  );
}

function MessagesView({
  messages,
  notice,
  updatingMessageId,
  onAdvance
}: {
  messages: ContactMessage[];
  notice: string;
  updatingMessageId: string;
  onAdvance: (message: ContactMessage) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <article className="border border-white/10 bg-charcoal p-5 sm:p-6">
        <h2 className="text-xl font-black uppercase text-white">Message Status</h2>
        <div className="mt-6 space-y-4">
          {messageStatusOrder.map((status) => (
            <div key={status} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
              <span className="text-sm font-black uppercase text-white">{status}</span>
              <span className="text-2xl font-black text-gold">
                {messages.filter((message) => message.status === status).length}
              </span>
            </div>
          ))}
        </div>
      </article>

      <article className="border border-white/10 bg-charcoal">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <h2 className="text-xl font-black uppercase text-white">Inbox</h2>
        </div>

        {notice ? (
          <p className="border-b border-gold/20 bg-gold/10 px-5 py-4 text-sm text-gold sm:px-6">
            {notice}
          </p>
        ) : null}

        <div>
          {messages.length ? (
            messages.map((message) => (
              <div key={message.id} className="grid gap-4 border-b border-white/10 p-5 last:border-b-0 sm:grid-cols-[1fr_auto] sm:p-6">
                <div>
                  <p className="text-sm font-black uppercase text-white">
                    {message.firstName} {message.lastName}
                  </p>
                  <p className="mt-2 text-sm text-white/58">
                    {message.service} / {message.email}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                    {message.message}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 text-[0.62rem] font-black uppercase tracking-[0.2em] sm:items-end">
                  <span className="text-gold">{message.status}</span>
                  <a
                    href={getMessageReplyHref(message)}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-gold/35 px-3 py-2 text-gold transition hover:bg-gold hover:text-ink"
                  >
                    Reply in Gmail
                  </a>
                  <button
                    type="button"
                    disabled={updatingMessageId === message.id}
                    onClick={() => onAdvance(message)}
                    className="text-white/60 transition hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingMessageId === message.id
                      ? "Saving"
                      : `Move to ${getNextMessageStatus(message.status)}`}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-5 text-sm leading-6 text-white/52 sm:p-6">
              No contact messages yet.
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

function SettingsView({
  isSaving,
  notice,
  settings,
  onChange,
  onSubmit
}: {
  isSaving: boolean;
  notice: string;
  settings: AdminSiteSettings;
  onChange: (settings: AdminSiteSettings) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-2">
      <article className="border border-white/10 bg-charcoal p-5 sm:p-6">
        <h2 className="text-xl font-black uppercase text-white">Brand & Contact</h2>
        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
              Logo image URL
            </span>
            <input
              value={settings.branding.logoUrl}
              onChange={(event) =>
                onChange({
                  ...settings,
                  branding: {
                    ...settings.branding,
                    logoUrl: event.target.value
                  }
                })
              }
              placeholder="/images/erishot-logo-transparent.png"
              className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-gold"
            />
          </label>

          <div className="border border-white/10 bg-ink px-4 py-5">
            <p className="mb-4 text-[0.62rem] font-black uppercase tracking-[0.2em] text-white/42">
              Logo preview
            </p>
            <BrandLogo logoUrl={settings.branding.logoUrl} />
          </div>

          {[
            ["instagram", "Instagram"],
            ["email", "Email"],
            ["tiktok", "TikTok"]
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
                {label}
              </span>
              <input
                value={settings.channels[key as keyof AdminSiteSettings["channels"]]}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    channels: {
                      ...settings.channels,
                      [key]: event.target.value
                    }
                  })
                }
                className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition focus:border-gold"
              />
            </label>
          ))}
        </div>
      </article>

      <article className="border border-white/10 bg-charcoal p-5 sm:p-6">
        <h2 className="text-xl font-black uppercase text-white">Account</h2>
        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/50">
              Display name
            </span>
            <input
              value={settings.channels.displayName}
              onChange={(event) =>
                onChange({
                  ...settings,
                  channels: {
                    ...settings.channels,
                    displayName: event.target.value
                  }
                })
              }
              className="mt-3 w-full border border-white/10 bg-ink px-4 py-4 text-sm text-white outline-none transition focus:border-gold"
            />
          </label>

          <div className="border border-white/10 bg-ink px-4 py-4 text-sm text-white/50">
            Admin login email still comes from <span className="text-gold">.env</span>.
          </div>
        </div>

        {notice ? (
          <p className="mt-5 border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 bg-white px-5 py-4 text-[0.7rem] font-black uppercase tracking-[0.22em] text-ink transition hover:bg-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? "Saving Settings" : "Save Settings"}
        </button>
      </article>
    </form>
  );
}
