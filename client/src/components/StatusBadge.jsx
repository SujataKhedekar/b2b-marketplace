const COLORS = {
  open: 'bg-green-100 text-green-700',
  negotiating: 'bg-yellow-100 text-yellow-700',
  awarded: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-200 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-700',
  accepted: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-teal-100 text-teal-700',
  completed: 'bg-green-100 text-green-700',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${COLORS[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}
