import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ustvariStranko } from "./actions";

type NovaStrankaPageProps = {
  searchParams: Promise<{
    napaka?: string;
  }>;
};

export default async function NovaStrankaPage({
  searchParams,
}: NovaStrankaPageProps) {
  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const { napaka } = await searchParams;

  const sporociloNapake =
    napaka === "neveljavni-podatki"
      ? "Preveri vnesene podatke. Naziv je obvezen, e-poštni naslov pa mora biti veljaven."
      : napaka === "shranjevanje"
        ? "Stranke ni bilo mogoče shraniti. Poskusi ponovno."
        : null;

  const inputClassName =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Okviri V
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Nova stranka
            </h1>
          </div>

          <Link
            href="/stranke"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Prekliči
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Podatki stranke
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Polja, označena z zvezdico, so obvezna.
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

          <form action={ustvariStranko} className="space-y-6">
            <div>
              <label
                htmlFor="naziv"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Naziv stranke *
              </label>
              <input
                id="naziv"
                name="naziv"
                type="text"
                required
                maxLength={200}
                autoFocus
                className={inputClassName}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="telefonskaStevilka"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Telefonska številka
                </label>
                <input
                  id="telefonskaStevilka"
                  name="telefonskaStevilka"
                  type="tel"
                  autoComplete="tel"
                  className={inputClassName}
                />
              </div>

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
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="hisniNaslov"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Naslov
              </label>
              <input
                id="hisniNaslov"
                name="hisniNaslov"
                type="text"
                autoComplete="street-address"
                className={inputClassName}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  name="davcniZavezanec"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-800">
                  Stranka je davčni zavezanec
                </span>
              </label>

              <div className="mt-5">
                <label
                  htmlFor="davcnaStevilka"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Davčna številka
                </label>
                <input
                  id="davcnaStevilka"
                  name="davcnaStevilka"
                  type="text"
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
              <Link
                href="/stranke"
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Prekliči
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Shrani stranko
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}