import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortfolioView from "@/components/portfolio/portfolio-view";
import type { Certification, Education, Experience, Organization, Profile, Project, Skill } from "@/types/db";

export const metadata = { title: "Preview Website" };

export default async function PreviewPage({ searchParams }: { searchParams: Promise<{ embed?: string }> }) {
  const { embed } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [pr, ex, ed, sk, ce, og, pj] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("experiences").select("*").order("start_date", { ascending: false, nullsFirst: true }),
    supabase.from("educations").select("*").order("end_year", { ascending: false, nullsFirst: true }),
    supabase.from("skills").select("*").order("created_at"),
    supabase.from("certifications").select("*").order("issued_at", { ascending: false, nullsFirst: true }),
    supabase.from("organizations").select("*").order("start_year", { ascending: false, nullsFirst: true }),
    supabase.from("projects").select("*").order("year", { ascending: false, nullsFirst: true }),
  ]);

  return (
    <PortfolioView
      embed={embed === "1"}
      data={{
        profile: pr.data as Profile | null,
        experiences: (ex.data ?? []) as Experience[],
        educations: (ed.data ?? []) as Education[],
        skills: (sk.data ?? []) as Skill[],
        certifications: (ce.data ?? []) as Certification[],
        organizations: (og.data ?? []) as Organization[],
        projects: (pj.data ?? []) as Project[],
      }}
    />
  );
}