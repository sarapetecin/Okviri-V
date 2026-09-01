import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type StatusDokumenta =
  Database["public"]["Enums"]["status_prodajnega_dokumenta"];

const naziviStatusov: Record<StatusDokumenta, string> = {
  osnutek: "Osnutek",
  poslano_v_pregled: "Poslano v pregled",
  zavrnjeno: "Zavrnjeno",
  potrjeno: "Potrjeno",
  v_izdelavi: "V izdelavi",
  dokoncano: "Dokončano",
  rocno_zaprto: "Ročno zaprto",
  preklicano: "Preklicano",
};

function oblikujDatum(datum: string) {
  return new Intl.DateTimeFormat("sl-SI").format(
    new Date(`${datum}T00:00:00`),
  );
}

function oblikujZnesek(znesek: number) {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
  }).format(znesek);
}

type DokumentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DokumentPage({
  params,
}: DokumentPageProps) {
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

  const { data: dokument, error: napakaDokumenta } = await supabase
    .from("narocilo")
    .select(
      "id, datum_sprejema, rok_izdelave, stranka_naziv, stranka_telefonska_stevilka, stranka_email, stranka_hisni_naslov, vrsta, status, popust, skupni_znesek, izdal_ime",
    )
    .eq("id", dokumentId)
    .maybeSingle();

  if (napakaDokumenta || !dokument) {
    notFound();
  }

  const { data: postavke, error: napakaPostavk } = await supabase
    .from("narocilo_postavka")
    .select(
      "id, kolicina, dolzina, sirina, opis_slike, ogledalo, cena_postavke, vrstni_red",
    )
    .eq("narocilo_id", dokumentId)
    .order("vrstni_red");

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {dokument.vrsta === "ponudba" ? "Ponudba" : "Naročilo"} #
              {dokument.id}
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              {dokument.stranka_naziv}
            </h1>
          </div>

          <Link
            href="/dokumenti"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Nazaj na dokumente
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Dokument
            </h2>

            <dl className="mt-5 space-y-3">
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-slate-600">Status</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {naziviStatusov[dokument.status]}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-sm text-slate-600">Datum sprejema</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {oblikujDatum(dokument.datum_sprejema)}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-sm text-slate-600">Rok izdelave</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {dokument.rok_izdelave
                    ? oblikujDatum(dokument.rok_izdelave)
                    : "—"}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-sm text-slate-600">Izdal</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {dokument.izdal_ime}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Stranka
            </h2>

            <div className="mt-5 space-y-2 text-sm">
              <p className="font-semibold text-slate-900">
                {dokument.stranka_naziv}
              </p>
              <p className="text-slate-600">
                {dokument.stranka_telefonska_stevilka ?? "Brez telefona"}
              </p>
              <p className="text-slate-600">
                {dokument.stranka_email ?? "Brez e-pošte"}
              </p>
              <p className="text-slate-600">
                {dokument.stranka_hisni_naslov ?? "Brez naslova"}
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Skupaj
            </h2>

            <p className="mt-5 text-3xl font-bold text-slate-900">
              {oblikujZnesek(dokument.skupni_znesek)}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Popust: {dokument.popust} %
            </p>
          </article>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Postavke
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Slike, dimenzije in izbrani materiali.
              </p>
            </div>

            <Link
              href={`/dokumenti/${dokument.id}/postavke/nova`}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-slate-700"
            >
              Nova postavka
            </Link>
          </div>

          {napakaPostavk ? (
            <div className="p-6 text-red-700">
              Postavk ni bilo mogoče naložiti.
            </div>
          ) : postavke.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="font-semibold text-slate-900">
                Dokument še nima postavk
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Dodaj prvo sliko in njene dimenzije.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                      #
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                      Opis
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                      Dimenzije
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                      Količina
                    </th>
                    <th className="px-5 py-3 text-right text-sm font-semibold text-slate-700">
                      Cena
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {postavke.map((postavka) => (
                    <tr key={postavka.id}>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {postavka.vrstni_red}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-900">
                        {postavka.opis_slike ??
                          (postavka.ogledalo ? "Ogledalo" : "Slika")}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {postavka.dolzina} × {postavka.sirina}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {postavka.kolicina}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                        {oblikujZnesek(postavka.cena_postavke)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}