import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { dodajPaspartu } from "./actions";
import { IzbiraPaspartuja } from "./izbira-paspartuja";

type IzbiraPaspartujaPageProps = {
  params: Promise<{
    id: string;
    postavkaId: string;
  }>;

  searchParams: Promise<{
    napaka?: string;
  }>;
};

export default async function IzbiraPaspartujaPage({
  params,
  searchParams,
}: IzbiraPaspartujaPageProps) {
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

  const { data: paspartuji, error: napakaPaspartujev } =
    await supabase
      .from("paspartu")
      .select(
        `
          id,
          oznaka,
          naziv,
          barva,
          dodatni_opis,
          prodajna_cena,
          dobavitelj!paspartu_dobavitelj_id_fkey(naziv)
        `,
      )
      .eq("na_prodaj", true)
      .order("oznaka");

  const { napaka } = await searchParams;

  const sporociloNapake =
    napaka === "neveljavni-podatki"
      ? "Izberi veljaven paspartu."
      : napaka === "shranjevanje"
        ? "Paspartuja ni bilo mogoče dodati."
        : null;

  const shraniPaspartu = dodajPaspartu.bind(
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
              Izbira paspartuja
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
            Zunanja mera: {postavka.dolzina} × {postavka.sirina} cm
            {" · "}
            Količina: {postavka.kolicina}
            {" · "}
            Stranka: {dokument.stranka_naziv}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Izberi paspartu
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Cena se izračuna iz zunanje mere, cene na m² in količine.
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

          {napakaPaspartujev ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              Paspartujev ni bilo mogoče naložiti.
            </div>
          ) : paspartuji.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              Na voljo ni nobenega paspartuja.
            </div>
          ) : (
            <form action={shraniPaspartu}>
              <IzbiraPaspartuja
                paspartuji={paspartuji}
                dolzina={postavka.dolzina}
                sirina={postavka.sirina}
                kolicina={postavka.kolicina}
              />
            </form>
          )}
        </div>
      </section>
    </main>
  );
}