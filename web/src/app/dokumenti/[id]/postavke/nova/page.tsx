import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ustvariPostavko } from "./actions";

type NovaPostavkaPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    napaka?: string;
  }>;
};

export default async function NovaPostavkaPage({
  params,
  searchParams,
}: NovaPostavkaPageProps) {
  const { id } = await params;
  const dokumentId = Number(id);

  if (!Number.isInteger(dokumentId) || dokumentId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const { data: dokument } = await supabase
    .from("narocilo")
    .select("id, vrsta, stranka_naziv")
    .eq("id", dokumentId)
    .maybeSingle();

  if (!dokument) {
    notFound();
  }

  const { napaka } = await searchParams;

  const sporociloNapake =
    napaka === "neveljavni-podatki"
      ? "Preveri količino in dimenzije postavke."
      : napaka === "shranjevanje"
        ? "Postavke ni bilo mogoče shraniti."
        : null;

  const shraniPostavko = ustvariPostavko.bind(null, dokumentId);

  const inputClassName =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {dokument.vrsta === "ponudba" ? "Ponudba" : "Naročilo"} #
              {dokument.id}
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Nova postavka
            </h1>
          </div>

          <Link
            href={`/dokumenti/${dokument.id}`}
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
              Slika in dimenzije
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Stranka: {dokument.stranka_naziv}. Dimenzije vnesi v centimetrih.
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

          <form action={shraniPostavko} className="space-y-6">
            <div>
              <label
                htmlFor="opisSlike"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Opis slike
              </label>
              <input
                id="opisSlike"
                name="opisSlike"
                type="text"
                placeholder="Na primer: družinska fotografija"
                className={inputClassName}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="dolzina"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Dolžina (cm) *
                </label>
                <input
                  id="dolzina"
                  name="dolzina"
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="sirina"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Širina (cm) *
                </label>
                <input
                  id="sirina"
                  name="sirina"
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="kolicina"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Količina *
                </label>
                <input
                  id="kolicina"
                  name="kolicina"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  defaultValue="1"
                  required
                  className={inputClassName}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <input
                name="ogledalo"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  Postavka je ogledalo
                </span>
                <span className="block text-sm text-slate-600">
                  Uporabi, kadar se namesto slike okvirja ogledalo.
                </span>
              </span>
            </label>

            <div>
              <label
                htmlFor="opombe"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Opombe
              </label>
              <textarea
                id="opombe"
                name="opombe"
                rows={4}
                className={inputClassName}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
              <Link
                href={`/dokumenti/${dokument.id}`}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Prekliči
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700"
              >
                Shrani postavko
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}