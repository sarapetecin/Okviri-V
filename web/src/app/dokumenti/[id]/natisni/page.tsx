import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { GumbNatisni } from "./gumb-natisni";

type NatisniPageProps = {
    params: Promise<{
        id: string;
    }>;
};

function oblikujDatum(datum: string | null) {
    if (!datum) {
        return "—";
    }

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

function oblikujMero(mera: number) {
    return new Intl.NumberFormat("sl-SI", {
        maximumFractionDigits: 1,
    }).format(mera);
}

export default async function NatisniPage({ params }: NatisniPageProps) {
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
            `
        id,
        vrsta,
        datum_sprejema,
        rok_izdelave,
        stranka_naziv,
        stranka_telefonska_stevilka,
        stranka_email,
        stranka_hisni_naslov,
        stranka_davcni_zavezanec,
        stranka_davcna_stevilka,
        popust,
        skupni_znesek,
        izdal_ime
      `,
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
        vrstni_red,
        kolicina,
        dolzina,
        sirina,
        opis_slike,
        opombe,
        ogledalo,
        cena_postavke,
        postavka_okvir (
          id,
          vzorec,
          barva,
          vrstni_red
        ),
        postavka_paspartu (
          id,
          oznaka,
          barva,
          dodatni_opis,
          nacin_paspartu,
          vrstni_red
        ),
        postavka_steklo (
          id,
          naziv
        ),
        postavka_podokvir (
          id,
          je_podokvir,
          podokvir_dolzina,
          podokvir_sirina
        ),
        postavka_dodatno_delo (
          id,
          naziv,
          opis,
          vrstni_red
        )
      `,
        )
        .eq("narocilo_id", dokumentId)
        .order("vrstni_red");

    if (napakaPostavk) {
        console.error("Napaka pri nalaganju postavk za tisk:", napakaPostavk);
    }

    const vsePostavke = postavke ?? [];

    const steviloKosov = vsePostavke.reduce(
        (vsota, postavka) => vsota + postavka.kolicina,
        0,
    );

    const nazivDokumenta =
        dokument.vrsta === "ponudba" ? "PONUDBA" : "NAROČILO";

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-6 print:min-h-0 print:bg-white print:p-0">
            <style>{`
        @page {
          size: A4 landscape;
          margin: 8mm;
        }

        @media print {
          html,
          body {
            background: white !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

            <div className="mx-auto mb-4 flex max-w-[1180px] justify-between gap-3 print:hidden">
                <Link
                    href={`/dokumenti/${dokument.id}`}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700"
                >
                    Nazaj na dokument
                </Link>

                <GumbNatisni />
            </div>

            <article className="mx-auto min-h-[190mm] max-w-[1180px] bg-white p-4 text-[12px] text-slate-800 shadow-lg print:min-h-0 print:max-w-none print:p-0 print:shadow-none">
                <header className="grid grid-cols-[68px_1fr_1fr] border border-slate-300">
                    <div className="row-span-2 flex items-center justify-center border-r border-slate-300 p-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300 text-center text-[8px] font-semibold tracking-[0.18em] text-slate-600">
                            OKVIRI V
                        </div>
                    </div>

                    <div className="border-b border-r border-slate-300 px-2 py-2 text-[13px]">
                        OKVIRI V OPREMA LIKOVNIH DEL D.O.O.
                    </div>

                    <div className="border-b border-slate-300 px-2 py-2 text-right">
                        Dolenjska cesta 164 / SI - 1000 Ljubljana
                    </div>

                    <div className="border-r border-slate-300 px-2 py-2">
                        Odprto: pon. – čet. od 9–13 in od 15–18 ure. Petki, sobote,
                        nedelje in prazniki <strong>zaprto.</strong>
                    </div>

                    <div className="px-2 py-2 text-right">
                        01 427 1 420 / 031 361 043 / okviri@siol.net / www.okviri.net
                    </div>
                </header>

                <section className="mt-7 grid grid-cols-[1fr_0.9fr_1fr] gap-10">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            {nazivDokumenta}
                        </p>

                        <h1 className="mt-1 text-2xl font-bold">
                            {dokument.stranka_naziv}
                        </h1>

                        {dokument.stranka_hisni_naslov && (
                            <p className="mt-1 text-slate-600">
                                {dokument.stranka_hisni_naslov}
                            </p>
                        )}

                        <dl className="mt-5 grid max-w-sm grid-cols-[160px_1fr]">
                            <dt className="bg-slate-100 px-2 py-2 font-bold">
                                ID {nazivDokumenta === "PONUDBA" ? "ponudbe" : "naročila"}
                            </dt>
                            <dd className="px-3 py-2">{dokument.id}</dd>

                            <dt className="mt-px bg-slate-100 px-2 py-2 font-bold">
                                Tel. št.
                            </dt>
                            <dd className="mt-px px-3 py-2">
                                {dokument.stranka_telefonska_stevilka ?? "—"}
                            </dd>

                            {dokument.stranka_email && (
                                <>
                                    <dt className="mt-px bg-slate-100 px-2 py-2 font-bold">
                                        E-pošta
                                    </dt>
                                    <dd className="mt-px px-3 py-2">
                                        {dokument.stranka_email}
                                    </dd>
                                </>
                            )}
                        </dl>
                    </div>

                    <div>
                        <div className="grid grid-cols-[160px_1fr] items-center">
                            <p className="bg-slate-100 px-2 py-2 text-2xl font-bold">
                                Cena
                            </p>
                            <p className="px-3 text-2xl font-bold">
                                {oblikujZnesek(dokument.skupni_znesek)}
                            </p>

                            <p className="mt-px bg-slate-100 px-2 py-2 font-bold">
                                Vsi kosi
                            </p>
                            <p className="mt-px px-3 py-2">{steviloKosov}</p>

                            {dokument.stranka_davcna_stevilka && (
                                <>
                                    <p className="mt-px bg-slate-100 px-2 py-2 font-bold">
                                        Davčna številka
                                    </p>
                                    <p className="mt-px px-3 py-2">
                                        {dokument.stranka_davcna_stevilka}
                                    </p>
                                </>
                            )}

                            {dokument.popust > 0 && (
                                <>
                                    <p className="mt-px bg-slate-100 px-2 py-2 font-bold">
                                        Popust
                                    </p>
                                    <p className="mt-px px-3 py-2">{dokument.popust} %</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="grid grid-cols-[160px_1fr] items-center">
                            <p className="bg-slate-100 px-2 py-2 text-2xl font-bold">
                                Rok izdelave
                            </p>
                            <p className="px-3 text-2xl font-bold">
                                {oblikujDatum(dokument.rok_izdelave)}
                            </p>

                            <p className="mt-px bg-slate-100 px-2 py-2 font-bold">
                                Datum sprejema
                            </p>
                            <p className="mt-px px-3 py-2">
                                {oblikujDatum(dokument.datum_sprejema)}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    {napakaPostavk ? (
                        <p className="border border-red-300 bg-red-50 p-4 text-red-700">
                            Postavk ni bilo mogoče naložiti.
                        </p>
                    ) : (
                        <table className="w-full table-fixed border-collapse text-left">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="w-[5%] border border-slate-300 px-2 py-2">
                                        ID
                                    </th>
                                    <th className="w-[5%] border border-slate-300 px-2 py-2">
                                        Kol.
                                    </th>
                                    <th className="w-[7%] border border-slate-300 px-2 py-2">
                                        Dolžina
                                    </th>
                                    <th className="w-[7%] border border-slate-300 px-2 py-2">
                                        Širina
                                    </th>
                                    <th className="w-[22%] border border-slate-300 px-2 py-2">
                                        Okvir + zunanji okvirji
                                    </th>
                                    <th className="w-[13%] border border-slate-300 px-2 py-2">
                                        Paspartu
                                    </th>
                                    <th className="w-[14%] border border-slate-300 px-2 py-2">
                                        Steklo
                                    </th>
                                    <th className="w-[10%] border border-slate-300 px-2 py-2">
                                        Opis slike
                                    </th>
                                    <th className="w-[10%] border border-slate-300 px-2 py-2">
                                        Opombe
                                    </th>
                                    <th className="w-[10%] border border-slate-300 px-2 py-2 text-right">
                                        Cena
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {vsePostavke.map((postavka) => {
                                    const okvirji = [...postavka.postavka_okvir].sort(
                                        (a, b) => a.vrstni_red - b.vrstni_red,
                                    );

                                    const paspartuji = [...postavka.postavka_paspartu].sort(
                                        (a, b) => a.vrstni_red - b.vrstni_red,
                                    );

                                    const dodatnaDela = [
                                        ...postavka.postavka_dodatno_delo,
                                    ].sort((a, b) => a.vrstni_red - b.vrstni_red);

                                    return (
                                        <tr key={postavka.id} className="break-inside-avoid">
                                            <td className="border border-slate-300 px-2 py-3 align-top">
                                                {postavka.id}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-3 align-top">
                                                {postavka.kolicina}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-3 align-top">
                                                {oblikujMero(postavka.dolzina)}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-3 align-top">
                                                {oblikujMero(postavka.sirina)}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-3 align-top">
                                                {okvirji.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {okvirji.map((okvir) => (
                                                            <p key={okvir.id}>
                                                                {okvir.vzorec}
                                                                {okvir.barva ? ` ${okvir.barva}` : ""}
                                                            </p>
                                                        ))}

                                                        {postavka.postavka_podokvir?.je_podokvir && (
                                                            <p>
                                                                Podokvir{" "}
                                                                {oblikujMero(
                                                                    postavka.postavka_podokvir
                                                                        .podokvir_dolzina ?? 0,
                                                                )}{" "}
                                                                ×{" "}
                                                                {oblikujMero(
                                                                    postavka.postavka_podokvir
                                                                        .podokvir_sirina ?? 0,
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : postavka.ogledalo ? (
                                                    "Ogledalo"
                                                ) : (
                                                    "—"
                                                )}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-3 align-top">
                                                {paspartuji.length > 0
                                                    ? paspartuji.map((paspartu) => (
                                                        <p key={paspartu.id}>
                                                            {[paspartu.oznaka, paspartu.barva]
                                                                .filter(Boolean)
                                                                .join(" – ")}
                                                        </p>
                                                    ))
                                                    : "—"}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-3 align-top">
                                                {postavka.postavka_steklo?.naziv ?? "—"}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-3 align-top">
                                                {postavka.opis_slike ?? "—"}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-3 align-top">
                                                <p>{postavka.opombe ?? "—"}</p>

                                                {dodatnaDela.length > 0 && (
                                                    <div className="mt-2">
                                                        {dodatnaDela.map((delo) => (
                                                            <p key={delo.id}>
                                                                {delo.naziv}
                                                                {delo.opis ? ` – ${delo.opis}` : ""}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-3 text-right align-top font-medium">
                                                {oblikujZnesek(postavka.cena_postavke)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </section>

                <footer className="mt-10">
                    <div className="space-y-3">
                        <p>
                            Strank ne obveščamo po telefonu. Slike lahko prevzamete s
                            potrdilom <strong>najkasneje 60 dni</strong> po roku izdelave,
                            po tem za slike ne odgovarjamo več.
                        </p>

                        <p>
                            5 % popusta nudimo ob prijavi na e-novičke. Popust velja ves čas
                            prijave, koda pa je vaš e-mail, s katerim ste se prijavili na{" "}
                            <strong>www.okviri.net</strong>.
                        </p>

                        <p className="text-orange-500">
                            Spremljajte nas tudi na FB, IG in LinkedIn.
                        </p>
                    </div>

                    <div className="mt-4 grid grid-cols-[1fr_0.8fr_1fr] border border-slate-300">
                        <div className="border-r border-slate-300 px-2 py-3">
                            <p>Podpis izvajalca: ____________________</p>
                            <p className="mt-1">Stregel/-la vas je {dokument.izdal_ime}.</p>
                        </div>

                        <div className="flex items-end justify-center border-r border-slate-300 px-3 py-3 font-bold text-slate-400">
                        </div>

                        <div className="flex items-start justify-end px-2 py-3">
                            ____________________: Podpis naročnika
                        </div>
                    </div>
                </footer>
            </article>
        </main>
    );
}