export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="flex-1 p-4 space-y-4">
        <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}