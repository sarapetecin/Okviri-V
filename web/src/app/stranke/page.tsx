import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function StrankePage() {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { data: stranke, error } = await supabase
        .from("stranka")
        .select(
            "id, naziv, telefonska_stevilka, email, davcni_zavezanec, davcna_stevilka",
        )
        .order("naziv");

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Okviri V
                        </p>
                        <h1 className="text-xl font-bold text-slate-900">
                            Stranke
                        </h1>
                    </div>

                    <Link
                        href="/"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Nazaj na nadzorno ploščo
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            Seznam strank
                        </h2>
                        <p className="mt-2 text-slate-600">
                            Pregled vseh strank v sistemu.
                        </p>
                    </div>

                    <Link
                        href="/stranke/nova"
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-slate-700"
                    >
                        Nova stranka
                    </Link>
                </div>

                {error ? (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
                    >
                        Strank ni bilo mogoče naložiti.
                    </div>
                ) : stranke.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Ni vnesenih strank
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Prvo stranko bomo dodali v naslednjem koraku.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Naziv
                                        </th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Telefon
                                        </th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            E-pošta
                                        </th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Davčni zavezanec
                                        </th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                            Davčna številka
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200">
                                    {stranke.map((stranka) => (
                                        <tr key={stranka.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4 font-medium text-slate-900">
                                                {stranka.naziv}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {stranka.telefonska_stevilka ?? "—"}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {stranka.email ?? "—"}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {stranka.davcni_zavezanec ? "Da" : "Ne"}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {stranka.davcna_stevilka ?? "—"}
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