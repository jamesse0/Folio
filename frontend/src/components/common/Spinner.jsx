export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4 border', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-2' }
  return (
    <div className={`animate-spin rounded-full border-gray-600 border-t-white ${sizes[size]}`} />
  )
}