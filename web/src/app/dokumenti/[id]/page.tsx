import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import { spremeniStatusDokumenta } from "./actions";
import { GumbiStatusa } from "./gumbi-statusa";
import { izbrisiPostavko } from "./brisanje-postavke";
import { GumbIzbrisiPostavko } from "./gumb-izbrisi-postavko";

import NovaPostavkaPage from "./postavke/nova/page";

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
  searchParams: Promise<{
    napaka?: string;
    urediPostavko?: string;
  }>;
};

export default async function DokumentPage({
  params,
  searchParams,
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

  const { data: uporabniskaVloga, error: napakaVloge } =
    await supabase.rpc("trenutna_uporabniska_vloga");

  if (napakaVloge || !uporabniskaVloga) {
    redirect("/");
  }

  const jePartner = uporabniskaVloga === "partner";
  const jeAdministrator = uporabniskaVloga === "administrator";

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

  const jeDokumentZakljucen = [
    "dokoncano",
    "rocno_zaprto",
    "preklicano",
  ].includes(dokument.status);

  const lahkoUrejaPostavke = jePartner
    ? dokument.vrsta === "ponudba" &&
    ["osnutek", "zavrnjeno"].includes(dokument.status)
    : !jeDokumentZakljucen;

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
    opombe,
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
      nacin_paspartu,
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

  const zgodovinaStatusov = jeAdministrator
    ? (
      await supabase
        .from("zgodovina_statusa_narocila")
        .select(
          "id, prejsnji_status, novi_status, ustvarjeno_at",
        )
        .eq("narocilo_id", dokumentId)
        .order("ustvarjeno_at", { ascending: false })
    ).data
    : [];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-4 xl:px-6">
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

      <section className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-8 xl:px-6">
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
              jePartner={jePartner}
              action={spremeniStatusDokumenta.bind(
                null,
                dokument.id,
              )}
            />
          </div>
        </section>

        {jeAdministrator && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Zgodovina statusov
            </h2>

            {!zgodovinaStatusov ||
              zgodovinaStatusov.length === 0 ? (
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
        )}

        {lahkoUrejaPostavke && (
          <section
            id="nova-postavka"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6"
          >
            <NovaPostavkaPage
              params={Promise.resolve({
                id: String(dokument.id),
              })}
              searchParams={searchParams.then((vrednosti) => ({
                ...vrednosti,
                _vdelano: "da",
              }))}
            />
          </section>
        )}

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
            {lahkoUrejaPostavke && (
              <a
                href="#nova-postavka"
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Dodaj postavko zgoraj
              </a>
            )}
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
            <div className="w-full overflow-hidden rounded-b-2xl">
              <table className="w-full table-fixed border-collapse text-left text-sm text-slate-900">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                    <th className="w-[4%] border-b border-r border-slate-200 last:border-r-0 px-1.5 py-2">
                      ID
                    </th>

                    <th className="w-[4%] border-b border-r border-slate-200 last:border-r-0 px-1.5 py-2">
                      Kol.
                    </th>

                    <th className="w-[6%] border-b border-r border-slate-200 last:border-r-0 px-1.5 py-2">
                      Dolžina
                    </th>

                    <th className="w-[6%] border-b border-r border-slate-200 last:border-r-0 px-1.5 py-2">
                      Širina
                    </th>

                    <th className="w-[19%] border-b border-r border-slate-200 last:border-r-0 px-1.5 py-2">
                      Okvirji
                    </th>

                    <th className="w-[13%] border-b border-r border-slate-200 last:border-r-0 px-1.5 py-2">
                      Paspartu
                    </th>

                    <th className="w-[10%] border-b border-r border-slate-200 last:border-r-0 px-1.5 py-2">
                      Steklo
                    </th>

                    <th className="w-[9%] border-b border-r border-slate-200 last:border-r-0 px-1.5 py-2">
                      Opis
                    </th>

                    <th className="w-[9%] border-b border-r border-slate-200 last:border-r-0 px-1.5 py-2">
                      Opombe
                    </th>

                    <th className="w-[8%] border-b border-r border-slate-200 last:border-r-0 px-1.5 py-2 text-right">
                      Cena
                    </th>

                    <th className="w-[10%] border-b border-slate-200 px-3 py-3 text-right">
                      Dejanja
                    </th>
                  </tr>
                </thead>

                <tbody className="text-slate-900">
                  {postavke.map((postavka) => {
                    const okvirji = [
                      ...postavka.postavka_okvir,
                    ].sort(
                      (prvi, drugi) =>
                        prvi.vrstni_red - drugi.vrstni_red,
                    );

                    const paspartuji = [
                      ...postavka.postavka_paspartu,
                    ].sort(
                      (prvi, drugi) =>
                        prvi.vrstni_red - drugi.vrstni_red,
                    );

                    const dodatnaDela = [
                      ...postavka.postavka_dodatno_delo,
                    ].sort(
                      (prvo, drugo) =>
                        prvo.vrstni_red - drugo.vrstni_red,
                    );

                    return (
                      <tr
                        key={postavka.id}
                        className="align-top text-slate-900 hover:bg-slate-50"
                      >
                        <td className="border-b border-r border-slate-200 px-3 py-4 last:border-r-0">
                          {postavka.id}
                        </td>

                        <td className="border-b border-r border-slate-200 px-3 py-4 last:border-r-0">
                          {postavka.kolicina}
                        </td>

                        <td className="border-b border-r border-slate-200 px-3 py-4 last:border-r-0">
                          {postavka.dolzina}
                        </td>

                        <td className="border-b border-r border-slate-200 px-3 py-4 last:border-r-0">
                          {postavka.sirina}
                        </td>

                        <td className="border-b border-r border-slate-200 px-3 py-4 last:border-r-0">
                          {okvirji.length > 0 ? (
                            <div className="space-y-2">
                              {okvirji.map((okvir) => (
                                <p key={okvir.id}>
                                  {okvir.vzorec}
                                  {okvir.barva
                                    ? ` – ${okvir.barva}`
                                    : ""}
                                </p>
                              ))}

                              {postavka.postavka_podokvir && (
                                <p className="border-t border-slate-200 pt-2">
                                  Podokvir{" "}
                                  {
                                    postavka.postavka_podokvir
                                      .podokvir_dolzina
                                  }{" "}
                                  ×{" "}
                                  {
                                    postavka.postavka_podokvir
                                      .podokvir_sirina
                                  }
                                </p>
                              )}
                            </div>
                          ) : postavka.ogledalo ? (
                            "Ogledalo"
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="border-b border-r border-slate-200 px-3 py-4 last:border-r-0">
                          {paspartuji.length > 0 ? (
                            <div className="space-y-2">
                              {paspartuji.map((paspartu) => (
                                <p key={paspartu.id}>
                                  <span className="mr-1 font-bold text-slate-900">
                                    {paspartu.nacin_paspartu ===
                                      "polozen"
                                      ? "○"
                                      : "□"}
                                  </span>

                                  {[
                                    paspartu.oznaka,
                                    paspartu.barva,
                                  ]
                                    .filter(Boolean)
                                    .join(" – ")}
                                </p>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="border-b border-r border-slate-200 px-3 py-4 last:border-r-0">
                          {postavka.postavka_steklo ? (
                            postavka.postavka_steklo.naziv
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="border-b border-r border-slate-200 px-3 py-4 last:border-r-0">
                          {postavka.opis_slike ?? "—"}
                        </td>

                        <td className="border-b border-r border-slate-200 px-3 py-4 last:border-r-0">
                          <p>{postavka.opombe ?? "—"}</p>

                          {dodatnaDela.length > 0 && (
                            <div className="mt-2 space-y-2 border-t border-slate-200 pt-2">
                              {dodatnaDela.map((delo) => (
                                <p key={delo.id}>{delo.naziv}</p>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="border border-slate-300 px-1.5 py-2.5 text-right font-semibold whitespace-nowrap">
                          {oblikujZnesek(
                            postavka.cena_postavke,
                          )}
                        </td>

                        <td className="border border-slate-300 px-1.5 py-2.5">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Link
                              href={`/dokumenti/${dokument.id}?urediPostavko=${postavka.id}#nova-postavka`}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                              Uredi
                            </Link>

                            <GumbIzbrisiPostavko
                              action={izbrisiPostavko.bind(
                                null,
                                dokument.id,
                                postavka.id,
                              )}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main >
  );
}
