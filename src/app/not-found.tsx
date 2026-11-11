import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-display text-7xl font-bold text-wood-400">404</p>
      <h1 className="mt-4 text-3xl">Essa peça não está na lista de corte</h1>
      <p className="mt-2 text-bark-700">A página que você procurou não existe ou mudou de lugar.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn-dark">
          Página inicial
        </Link>
        <Link href="/catalogo/" className="btn-cta">
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
