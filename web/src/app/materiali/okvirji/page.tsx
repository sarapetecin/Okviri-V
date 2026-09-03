import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type OkvirjiPageProps = {
    searchParams: Promise<{
        iskanje?: string;
        stran?: string;
    }>;
};

const zapisovNaStran = 50;

function oblikujCeno(cena: number | null) {
    if (cena === null) {
        return "—";
    }

    return new Intl.NumberFormat("sl-SI", {
        style: "currency",
        currency: "EUR",
    }).format(cena);
}

export default async function OkvirjiPage({
    searchParams,
}: OkvirjiPageProps) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const parametri = await searchParams;
    const iskanje = parametri.iskanje?.trim() ?? "";

    const zahtevanaStran = Number(parametri.stran ?? "1");
    const trenutnaStran =
        Number.isInteger(zahtevanaStran) && zahtevanaStran > 0
            ? zahtevanaStran
            : 1;

    const od = (trenutnaStran - 1) * zapisovNaStran;
    const doVkljucno = od + zapisovNaStran - 1;

    let poizvedba = supabase
        .from("okvir")
        .select(
            `
        id,
        vzorec,
        oznaka,
        sirina,
        prodajna_cena,
        nabavna_cena,
        na_prodaj,
        barva:barva_id (
          naziv
        ),
        dobavitelj:dobavitelj_id (
          naziv
        )
      `,
            {
                count: "exact",
            },
        )
        .order("vzorec")
        .range(od, doVkljucno);

    if (iskanje) {
        poizvedba = poizvedba.ilike("vzorec", `%${iskanje}%`);
    }

    const {
        data: okvirji,
        error,
        count,
    } = await poizvedba;

    const steviloZapisov = count ?? 0;

    const steviloStrani = Math.max(
        1,
        Math.ceil(steviloZapisov / zapisovNaStran),
    );

    function povezavaZaStran(stran: number) {
        const poizvedbeniParametri = new URLSearchParams();

        if (iskanje) {
            poizvedbeniParametri.set("iskanje", iskanje);
        }

        poizvedbeniParametri.set("stran", String(stran));

        return `/materiali/okvirji?${poizvedbeniParametri.toString()}`;
    }

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Materiali
                        </p>

                        <h1 className="text-xl font-bold text-slate-900">
                            Okvirji
                        </h1>
                    </div>

                    <Link
                        href="/materiali"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Nazaj na katalog
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            Pregled okvirjev
                        </h2>

                        <p className="mt-2 text-slate-600">
                            V katalogu je {steviloZapisov} okvirjev.
                        </p>
                    </div>

                    <Link
                        href="/materiali/okvirji/nov"
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-slate-700"
                    >
                        Dodaj okvir
                    </Link>
                </div>

                <form
                    method="get"
                    className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
                >
                    <input
                        name="iskanje"
                        type="search"
                        defaultValue={iskanje}
                        placeholder="Poišči po vzorcu, oznaki ali barvi"
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white"
                    >
                        Poišči
                    </button>

                    {iskanje && (
                        <Link
                            href="/materiali/okvirji"
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-center font-medium text-slate-700"
                        >
                            Počisti
                        </Link>
                    )}
                </form>

                {error ? (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
                    >
                        Okvirjev ni bilo mogoče naložiti.
                    </div>
                ) : okvirji.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <h3 className="font-semibold text-slate-900">
                            Ni najdenih okvirjev
                        </h3>
                    </div>
                ) : (
                    <>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                Vzorec
                                            </th>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                Barva
                                            </th>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                Širina
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                Prodajna cena
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                Nabavna cena
                                            </th>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                Dobavitelj
                                            </th>
                                            <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                Dejanja
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200">
                                        {okvirji.map((okvir) => (
                                            <tr key={okvir.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">
                                                        {okvir.vzorec}
                                                    </p>

                                                    {okvir.oznaka && (
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {okvir.oznaka}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-700">
                                                    {okvir.barva?.naziv ?? "—"}
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-700">
                                                    {okvir.sirina !== null
                                                        ? `${okvir.sirina} cm`
                                                        : "—"}
                                                </td>

                                                <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                                                    {oblikujCeno(okvir.prodajna_cena)}/m
                                                </td>

                                                <td className="px-4 py-3 text-right text-sm text-slate-600">
                                                    {oblikujCeno(okvir.nabavna_cena)}
                                                </td>

                                                <td className="px-4 py-3 text-sm text-slate-700">
                                                    {okvir.dobavitelj?.naziv ?? "—"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={
                                                            okvir.na_prodaj
                                                                ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                                                                : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
                                                        }
                                                    >
                                                        {okvir.na_prodaj
                                                            ? "Na prodaj"
                                                            : "Neaktiven"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={`/materiali/okvirji/${okvir.id}/uredi`}
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Uredi
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <nav className="mt-6 flex items-center justify-between gap-4">
                            {trenutnaStran > 1 ? (
                                <Link
                                    href={povezavaZaStran(trenutnaStran - 1)}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700"
                                >
                                    ← Prejšnja
                                </Link>
                            ) : (
                                <span />
                            )}

                            <p className="text-sm text-slate-600">
                                Stran {trenutnaStran} od {steviloStrani}
                            </p>

                            {trenutnaStran < steviloStrani ? (
                                <Link
                                    href={povezavaZaStran(trenutnaStran + 1)}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700"
                                >
                                    Naslednja →
                                </Link>
                            ) : (
                                <span />
                            )}
                        </nav>
                    </>
                )}
            </section>
        </main>
    );
}