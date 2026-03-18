export default function Card({
  title,
  value
}: {
  title: string
  value: number
}) {
  return (
    <div className="border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-semibold">
        €{value.toFixed(2)}
      </div>
    </div>
  )
}