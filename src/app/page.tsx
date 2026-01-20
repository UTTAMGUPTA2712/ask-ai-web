import Chat from "@/components/Chat";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Ask AI
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Intelligent conversations at the speed of thought.
          </p>
        </div>

        <Chat />

        <footer className="text-center text-xs text-zinc-400 dark:text-zinc-600 pb-4">
          Built with Next.js, Tailwind CSS 4, and Groq SDK.
        </footer>
      </div>
    </div>
  );
}
