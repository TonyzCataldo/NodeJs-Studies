import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="font-bold text-xl tracking-tight">
          Tático<span className="text-blue-500">Questões</span>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/login" className="hover:text-blue-500 transition-colors">
            Entrar
          </Link>
          <Link
            href="/register"
            className="hover:text-blue-500 transition-colors"
          >
            Cadastrar
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-2xl space-y-8">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl mb-4">
            A forma inteligente de <br />
            <span className="text-blue-500">estudar para vencer.</span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Uma plataforma simples para organizar seus cadernos, criar tópicos
            de estudo e testar seus conhecimentos com métricas reais. Sem
            distrações.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register" className="btn btn-primary">
              Começar Agora &rarr;
            </Link>
            <Link href="/login" className="btn btn-outline">
              Acessar minha conta
            </Link>
          </div>
        </div>

        {/* Minimal Features List */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl text-left">
          <div className="space-y-2">
            <h3 className="font-bold text-lg">📁 Organização</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Crie cadernos personalizados e mantenha seus tópicos sempre
              organizados.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg">⚡ Foco Total</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Interface limpa projetada para evitar distrações e maximizar seu
              tempo.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg">📊 Desempenho</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Saiba exatamente onde você precisa melhorar com feedbacks
              instantâneos.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        © 2026 Tático Questões
      </footer>
    </div>
  );
}
