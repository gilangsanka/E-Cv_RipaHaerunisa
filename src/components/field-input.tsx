import type { Field } from "@/config/resources";
import ImageUpload from "@/components/image-upload";

export default function FieldInput({ field, value }: { field: Field; value?: string | number | null }) {
  if (field.type === "image") {
    return (
      <div className="sm:col-span-2">
        <ImageUpload name={field.name} label={field.label} folder={field.folder ?? "images"} defaultValue={value == null ? null : String(value)} />
      </div>
    );
  }

  const common = { name: field.name, required: field.required, defaultValue: value ?? "", className: "input mt-1" };
  return (
    <label className={`block text-sm font-medium ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
      {field.label}
      {field.type === "textarea" ? (
        <textarea {...common} rows={4} />
      ) : field.type === "select" ? (
        <select {...common}>
          <option value="">Pilih…</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input {...common} type={field.type === "url" ? "url" : field.type} />
      )}
    </label>
  );
}
