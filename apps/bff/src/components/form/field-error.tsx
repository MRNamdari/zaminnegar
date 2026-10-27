/** Shows the first validation message of a field (standard-schema issues or plain strings). */
export function FieldError({ errors }: { errors: unknown[] }) {
  const first = errors.find(Boolean);
  const message = typeof first === 'string' ? first : (first as { message?: string } | undefined)?.message;
  return message ? (
    <p role="alert" className="text-xs text-danger">
      {message}
    </p>
  ) : null;
}
