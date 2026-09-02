import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { dodajOkvir } from "./actions";
import { IzbiraOkvirja } from "./izbira-okvirja";

type IzbiraOkvirjaPageProps = {
  params: Promise<{
    id: string;
    postavkaId: string;
  }>;

  searchParams: Promise<{
    napaka?: string;
  }>;
};

export default async function IzbiraOkvirjaPage({
  params,
  searchParams,
}: IzbiraOkvirjaPageProps) {
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
    .select("id, narocilo_id, opis_slike, dolzina, sirina, kolicina")
    .eq("id", postavkaIdStevilka)
    .eq("narocilo_id", dokumentId)
    .maybeSingle();

  if (!postavka) {
    notFound();
  }

  const { data: okvirji, error: napakaOkvirjev } = await supabase
    .from("okvir")
    .select(
      `
        id,
        oznaka,
        vzorec,
        sirina,
        prodajna_cena,
        barva!okvir_barva_id_fkey(naziv),
        dobavitelj!okvir_dobavitelj_id_fkey(naziv)
      `,
    )
    .eq("na_prodaj", true)
    .order("oznaka");

  const { napaka } = await searchParams;

  const sporociloNapake =
    napaka === "neveljavni-podatki"
      ? "Izberi veljaven okvir."
      : napaka === "manjka-sirina"
        ? "Izbrani okvir nima vnesene širine."
        : napaka === "shranjevanje"
          ? "Okvirja ni bilo mogoče dodati."
          : null;

  const shraniOkvir = dodajOkvir.bind(
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
              Izbira okvirja
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
              Izberi okvir
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Cena se bo izračunala iz dimenzij postavke, širine okvirja in cene na tekoči meter.
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

          {napakaOkvirjev ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              Okvirjev ni bilo mogoče naložiti.
            </div>
          ) : okvirji.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-medium text-slate-900">
                Na voljo ni nobenega okvirja.
              </p>
            </div>
          ) : (
            <form action={shraniOkvir}>
              <IzbiraOkvirja okvirji={okvirji} />
            </form>
          )}
        </div>
      </section>
    </main>
  );
}