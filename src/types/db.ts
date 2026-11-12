export type Profile = {
  id: string; full_name: string | null; headline: string | null; email: string | null; phone: string | null;
  location: string | null; linkedin: string | null; portfolio: string | null; github: string | null; behance: string | null;
  summary: string | null; avatar_url: string | null; open_to_work: boolean; updated_at: string | null;
};
export type Experience = { id: string; position: string; company: string; type: string | null; location: string | null; start_date: string | null; end_date: string | null; description: string | null; created_at: string };
export type Education = { id: string; institution: string; degree: string | null; field: string | null; start_year: number | null; end_year: number | null; gpa: string | null; created_at: string };
export type Skill = { id: string; name: string; category: string | null; level: number | null; created_at: string };
export type Certification = { id: string; title: string; issuer: string | null; category: string | null; issued_at: string | null; expires_at: string | null; credential_id: string | null; credential_url: string | null; image_url: string | null; created_at: string };
export type Organization = { id: string; name: string; role: string | null; start_year: number | null; end_year: number | null; description: string | null; created_at: string };
export type Project = { id: string; title: string; category: string | null; role: string | null; year: number | null; tech_stack: string | null; description: string | null; image_url: string | null; demo_url: string | null; repo_url: string | null; created_at: string };
