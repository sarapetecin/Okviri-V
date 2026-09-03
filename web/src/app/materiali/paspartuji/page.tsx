import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type PaspartujiPageProps = {
    searchParams: Promise<{
        iskanje?: string;
    }>;
};

function oblikujCeno(cena: number | null) {
    if (cena === null) {
        return "—";
    }

    return new Intl.NumberFormat("sl-SI", {
        style: "currency",
        currency: "EUR",
    }).format(cena);
}

export default async function PaspartujiPage({
    searchParams,
}: PaspartujiPageProps) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { iskanje: iskalniParameter } = await searchParams;
    const iskanje = iskalniParameter?.trim() ?? "";

    let poizvedba = supabase
        .from("paspartu")
        .select(
            `
        id,
        oznaka,
        naziv,
        barva,
        dodatni_opis,
        prodajna_cena,
        nabavna_cena,
        na_prodaj,
        dobavitelj:dobavitelj_id (
          naziv
        )
      `,
        )
        .order("oznaka");

    if (iskanje) {
        poizvedba = poizvedba.ilike("naziv", `%${iskanje}%`);
    }

    const { data: paspartuji, error } = await poizvedba;

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Materiali
                        </p>

                        <h1 className="text-xl font-bold text-slate-900">
                            Paspartuji
                        </h1>
                    </div>

                    <Link
                        href="/materiali"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Nazaj na katalog
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            Pregled paspartujev
                        </h2>

                        <p className="mt-2 text-slate-600">
                            Prikazanih je {paspartuji?.length ?? 0} zapisov.
                        </p>
                    </div>

                    <Link
                        href="/materiali/paspartuji/nov"
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-center font-semibold text-white hover:bg-slate-700"
                    >
                        Dodaj paspartu
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
                        placeholder="Poišči paspartu"
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white"
                    >
                        Poišči
                    </button>

                    {iskanje && (
                        <Link
                            href="/materiali/paspartuji"
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-center font-medium text-slate-700"
                        >
                            Počisti
                        </Link>
                    )}
                </form>

                {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                        Paspartujev ni bilo mogoče naložiti.
                    </div>
                ) : paspartuji.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        Ni najdenih paspartujev.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                            Oznaka
                                        </th>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                            Naziv
                                        </th>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                            Barva
                                        </th>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                            Opis
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
                                    {paspartuji.map((paspartu) => (
                                        <tr key={paspartu.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                {paspartu.oznaka ?? "—"}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-slate-900">
                                                {paspartu.naziv}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                {paspartu.barva ?? "—"}
                                            </td>

                                            <td className="max-w-xs px-4 py-3 text-sm text-slate-600">
                                                {paspartu.dodatni_opis ?? "—"}
                                            </td>

                                            <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                                                {oblikujCeno(paspartu.prodajna_cena)}/m²
                                            </td>

                                            <td className="px-4 py-3 text-right text-sm text-slate-600">
                                                {oblikujCeno(paspartu.nabavna_cena)}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                {paspartu.dobavitelj?.naziv ?? "—"}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={
                                                        paspartu.na_prodaj
                                                            ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                                                            : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
                                                    }
                                                >
                                                    {paspartu.na_prodaj
                                                        ? "Na prodaj"
                                                        : "Neaktiven"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/materiali/paspartuji/${paspartu.id}/uredi`}
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
                )}
            </section>
        </main>
    );
}