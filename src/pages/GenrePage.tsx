import { useParams } from 'react-router-dom'

export default function GenrePage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ジャンル #{id}</h1>
      <p className="text-gray-500">サイクル一覧（準備中）</p>
    </div>
  )
}
