interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow border border-gray-200 ${
        hover ? 'hover:shadow-md hover:border-wfd-crimson/30 hover:-translate-y-1 transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
