type StarProps = {
  className?: string;
  width?: number | string;
  height?: number | string;
};

export function Star({ className, width = 24, height = 24 }: StarProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden>
      <path d="M12 2 14.4 9.1 22 9.4l-6 4.8 2.2 7.2-6.2-4.4-6.2 4.4L8 14.2 2 9.4 9.6 9.1z" />
    </svg>
  );
}
