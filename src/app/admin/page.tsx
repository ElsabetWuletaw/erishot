import type { Metadata } from "next";
import { AdminPortal } from "@/frontend/components/admin-portal";

export const metadata: Metadata = {
  title: "Admin | ERISHOT",
  description: "ERISHOT admin portal for managing media, projects, messages, and homepage content."
};

export default function AdminPage() {
  return <AdminPortal />;
}
