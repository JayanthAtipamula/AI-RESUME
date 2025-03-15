import React from 'react';

export default function Diamond(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.7 10.3l8.3-8.3c.4-.4 1-.4 1.4 0l8.3 8.3c.4.4.4 1 0 1.4l-8.3 8.3c-.4.4-1 .4-1.4 0l-8.3-8.3c-.4-.4-.4-1 0-1.4z" />
    </svg>
  );
}
