import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { dodajSteklo } from "./actions";

type IzbiraSteklaPageProps = {
  params: Promise<{
    id: string;
    postavkaId: string;
  }>;

  searchParams: Promise<{
    napaka?: string;
  }>;
};

function oblikujZnesek(znesek: number) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
  }).format(znesek);
}

export default async function IzbiraSteklaPage({
  params,
  searchParams,
}: IzbiraSteklaPageProps) {
  const { id, postavkaId } = await params;

  const dokumentId = Number(id);
  const postavkaIdStevilka = Number(postavkaId);

  if (
    !Number.isInteger(dokumentId) ||
    dokumentId <= 0 ||
    !Number.isInteger(postavkaIdStevilka) ||
    postavkaIdStevilka <= 0
  ) {
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

  const { data: postavka } = await supabase
    .from("narocilo_postavka")
    .select("id, opis_slike, dolzina, sirina, kolicina")
    .eq("id", postavkaIdStevilka)
    .eq("narocilo_id", dokumentId)
    .maybeSingle();

  if (!postavka) {
    notFound();
  }

  const { data: obstojeceSteklo } = await supabase
    .from("postavka_steklo")
    .select("id, naziv")
    .eq("postavka_id", postavka.id)
    .maybeSingle();

  const { data: stekla, error: napakaStekel } = await supabase
    .from("steklo")
    .select(
      `
        id,
        naziv,
        oznaka,
        prodajna_cena,
        dobavitelj!steklo_dobavitelj_id_fkey(naziv)
      `,
    )
    .eq("na_prodaj", true)
    .order("prodajna_cena");

  const { napaka } = await searchParams;

  const sporociloNapake =
    napaka === "neveljavni-podatki"
      ? "Izberi veljavno steklo."
      : napaka === "steklo-ze-obstaja"
        ? "Postavka že ima izbrano steklo."
        : napaka === "shranjevanje"
          ? "Stekla ni bilo mogoče dodati."
          : null;

  const shraniSteklo = dodajSteklo.bind(
    null,
    dokumentId,
    postavkaIdStevilka,
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {dokument.vrsta === "ponudba" ? "Ponudba" : "Naročilo"} #
              {dokument.id}
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Izbira stekla
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

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Postavka
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {postavka.opis_slike ?? "Slika"}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {postavka.dolzina} × {postavka.sirina} cm
            {" · "}
            Količina: {postavka.kolicina}
            {" · "}
            Stranka: {dokument.stranka_naziv}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Izberi steklo
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Cena je izračunana glede na površino, ceno na m² in količino.
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

          {obstojeceSteklo ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
              Postavka že vsebuje steklo:{" "}
              <strong>{obstojeceSteklo.naziv}</strong>. Najprej ga odstrani na
              strani dokumenta.
            </div>
          ) : napakaStekel ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              Stekel ni bilo mogoče naložiti.
            </div>
          ) : stekla.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              Na voljo ni nobenega stekla.
            </div>
          ) : (
            <form action={shraniSteklo} className="space-y-6">
              <fieldset className="grid gap-3 sm:grid-cols-2">
                <legend className="sr-only">Vrsta stekla</legend>

                {stekla.map((steklo) => {
                  const cena =
                    (postavka.dolzina / 100) *
                    (postavka.sirina / 100) *
                    steklo.prodajna_cena *
                    postavka.kolicina;

                  return (
                    <label
                      key={steklo.id}
                      className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="stekloId"
                        value={steklo.id}
                        required
                        className="mt-1 h-4 w-4"
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-900">
                          {steklo.naziv}
                        </span>

                        <span className="mt-1 block text-sm text-slate-600">
                          {steklo.oznaka}
                          {" · "}
                          {steklo.dobavitelj?.naziv ?? "Brez dobavitelja"}
                        </span>

                        <span className="mt-2 block text-sm font-semibold text-slate-900">
                          {oblikujZnesek(cena)}
                        </span>

                        <span className="block text-xs text-slate-500">
                          {oblikujZnesek(steklo.prodajna_cena)} / m²
                        </span>
                      </span>
                    </label>
                  );
                })}
              </fieldset>

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
                  Dodaj steklo
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}