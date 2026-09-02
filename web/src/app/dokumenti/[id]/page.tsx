import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import {
  odstraniOkvir,
  odstraniPaspartu,
  odstraniSteklo,
  dodajPodokvir,
  odstraniPodokvir,
  odstraniDodatnoDelo,
  spremeniStatusDokumenta,
} from "./actions";
import { GumbOdstraniOkvir } from "./gumb-odstrani-okvir";
import { GumbOdstraniSteklo } from "./gumb-odstrani-steklo";
import { GumbOdstraniPaspartu } from "./gumb-odstrani-paspartu";
import { GumbOdstraniPodokvir } from "./gumb-odstrani-podokvir";
import { GumbOdstraniDodatnoDelo } from "./gumb-odstrani-dodatno-delo";
import { GumbiStatusa } from "./gumbi-statusa";

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
      `
    id,
    kolicina,
    dolzina,
    sirina,
    opis_slike,
    ogledalo,
    cena_postavke,
    vrstni_red,
    postavka_okvir (
      id,
      vzorec,
      barva,
      sirina_okvirja,
      cena_okvirja,
      vrstni_red
    ),
    postavka_steklo (
      id,
      naziv,
      cena_stekla
    ),
    postavka_paspartu (
      id,
      oznaka,
      barva,
      dodatni_opis,
      cena_paspartuja,
      vrstni_red
    ),
    postavka_podokvir (
      id,
      je_podokvir,
      podokvir_dolzina,
      podokvir_sirina,
      cena_podokvirja
    ),
    postavka_dodatno_delo (
      id,
      dodatno_delo_id,
      naziv,
      nacin_obracuna,
      kolicina,
      cena_enote,
      skupna_cena,
      osnovna_cena,
      cena_na_m2,
      cena_na_m,
      izracunana_povrsina,
      izracunan_obseg,
      vrstni_red
    )
  `,
    )
    .eq("narocilo_id", dokumentId)
    .order("vrstni_red");

  const { data: zgodovinaStatusov } = await supabase
    .from("zgodovina_statusa_narocila")
    .select(
      "id, prejsnji_status, novi_status, ustvarjeno_at",
    )
    .eq("narocilo_id", dokumentId)
    .order("ustvarjeno_at", { ascending: false });

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

          <div className="flex items-center gap-3">
            <Link
              href={`/dokumenti/${dokument.id}/natisni`}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Natisni dokument
            </Link>

            <Link
              href="/dokumenti"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Nazaj na dokumente
            </Link>
          </div>
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
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Potek dokumenta
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Trenutni status:{" "}
                <span className="font-semibold text-slate-900">
                  {naziviStatusov[dokument.status]}
                </span>
              </p>

              {dokument.vrsta === "ponudba" && (
                <p className="mt-1 text-sm text-slate-500">
                  Ob potrditvi se ponudba samodejno spremeni v naročilo.
                </p>
              )}
            </div>

            <GumbiStatusa
              status={dokument.status}
              vrsta={dokument.vrsta}
              action={spremeniStatusDokumenta.bind(
                null,
                dokument.id,
              )}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Zgodovina statusov
          </h2>

          {!zgodovinaStatusov || zgodovinaStatusov.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Status dokumenta še ni bil spremenjen.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {zgodovinaStatusov.map((zapis) => (
                <div
                  key={zapis.id}
                  className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <p className="text-sm text-slate-700">
                    {zapis.prejsnji_status
                      ? naziviStatusov[zapis.prejsnji_status]
                      : "Začetek"}
                    {" → "}
                    <span className="font-semibold text-slate-900">
                      {naziviStatusov[zapis.novi_status]}
                    </span>
                  </p>

                  <time className="text-xs text-slate-500">
                    {new Intl.DateTimeFormat("sl-SI", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(zapis.ustvarjeno_at))}
                  </time>
                </div>
              ))}
            </div>
          )}
        </section>

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
                    <th className="px-5 py-3 text-right text-sm font-semibold text-slate-700">
                      Dejanja
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
                        <p className="font-medium">
                          {postavka.opis_slike ??
                            (postavka.ogledalo ? "Ogledalo" : "Slika")}
                        </p>

                        {postavka.postavka_okvir.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {postavka.postavka_okvir
                              .toSorted((a, b) => a.vrstni_red - b.vrstni_red)
                              .map((okvir) => (
                                <div
                                  key={okvir.id}
                                  className="flex min-w-72 items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {okvir.vzorec}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-600">
                                      {okvir.barva ?? "Brez barve"}
                                      {" · "}
                                      Širina:{" "}
                                      {okvir.sirina_okvirja !== null
                                        ? `${okvir.sirina_okvirja} cm`
                                        : "ni vnesena"}
                                      {" · "}
                                      {oblikujZnesek(okvir.cena_okvirja)}
                                    </p>
                                  </div>

                                  <GumbOdstraniOkvir
                                    action={odstraniOkvir.bind(
                                      null,
                                      dokument.id,
                                      postavka.id,
                                      okvir.id,
                                    )}
                                  />
                                </div>
                              ))}
                          </div>
                        )}
                        {postavka.postavka_steklo && (
                          <div className="mt-2 flex min-w-72 items-center justify-between gap-4 rounded-lg border border-sky-200 bg-sky-50 p-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Steklo: {postavka.postavka_steklo.naziv}
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                {oblikujZnesek(postavka.postavka_steklo.cena_stekla)}
                              </p>
                            </div>

                            <GumbOdstraniSteklo
                              action={odstraniSteklo.bind(
                                null,
                                dokument.id,
                                postavka.id,
                                postavka.postavka_steklo.id,
                              )}
                            />
                          </div>
                        )}
                        {postavka.postavka_paspartu.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {postavka.postavka_paspartu
                              .toSorted((a, b) => a.vrstni_red - b.vrstni_red)
                              .map((paspartu) => (
                                <div
                                  key={paspartu.id}
                                  className="flex min-w-72 items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-3"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Paspartu: {paspartu.oznaka ?? "Brez oznake"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-600">
                                      {paspartu.barva ?? "Brez barve"}
                                      {paspartu.dodatni_opis
                                        ? ` · ${paspartu.dodatni_opis}`
                                        : ""}
                                      {" · "}
                                      {oblikujZnesek(paspartu.cena_paspartuja)}
                                    </p>
                                  </div>

                                  <GumbOdstraniPaspartu
                                    action={odstraniPaspartu.bind(
                                      null,
                                      dokument.id,
                                      postavka.id,
                                      paspartu.id,
                                    )}
                                  />
                                </div>
                              ))}
                          </div>
                        )}
                        {postavka.postavka_podokvir && (
                          <div className="mt-2 flex min-w-72 items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Podokvir:{" "}
                                {postavka.postavka_podokvir.podokvir_dolzina} ×{" "}
                                {postavka.postavka_podokvir.podokvir_sirina} cm
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                {oblikujZnesek(
                                  postavka.postavka_podokvir.cena_podokvirja,
                                )}
                              </p>
                            </div>

                            <GumbOdstraniPodokvir
                              action={odstraniPodokvir.bind(
                                null,
                                dokument.id,
                                postavka.id,
                                postavka.postavka_podokvir.id,
                              )}
                            />
                          </div>
                        )}
                        {postavka.postavka_dodatno_delo.map((delo) => (
                          <div
                            key={delo.id}
                            className="mt-2 flex min-w-72 items-center justify-between gap-4 rounded-lg border border-violet-200 bg-violet-50 p-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Dodatno delo: {delo.naziv}
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                {oblikujZnesek(delo.skupna_cena)}
                              </p>

                              {delo.nacin_obracuna === "kombinirano" && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Osnovna cena in obračun po merah
                                </p>
                              )}
                            </div>

                            <GumbOdstraniDodatnoDelo
                              action={odstraniDodatnoDelo.bind(
                                null,
                                dokument.id,
                                postavka.id,
                                delo.id,
                              )}
                            />
                          </div>
                        ))}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {postavka.dolzina} × {postavka.sirina}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {postavka.kolicina}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dokumenti/${dokument.id}/postavke/${postavka.id}/okvir`}
                          className="inline-block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Dodaj okvir
                        </Link>
                        {!postavka.postavka_steklo && (
                          <Link
                            href={`/dokumenti/${dokument.id}/postavke/${postavka.id}/steklo`}
                            className="inline-block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Dodaj steklo
                          </Link>
                        )}
                        <Link
                          href={`/dokumenti/${dokument.id}/postavke/${postavka.id}/paspartu`}
                          className="inline-block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Dodaj paspartu
                        </Link>
                        {!postavka.postavka_podokvir && (
                          <form
                            action={dodajPodokvir.bind(
                              null,
                              dokument.id,
                              postavka.id,
                            )}
                          >
                            <button
                              type="submit"
                              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
                            >
                              Dodaj podokvir
                            </button>
                          </form>
                        )}
                        <Link
                          href={`/dokumenti/${dokument.id}/postavke/${postavka.id}/dodatna-dela`}
                          className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-center text-sm font-medium text-violet-800 transition hover:bg-violet-100"
                        >
                          Dodatno delo
                        </Link>
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