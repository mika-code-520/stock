import { loginAction } from "@/actions/auth.actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return <LoginForm searchParams={searchParams} />;
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-neutral-900">
          Control de Stock
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          Ingresá con tu email y contraseña
        </p>
        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            Email o contraseña incorrectos.
          </p>
        )}
        <form action={loginAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
