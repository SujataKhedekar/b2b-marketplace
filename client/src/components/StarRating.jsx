// Display-only or interactive star rating.
// Pass `onChange` to make it interactive (for the review form).
export default function StarRating({ value = 0, onChange, size = 'text-xl' }) {
  const interactive = typeof onChange === 'function';
  return (
    <div className={`inline-flex ${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          role={interactive ? 'button' : undefined}
          onClick={interactive ? () => onChange(n) : undefined}
          className={`${interactive ? 'cursor-pointer' : ''} ${
            n <= Math.round(value) ? 'text-yellow-400' : 'text-gray-300'
          }`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
