type Props = {
  className?: string;
};

export function HandWaving({ className = "h-4 w-4" }: Props) {
  return (
    <svg
      className={className}
      fill="currentColor"
      height="192"
      viewBox="0 0 256 256"
      width="192"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="256" height="256" fill="none"></rect>

      <path
        d="M94,61.4a20,20,0,0,1,34.6-20l30,51.9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      ></path>

      <path
        d="M67.4,95.2l-16-27.7A20,20,0,0,1,86,47.5l34,58.9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      ></path>

      <path
        d="M154,165.3a39.9,39.9,0,0,1,14.6-54.6l-10-17.4a20,20,0,0,1,34.7-20l20,34.7A80,80,0,0,1,74.7,188l-42-72.8a20,20,0,0,1,34.7-20l22,38.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      ></path>

      <path
        d="M81.1,240A110.3,110.3,0,0,1,48,204"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      ></path>

      <path
        d="M176,31a51.7,51.7,0,0,1,45,26"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      ></path>
    </svg>
  );
}
