type BadgeVariant = 'crimson' | 'charcoal' | 'gold' | 'green' | 'red' | 'blue' | 'orange' | 'gray';

const variantStyles: Record<BadgeVariant, string> = {
  crimson: 'bg-wfd-crimson text-white',
  charcoal: 'bg-wfd-charcoal text-white',
  gold: 'bg-yellow-500 text-wfd-charcoal',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  orange: 'bg-orange-100 text-orange-800',
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
