import { prijava } from "./actions";

type PrijavaPageProps = {
  searchParams: Promise<{
    napaka?: string;
  }>;
};

export default async function PrijavaPage({
  searchParams,
}: PrijavaPageProps) {
  const { napaka } = await searchParams;

  const sporociloNapake =
    napaka === "napacna-prijava"
      ? "E-poštni naslov ali geslo ni pravilno."
      : napaka === "manjkajoci-podatki"
        ? "Vnesi e-poštni naslov in geslo."
        : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Okviri V
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Prijava
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Prijavi se za dostop do sistema naročil.
          </p>
        </div>

        {sporociloNapake && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {sporociloNapake}
          </div>
        )}

        <form action={prijava} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              E-poštni naslov
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="geslo"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Geslo
            </label>

            <input
              id="geslo"
              name="geslo"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Prijava
          </button>
        </form>
      </section>
    </main>
  );
}