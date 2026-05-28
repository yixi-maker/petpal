interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-medium text-ink-muted mb-1.5">{label}</label>
      )}
      <input
        className={`w-full px-3.5 py-2.5 text-[15px] text-ink bg-surface-white border border-border
          rounded-[8px] placeholder:text-ink-faded/60
          focus:outline-none focus:ring-2 focus:ring-teal-500/15 focus:border-teal-400
          transition duration-150
          ${error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-[12px] text-rose-500">{error}</p>}
    </div>
  );
}
