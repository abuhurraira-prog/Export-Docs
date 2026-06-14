export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">ExportDocs</h1>
      <p className="text-xl text-gray-600 mb-8">Export Documentation Software for Pakistani Exporters</p>
      <div className="flex gap-4">
        <a href="/dashboard/shipments" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Go to Dashboard
        </a>
      </div>
    </main>
  )
}
