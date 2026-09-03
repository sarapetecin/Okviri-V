import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function oblikujCeno(znesek: number | null, enota = "") {
    if (znesek === null) {
        return "—";
    }

    const cena = new Intl.NumberFormat("sl-SI", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(znesek);

    return `${cena} €${enota}`;
}

function oblikujDolzino(dolzina: number | null) {
    if (dolzina === null) {
        return "—";
    }

    return `${new Intl.NumberFormat("sl-SI").format(dolzina)} cm`;
}

type PodokvirjiPageProps = {
    searchParams: Promise<{
        iskanje?: string;
    }>;
};

export default async function PodokvirjiPage({
    searchParams,
}: PodokvirjiPageProps) {
    const { iskanje = "" } = await searchParams;
    const iskaniNiz = iskanje.trim();

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    let poizvedba = supabase
        .from("podokvir")
        .select(`
      id,
      dolzina,
      cena_na_meter,
      cena_na_podokvir,
      na_prodaj
    `)
        .order("dolzina");

    if (iskaniNiz) {
        const iskanaDolzina = Number(
            iskaniNiz.replace(",", "."),
        );

        if (Number.isFinite(iskanaDolzina)) {
            poizvedba = poizvedba.eq(
                "dolzina",
                iskanaDolzina,
            );
        }
    }

    const { data: podokvirji, error } = await poizvedba;

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Materiali
                        </p>

                        <h1 className="text-xl font-bold text-slate-900">
                            Podokvirji
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
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            Pregled podokvirjev
                        </h2>

                        <p className="mt-2 text-slate-600">
                            V katalogu je {podokvirji?.length ?? 0} podokvirjev.
                        </p>
                    </div>

                    <Link
                        href="/materiali/podokvirji/nov"
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-slate-700"
                    >
                        Dodaj podokvir
                    </Link>
                </div>

                <form className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            name="iskanje"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={iskaniNiz}
                            placeholder="Poišči po dolžini v centimetrih"
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                        />

                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700"
                        >
                            Poišči
                        </button>

                        {iskaniNiz && (
                            <Link
                                href="/materiali/podokvirji"
                                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-center font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Počisti
                            </Link>
                        )}
                    </div>
                </form>

                {error ? (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
                    >
                        Podokvirjev ni bilo mogoče naložiti.
                    </div>
                ) : podokvirji?.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Ni najdenih podokvirjev
                        </h3>

                        <p className="mt-2 text-sm text-slate-600">
                            Poskusi z drugo dolžino.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Dolžina
                                        </th>

                                        <th className="px-5 py-3 text-right text-sm font-semibold text-slate-700">
                                            Cena na meter
                                        </th>

                                        <th className="px-5 py-3 text-right text-sm font-semibold text-slate-700">
                                            Cena podokvirja
                                        </th>

                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right text-sm font-semibold text-slate-700">
                                            Dejanja
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200">
                                    {(podokvirji ?? []).map((podokvir) => (
                                        <tr
                                            key={podokvir.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 font-medium text-slate-900">
                                                {oblikujDolzino(podokvir.dolzina)}
                                            </td>

                                            <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                                                {oblikujCeno(
                                                    podokvir.cena_na_meter,
                                                    "/m",
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-right text-sm text-slate-700">
                                                {oblikujCeno(
                                                    podokvir.cena_na_podokvir,
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={
                                                        podokvir.na_prodaj
                                                            ? "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                                                            : "inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                                                    }
                                                >
                                                    {podokvir.na_prodaj
                                                        ? "Na prodaj"
                                                        : "Ni na prodaj"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/materiali/podokvirji/${podokvir.id}/uredi`}
                                                    className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
                )}
            </section>
        </main>
    );
}