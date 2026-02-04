interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Loading' }: LoadingProps) {
  return (
    <div className="loading-container">
      <div className="loading-text blink">{message}...</div>
    </div>
  );
}
