import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { izbrisiMaterial } from "../actions";
import { GumbIzbrisiMaterial } from "../gumb-izbrisi-material";

type PageProps = {
    searchParams: Promise<{
        iskanje?: string;
        napaka?: string;
        uspeh?: string;
    }>;
};

export default async function DobaviteljiPage({
    searchParams,
}: PageProps) {
    const {
        iskanje = "",
        napaka,
        uspeh,
    } = await searchParams;
    const iskaniNiz = iskanje.trim();
    const supabase = await createClient();
    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    let poizvedba = supabase
        .from("dobavitelj")
        .select("id, naziv, kratica, telefonska_stevilka, email, naslov, spletna_stran")
        .order("naziv");

    if (iskaniNiz) {
        const varnoIskanje = iskaniNiz.replaceAll(",", " ");
        poizvedba = poizvedba.or(
            `naziv.ilike.%${varnoIskanje}%,kratica.ilike.%${varnoIskanje}%`,
        );
    }

    const { data: dobavitelji, error } = await poizvedba;

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Materiali</p>
                        <h1 className="text-xl font-bold text-slate-900">Dobavitelji</h1>
                    </div>
                    <Link href="/materiali" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Nazaj na katalog</Link>
                </div>
            </header>
            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-7">
                    <h2 className="text-3xl font-bold text-slate-900">Pregled dobaviteljev</h2>
                    <p className="mt-2 text-slate-600">V katalogu je {dobavitelji?.length ?? 0} dobaviteljev.</p>
                </div>

                {napaka === "brisanje" && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Dobavitelja ni bilo mogoče izbrisati.</div>}
                {(uspeh === "izbrisano" || uspeh === "posodobljeno") && (
                    <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                        {uspeh === "izbrisano"
                            ? "Dobavitelj je bil izbrisan."
                            : "Dobavitelj je bil posodobljen."}
                    </div>
                )}

                <form className="mb-6 flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <input name="iskanje" type="search" defaultValue={iskaniNiz} placeholder="Poišči dobavitelja" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200" />
                    <button type="submit" className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white">Poišči</button>
                </form>

                {error ? (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">Dobaviteljev ni bilo mogoče naložiti.</div>
                ) : dobavitelji?.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">Ni najdenih dobaviteljev.</div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">Naziv</th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">Telefon</th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">E-pošta</th>
                                        <th className="px-5 py-3 text-sm font-semibold text-slate-700">Naslov</th>
                                        <th className="px-5 py-3 text-right text-sm font-semibold text-slate-700">Dejanja</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {(dobavitelji ?? []).map((dobavitelj) => (
                                        <tr key={dobavitelj.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-900">{dobavitelj.naziv}</p>
                                                <p className="text-xs text-slate-500">{dobavitelj.kratica ?? "Brez kratice"}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">{dobavitelj.telefonska_stevilka ?? "—"}</td>
                                            <td className="px-5 py-4 text-sm text-slate-600">{dobavitelj.email ?? "—"}</td>
                                            <td className="px-5 py-4 text-sm text-slate-600">{dobavitelj.naslov ?? "—"}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/materiali/dobavitelji/${dobavitelj.id}/uredi`}
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Uredi
                                                    </Link>
                                                    <GumbIzbrisiMaterial naziv={dobavitelj.naziv} action={izbrisiMaterial.bind(null, "dobavitelj", dobavitelj.id)} />
                                                </div>
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
