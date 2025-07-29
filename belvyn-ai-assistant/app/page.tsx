export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Belvyn AI Widget</h1>
        <p className="text-gray-600 mb-8">
          This is the widget application. The chat widget will be embedded on your website.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold mb-2">Widget Endpoints:</h2>
          <ul className="text-left space-y-2 text-sm">
            <li>
              <strong>/widget</strong> - Chat interface
            </li>
            <li>
              <strong>/embed.js</strong> - Embed script
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
