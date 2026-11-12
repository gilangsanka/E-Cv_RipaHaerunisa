export type FieldType = "text" | "textarea" | "date" | "number" | "select" | "url" | "image";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  list?: boolean; // tampil sebagai kolom di tabel
  folder?: string; // khusus type "image": subfolder di storage
};

export type Resource = {
  key: string; // dipakai di URL: /admin/[key]
  table: string;
  title: string;
  subtitle: string;
  addLabel: string;
  fields: Field[];
  orderBy: string;
};

export const RESOURCES: Resource[] = [
  {
    key: "pengalaman",
    table: "experiences",
    title: "Pengalaman Kerja",
    subtitle: "Kelola riwayat pekerjaan, magang, dan freelance Anda.",
    addLabel: "Tambah Pengalaman",
    orderBy: "start_date",
    fields: [
      { name: "position", label: "Posisi", type: "text", required: true, list: true },
      { name: "company", label: "Perusahaan", type: "text", required: true, list: true },
      { name: "type", label: "Tipe", type: "select", options: ["Full-time", "Part-time", "Kontrak", "Freelance", "Magang"], list: true },
      { name: "start_date", label: "Mulai", type: "date", list: true },
      { name: "end_date", label: "Selesai (kosongkan jika masih bekerja)", type: "date", list: true },
      { name: "location", label: "Lokasi", type: "text" },
      { name: "description", label: "Deskripsi tugas & pencapaian", type: "textarea" },
    ],
  },
  {
    key: "proyek",
    table: "projects",
    title: "Proyek & Portofolio",
    subtitle: "Kelola proyek yang pernah Anda kerjakan. Tampil di bagian Proyek pada website portofolio.",
    addLabel: "Tambah Proyek",
    orderBy: "year",
    fields: [
      { name: "title", label: "Nama Proyek", type: "text", required: true, list: true },
      { name: "image_url", label: "Gambar proyek", type: "image", folder: "projects", list: true },
      { name: "category", label: "Kategori", type: "select", options: ["Web App", "Mobile App", "UI/UX Design", "Branding", "Konten Digital", "Lainnya"], list: true },
      { name: "role", label: "Peran Anda", type: "text", list: true },
      { name: "year", label: "Tahun", type: "number", list: true },
      { name: "tech_stack", label: "Teknologi / Tools (pisahkan dengan koma)", type: "text", list: true },
      { name: "description", label: "Deskripsi proyek", type: "textarea" },
      { name: "demo_url", label: "URL demo / live", type: "url" },
      { name: "repo_url", label: "URL repositori / studi kasus", type: "url" },
    ],
  },
  {
    key: "pendidikan",
    table: "educations",
    title: "Riwayat Pendidikan",
    subtitle: "Kelola riwayat pendidikan formal Anda.",
    addLabel: "Tambah Pendidikan",
    orderBy: "end_year",
    fields: [
      { name: "institution", label: "Institusi", type: "text", required: true, list: true },
      { name: "degree", label: "Jenjang", type: "select", options: ["SMA/SMK", "D3", "S1", "S2", "S3"], list: true },
      { name: "field", label: "Jurusan", type: "text", list: true },
      { name: "start_year", label: "Tahun Masuk", type: "number", list: true },
      { name: "end_year", label: "Tahun Lulus", type: "number", list: true },
      { name: "gpa", label: "IPK / Nilai", type: "text", list: true },
    ],
  },
  {
    key: "keahlian",
    table: "skills",
    title: "Keahlian",
    subtitle: "Kelola hard skill, soft skill, dan kemampuan bahasa Anda.",
    addLabel: "Tambah Keahlian",
    orderBy: "created_at",
    fields: [
      { name: "name", label: "Nama Keahlian", type: "text", required: true, list: true },
      { name: "category", label: "Kategori", type: "select", options: ["Hard Skills", "Soft Skills", "Bahasa"], list: true },
      { name: "level", label: "Tingkat (0-100)", type: "number", list: true },
    ],
  },
  {
    key: "sertifikasi",
    table: "certifications",
    title: "Sertifikasi & Prestasi",
    subtitle: "Kelola sertifikat, pelatihan, dan prestasi Anda.",
    addLabel: "Tambah Sertifikasi",
    orderBy: "issued_at",
    fields: [
      { name: "title", label: "Judul", type: "text", required: true, list: true },
      { name: "image_url", label: "Gambar sertifikat", type: "image", folder: "certificates", list: true },
      { name: "issuer", label: "Penerbit", type: "text", list: true },
      { name: "category", label: "Kategori", type: "select", options: ["Sertifikasi", "Pelatihan", "Prestasi"], list: true },
      { name: "issued_at", label: "Tanggal Terbit", type: "date", list: true },
      { name: "expires_at", label: "Kedaluwarsa", type: "date" },
      { name: "credential_id", label: "ID Kredensial", type: "text" },
      { name: "credential_url", label: "URL Kredensial", type: "url" },
    ],
  },
  {
    key: "organisasi",
    table: "organizations",
    title: "Organisasi & Relawan",
    subtitle: "Kelola pengalaman organisasi dan kegiatan sukarela.",
    addLabel: "Tambah Organisasi",
    orderBy: "start_year",
    fields: [
      { name: "name", label: "Nama Organisasi", type: "text", required: true, list: true },
      { name: "role", label: "Jabatan", type: "text", list: true },
      { name: "start_year", label: "Tahun Mulai", type: "number", list: true },
      { name: "end_year", label: "Tahun Selesai", type: "number", list: true },
      { name: "description", label: "Deskripsi", type: "textarea" },
    ],
  },
];

export const getResource = (key: string) => RESOURCES.find((r) => r.key === key);
