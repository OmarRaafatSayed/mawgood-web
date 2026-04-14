interface IconProps {
  color?: string;
  size?: number;
  className?: string;
}

export function VTonIcon({
  color = '#090909',
  size = 24,
  className = '',
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 2L4 6L6 8L8 6V22H16V6L18 8L20 6L16 2H8Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8V12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1" fill={color} />
    </svg>
  );
}
