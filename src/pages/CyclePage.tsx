import { useParams } from 'react-router-dom'

export default function CyclePage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">サイクル #{id}</h1>
      <p className="text-gray-500">Plan / Do / Check / Act（準備中）</p>
    </div>
  )
}
