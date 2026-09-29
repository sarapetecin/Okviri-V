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
        salon_prevzema,
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
        mere_paspartuja,
        ogledalo,
        cena_postavke,
        postavka_okvir (
          id,
          vzorec,
          vrstni_red
        ),
        postavka_paspartu (
          id,
          oznaka,
          dodatni_opis,
          nacin_paspartu,
          vrstni_red
        ),
        postavka_steklo (
          id,
          naziv,
          steklo (oznaka)
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
    const prikaziOkvir = vsePostavke.some(
        (postavka) => postavka.postavka_okvir.length > 0 || postavka.ogledalo,
    );
    const prikaziPodokvir = vsePostavke.some(
        (postavka) => postavka.postavka_podokvir?.je_podokvir,
    );
    const prikaziPaspartu = vsePostavke.some(
        (postavka) => postavka.postavka_paspartu.length > 0,
    );
    const prikaziSteklo = vsePostavke.some(
        (postavka) => Boolean(postavka.postavka_steklo?.naziv?.trim()),
    );
    const prikaziOpis = vsePostavke.some(
        (postavka) => Boolean(postavka.opis_slike?.trim()),
    );
    const prikaziOpombe = vsePostavke.some(
        (postavka) => Boolean(postavka.opombe?.trim()) || postavka.postavka_dodatno_delo.length > 0,
    );
    const nazivDokumenta =
        dokument.vrsta === "ponudba" ? "PONUDBA" : "NAROČILO";
    return (
        <main className="min-h-screen bg-slate-100 px-4 py-6 print:min-h-0 print:bg-white print:p-0">
            <style>{`
        @page {
          size: A5 landscape;
          margin: 6mm;
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
            <div className="mx-auto mb-4 flex max-w-[210mm] justify-between gap-3 print:hidden">
                <Link
                    href={`/dokumenti/${dokument.id}`}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700"
                >
                    Nazaj na dokument
                </Link>
                <GumbNatisni />
            </div>
            <article className="mx-auto box-border min-h-[148mm] w-[210mm] bg-white p-[6mm] text-[10px] leading-[1.25] text-slate-800 shadow-lg print:min-h-0 print:w-auto print:p-0 print:shadow-none">
                <header className="grid grid-cols-[48px_1fr_1fr] gap-x-1">
                    <div className="row-span-2 flex items-center justify-center p-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full text-center text-[8px] font-semibold tracking-[0.18em] text-slate-600">
                            OKVIRI V
                        </div>
                    </div>
                    <div className="px-1 py-1 text-[11px]">
                        OKVIRI V OPREMA LIKOVNIH DEL D.O.O.
                    </div>
                    <div className="px-1 py-1 text-right">
                        Dolenjska cesta 164 / SI - 1000 Ljubljana
                    </div>
                    <div className="px-1 py-1">
                        Odprto: pon. – čet. od 9–13 in od 15–18 ure. Petki, sobote,
                        nedelje in prazniki <strong>zaprto.</strong>
                    </div>
                    <div className="px-1 py-1 text-right">
                        01 427 1 420 / 031 361 043 / okviri@siol.net / www.okviri.net
                    </div>
                </header>
                {dokument.vrsta === "narocilo" && dokument.salon_prevzema === "bevke" && (
                    <div className="mt-2 border-y-2 border-red-700 bg-red-100 px-2 py-1.5 text-center text-[14px] font-extrabold uppercase tracking-wide text-red-900">
                        Salon Bevke
                    </div>
                )}
                <section className="mt-2 grid grid-cols-[1fr_0.9fr_1fr] gap-3">
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold leading-tight text-slate-900">
                            {dokument.stranka_naziv}
                            {dokument.stranka_davcna_stevilka && (
                                <span className="ml-2 text-sm font-medium text-slate-500">
                                    DŠ: {dokument.stranka_davcna_stevilka}
                                </span>
                            )}
                        </h1>

                        {dokument.stranka_hisni_naslov && (
                            <p className="mt-1 text-sm text-slate-600">
                                {dokument.stranka_hisni_naslov}
                            </p>
                        )}

                        {(dokument.stranka_telefonska_stevilka ||
                            dokument.stranka_email) && (
                                <p className="mt-1 text-sm text-slate-600">
                                    {dokument.stranka_telefonska_stevilka}

                                    {dokument.stranka_telefonska_stevilka &&
                                        dokument.stranka_email && (
                                            <span className="mx-2 text-slate-300">•</span>
                                        )}

                                    {dokument.stranka_email}
                                </p>
                            )}

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {nazivDokumenta === "PONUDBA"
                                ? "Ponudba"
                                : "Naročilo"}{" "}
                            št. {dokument.id}
                        </p>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-8">
                            <p className="text-sm font-bold">
                                Cena
                            </p>
                            <p className="whitespace-nowrap text-sm font-bold">
                                {oblikujZnesek(dokument.skupni_znesek)}
                            </p>
                        </div>

                        <div className="flex items-baseline gap-8">
                            <p className="text-xs text-slate-600">
                                Vsi kosi
                            </p>
                            <p className="whitespace-nowrap text-xs font-medium">
                                {steviloKosov}
                            </p>
                        </div>

                        {dokument.popust > 0 && (
                            <div className="flex items-baseline gap-8">
                                <p className="text-xs text-slate-600">
                                    Popust
                                </p>
                                <p className="whitespace-nowrap text-xs font-medium">
                                    {dokument.popust} %
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="min-w-[160px]">
                        <div className="flex items-baseline justify-between gap-6">
                            <p className="text-sm font-bold">
                                Rok izdelave
                            </p>
                            <p className="whitespace-nowrap text-sm font-bold">
                                {oblikujDatum(dokument.rok_izdelave)}
                            </p>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-6">
                            <p className="text-xs text-slate-600">
                                Datum sprejema
                            </p>
                            <p className="whitespace-nowrap text-xs font-medium">
                                {oblikujDatum(dokument.datum_sprejema)}
                            </p>
                        </div>
                    </div>
                </section>
                <section className="mt-1">
                    {napakaPostavk ? (
                        <p className="border border-red-300 bg-red-50 p-4 text-red-700">
                            Postavk ni bilo mogoče naložiti.
                        </p>
                    ) : (
                        <table className="w-full table-fixed border-collapse text-left text-[10px] [overflow-wrap:anywhere]">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="w-[4%] border border-slate-300 px-1 py-1">
                                        ID
                                    </th>
                                    <th className="w-[4%] border border-slate-300 px-1 py-1">
                                        Kol.
                                    </th>
                                    <th className="w-[6%] border border-slate-300 px-1 py-1">
                                        Dolžina
                                    </th>
                                    <th className="w-[6%] border border-slate-300 px-1 py-1">
                                        Širina
                                    </th>
                                    {prikaziOkvir && <th className="border border-slate-300 px-1 py-1">
                                        Okvir + zunanji okvirji
                                    </th>}
                                    {prikaziPodokvir && <th className="border border-slate-300 px-1 py-1">
                                        Podokvir
                                    </th>}
                                    {prikaziPaspartu && <th className="border border-slate-300 px-1 py-1">
                                        Paspartu
                                    </th>}
                                    {prikaziSteklo && <th className="border border-slate-300 px-1 py-1 w-[18%]">
                                        Steklo
                                    </th>}
                                    {prikaziOpis && <th className="border border-slate-300 px-1 py-1 w-[9%]">
                                        Opis slike
                                    </th>}
                                    {prikaziOpombe && <th className="border border-slate-300 px-1 py-1">
                                        Opombe
                                    </th>}
                                    <th className="border border-slate-300 px-1 py-1 text-right w-[8%]">
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
                                        <tr key={postavka.id} className="break-inside-avoid text-[13px]">
                                            <td className="border border-slate-300 px-1 py-1 align-top">
                                                {postavka.id}
                                            </td>
                                            <td className="border border-slate-300 px-1 py-1 align-top">
                                                {postavka.kolicina}
                                            </td>
                                            <td className="border border-slate-300 px-1 py-1 align-top">
                                                {oblikujMero(postavka.dolzina)}
                                            </td>
                                            <td className="border border-slate-300 px-1 py-1 align-top">
                                                {oblikujMero(postavka.dolzina)}
                                            </td>
                                            {prikaziOkvir && <td className="border border-slate-300 px-1 py-1 align-top">
                                                {okvirji.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {okvirji.map((okvir) => (
                                                            <p key={okvir.id}>
                                                                {okvir.vzorec}
                                                            </p>
                                                        ))}
                                                    </div>
                                                ) : postavka.ogledalo ? (
                                                    "Ogledalo"
                                                ) : (
                                                    "—"
                                                )}
                                            </td>}
                                            {prikaziPodokvir && <td className="border border-slate-300 px-1 py-1 align-top">
                                                {postavka.postavka_podokvir?.je_podokvir
                                                    ? `${oblikujMero(
                                                        postavka.postavka_podokvir
                                                            .podokvir_dolzina ?? 0,
                                                    )} × ${oblikujMero(
                                                        postavka.postavka_podokvir
                                                            .podokvir_sirina ?? 0,
                                                    )}`
                                                    : "—"}
                                            </td>}
                                            {prikaziPaspartu && <td className="border border-slate-300 px-1 py-1 align-top">
                                                {paspartuji.length > 0 ? (
                                                    <>
                                                        {paspartuji.map((paspartu) => (
                                                            <p key={paspartu.id}>
                                                                <span className="mr-1 text-[11px] font-semibold">
                                                                    {paspartu.nacin_paspartu === "polozen"
                                                                        ? "○"
                                                                        : "□"}
                                                                </span>
                                                                {[
                                                                    paspartu.oznaka,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(" – ")}
                                                            </p>
                                                        ))}
                                                        {postavka.mere_paspartuja && (
                                                            <p className="mt-1 text-[10px]">
                                                                Širina: {postavka.mere_paspartuja} cm
                                                            </p>
                                                        )}
                                                    </>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>}
                                            {prikaziSteklo && <td className="border border-slate-300 px-1 py-1 align-top">
                                                {postavka.postavka_steklo
                                                    ? [
                                                        postavka.postavka_steklo.steklo?.oznaka,
                                                        postavka.postavka_steklo.naziv,
                                                    ].filter(Boolean).join(" - ")
                                                    : "—"}
                                            </td>}
                                            {prikaziOpis && <td className="border border-slate-300 px-1 py-1 align-top">
                                                {postavka.opis_slike ?? "—"}
                                            </td>}
                                            {prikaziOpombe && <td className="border border-slate-300 px-1 py-1 align-top">
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
                                            </td>}
                                            <td className="border border-slate-300 px-1 py-1 text-right align-top font-medium whitespace-nowrap">
                                                {oblikujZnesek(postavka.cena_postavke)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </section>
                <footer className="mt-2">
                    <div className="space-y-1">
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
                    <div className="mt-1 grid grid-cols-[1fr_0.8fr_1fr]">
                        <div className="px-1 py-1">
                            <p>Podpis izvajalca: ____________________</p>
                            <p className="mt-1">Stregel/-la vas je {dokument.izdal_ime}.</p>
                        </div>
                        <div className="flex items-end justify-center px-1 py-1 font-bold text-slate-400">
                        </div>
                        <div className="flex items-start justify-end px-1 py-1">
                            ____________________: Podpis naročnika
                        </div>
                    </div>
                </footer>
            </article>
        </main>
    );
}
