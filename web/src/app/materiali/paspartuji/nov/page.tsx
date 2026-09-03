import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ustvariPaspartu } from "./actions";

type NovPaspartuPageProps = {
    searchParams: Promise<{
        napaka?: string;
    }>;
};

export default async function NovPaspartuPage({
    searchParams,
}: NovPaspartuPageProps) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { data: dobavitelji, error: napakaDobaviteljev } =
        await supabase
            .from("dobavitelj")
            .select("id, naziv")
            .order("naziv");

    const { napaka } = await searchParams;

    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Preveri naziv in vnesene cene."
            : napaka === "shranjevanje"
                ? "Paspartuja ni bilo mogoče shraniti."
                : null;

    const inputClassName =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Materiali · Paspartuji
                        </p>

                        <h1 className="text-xl font-bold text-slate-900">
                            Nov paspartu
                        </h1>
                    </div>

                    <Link
                        href="/materiali/paspartuji"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Prekliči
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-4xl px-6 py-10">
                <form
                    action={ustvariPaspartu}
                    className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Podatki paspartuja
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Prodajna cena je cena na kvadratni meter.
                        </p>
                    </div>

                    {sporociloNapake && (
                        <div
                            role="alert"
                            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {sporociloNapake}
                        </div>
                    )}

                    {napakaDobaviteljev && (
                        <div
                            role="alert"
                            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                        >
                            Dobaviteljev ni bilo mogoče naložiti.
                        </div>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="oznaka"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Oznaka
                            </label>

                            <input
                                id="oznaka"
                                name="oznaka"
                                type="text"
                                placeholder="Na primer: 086224"
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="barva"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Barva
                            </label>

                            <input
                                id="barva"
                                name="barva"
                                type="text"
                                placeholder="Na primer: Bež"
                                className={inputClassName}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="naziv"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Naziv *
                            </label>

                            <input
                                id="naziv"
                                name="naziv"
                                type="text"
                                required
                                placeholder="Naziv paspartuja"
                                className={inputClassName}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="dodatniOpis"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Dodatni opis
                            </label>

                            <textarea
                                id="dodatniOpis"
                                name="dodatniOpis"
                                rows={3}
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="prodajnaCena"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Prodajna cena na m² (€) *
                            </label>

                            <input
                                id="prodajnaCena"
                                name="prodajnaCena"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="nabavnaCena"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Nabavna cena (€)
                            </label>

                            <input
                                id="nabavnaCena"
                                name="nabavnaCena"
                                type="number"
                                min="0"
                                step="0.01"
                                className={inputClassName}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="dobaviteljId"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Dobavitelj
                            </label>

                            <select
                                id="dobaviteljId"
                                name="dobaviteljId"
                                defaultValue=""
                                className={inputClassName}
                            >
                                <option value="">Brez dobavitelja</option>

                                {(dobavitelji ?? []).map((dobavitelj) => (
                                    <option
                                        key={dobavitelj.id}
                                        value={dobavitelj.id}
                                    >
                                        {dobavitelj.naziv}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                            <input
                                name="naProdaj"
                                type="checkbox"
                                defaultChecked
                                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                            />

                            <span>
                                <span className="block text-sm font-semibold text-slate-900">
                                    Paspartu je na prodaj
                                </span>

                                <span className="mt-1 block text-sm text-slate-600">
                                    Aktivni paspartu bo na voljo pri sestavi postavke.
                                </span>
                            </span>
                        </label>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                        <Link
                            href="/materiali/paspartuji"
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Prekliči
                        </Link>

                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-700"
                        >
                            Shrani paspartu
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}