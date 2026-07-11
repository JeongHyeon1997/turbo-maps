type SingleLineProps = React.InputHTMLAttributes<HTMLInputElement> & { multiline?: false };
type MultilineProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

export type TextFieldProps = SingleLineProps | MultilineProps;

const shared =
  'w-full rounded-lg border border-border bg-surface px-4 text-sm text-text-primary outline-none transition-all duration-200 ease-out placeholder:text-input-placeholder focus:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60';

/**
 * Single-line input (52~56 height) or, with `multiline`, a textarea — the
 * repeated `logs/new` input markup absorbed into one atom (DESIGN.md
 * "TextField — atom 신설"). Renders a plain `<input>`/`<textarea>`, so every
 * native prop (value/onChange/placeholder/type/rows/…) just passes through.
 */
export function TextField(props: TextFieldProps) {
  if (props.multiline) {
    const { multiline, className = '', rows = 3, ...rest } = props;
    return <textarea rows={rows} className={`${shared} py-3 ${className}`} {...rest} />;
  }
  const { multiline, className = '', ...rest } = props;
  return <input className={`${shared} h-14 ${className}`} {...rest} />;
}
