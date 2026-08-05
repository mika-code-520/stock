import Link from "next/link";

export default function VendedorHome() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-neutral-900">Mostrador</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card href="/vendedor/venta" title="Registrar venta" />
        <Card href="/vendedor/pedido-reposicion" title="Pedir reposición de stock" />
        <Card href="/vendedor/mis-movimientos" title="Ver mis movimientos" />
      </div>
    </div>
  );
}

function Card({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-neutral-200 bg-white shadow-sm p-6 text-center font-medium text-neutral-800 hover:border-neutral-400"
    >
      {title}
    </Link>
  );
}
