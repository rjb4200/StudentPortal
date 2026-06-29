'use client';

interface CopyButtonProps {
  text: string;
  label: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="text-xs px-3 py-1 rounded-full bg-wfd-charcoal/10 text-wfd-charcoal hover:bg-wfd-charcoal/20 transition-colors print:hidden"
    >
      {label}
    </button>
  );
}
