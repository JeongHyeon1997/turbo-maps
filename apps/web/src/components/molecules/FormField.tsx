export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}

/** Label + control (usually `TextField`) + optional hint, wrapped as one `<label>`. */
export function FormField({ label, htmlFor, hint, children }: FormFieldProps) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      {children}
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </label>
  );
}
