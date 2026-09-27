export function friendlyError(error) {
  return (
    error?.normalized?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}
