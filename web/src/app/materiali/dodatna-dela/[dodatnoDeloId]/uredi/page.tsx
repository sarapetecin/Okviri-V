import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { urediDodatnoDelo } from "./actions";

type PageProps = {
    params: Promise<{ dodatnoDeloId: string }>;
    searchParams: Promise<{ napaka?: string }>;
};

export default async function UrediDodatnoDeloPage({
    params,
    searchParams,
}: PageProps) {
    const { dodatnoDeloId: idBesedilo } = await params;
    const deloId = Number(idBesedilo);

    if (!Number.isInteger(deloId) || deloId <= 0) {
        notFound();
    }

    const supabase = await createClient();
    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { data: delo, error } = await supabase
        .from("dodatna_dela")
        .select("id, naziv, cena, cena_na_m, cena_na_m2, na_prodaj")
        .eq("id", deloId)
        .maybeSingle();

    if (error || !delo) {
        notFound();
    }

    const { napaka } = await searchParams;
    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Preveri naziv in vnesene cene."
            : napaka === "shranjevanje"
              ? "Sprememb ni bilo mogoče shraniti."
              : null;
    const inputClassName =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Materiali · Dodatna dela
                        </p>
                        <h1 className="text-xl font-bold text-slate-900">
                            Uredi dodatno delo
                        </h1>
                    </div>
                    <Link href="/materiali/dodatna-dela" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Prekliči
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-4xl px-6 py-10">
                <form action={urediDodatnoDelo.bind(null, delo.id)} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Podatki dodatnega dela
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Vnesi samo načine obračuna, ki se uporabljajo.
                        </p>
                    </div>

                    {sporociloNapake && (
                        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {sporociloNapake}
                        </div>
                    )}

                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="sm:col-span-3">
                            <label htmlFor="naziv" className="mb-2 block text-sm font-medium text-slate-700">
                                Naziv *
                            </label>
                            <input id="naziv" name="naziv" required maxLength={200} autoFocus defaultValue={delo.naziv} className={inputClassName} />
                        </div>
                        <div>
                            <label htmlFor="cena" className="mb-2 block text-sm font-medium text-slate-700">
                                Cena na kos (€)
                            </label>
                            <input id="cena" name="cena" type="number" min="0" step="0.01" defaultValue={delo.cena ?? ""} className={inputClassName} />
                        </div>
                        <div>
                            <label htmlFor="cenaNaMeter" className="mb-2 block text-sm font-medium text-slate-700">
                                Cena na meter (€)
                            </label>
                            <input id="cenaNaMeter" name="cenaNaMeter" type="number" min="0" step="0.01" defaultValue={delo.cena_na_m ?? ""} className={inputClassName} />
                        </div>
                        <div>
                            <label htmlFor="cenaNaM2" className="mb-2 block text-sm font-medium text-slate-700">
                                Cena na m² (€)
                            </label>
                            <input id="cenaNaM2" name="cenaNaM2" type="number" min="0" step="0.01" defaultValue={delo.cena_na_m2 ?? ""} className={inputClassName} />
                        </div>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-3">
                            <input name="naProdaj" type="checkbox" defaultChecked={delo.na_prodaj} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
                            <span>
                                <span className="block text-sm font-semibold text-slate-900">
                                    Dodatno delo je na prodaj
                                </span>
                                <span className="mt-1 block text-sm text-slate-600">
                                    Aktivno delo je na voljo pri sestavi postavke.
                                </span>
                            </span>
                        </label>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                        <Link href="/materiali/dodatna-dela" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
                            Prekliči
                        </Link>
                        <button type="submit" className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-700">
                            Shrani spremembe
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
