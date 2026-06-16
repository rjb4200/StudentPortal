type BadgeVariant = 'crimson' | 'charcoal' | 'gold' | 'green' | 'red' | 'blue' | 'orange' | 'gray';

const variantStyles: Record<BadgeVariant, string> = {
  crimson: 'bg-wfd-crimson text-white',
  charcoal: 'bg-wfd-charcoal text-white',
  gold: 'bg-wfd-gold text-wfd-charcoal',
  green: 'bg-wfd-sage/15 text-wfd-sage',
  red: 'bg-wfd-crimson/15 text-wfd-crimson',
  blue: 'bg-wfd-charcoal/10 text-wfd-charcoal',
  orange: 'bg-wfd-gold/15 text-wfd-gold',
  gray: 'bg-gray-100 text-gray-800',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
