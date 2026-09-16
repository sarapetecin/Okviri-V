import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { urediDobavitelja } from "./actions";

type PageProps = {
    params: Promise<{ dobaviteljId: string }>;
    searchParams: Promise<{ napaka?: string }>;
};

export default async function UrediDobaviteljaPage({
    params,
    searchParams,
}: PageProps) {
    const { dobaviteljId: idBesedilo } = await params;
    const dobaviteljId = Number(idBesedilo);

    if (!Number.isInteger(dobaviteljId) || dobaviteljId <= 0) {
        notFound();
    }

    const supabase = await createClient();
    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { data: dobavitelj, error } = await supabase
        .from("dobavitelj")
        .select(
            "id, naziv, kratica, telefonska_stevilka, email, naslov, spletna_stran",
        )
        .eq("id", dobaviteljId)
        .maybeSingle();

    if (error || !dobavitelj) {
        notFound();
    }

    const { napaka } = await searchParams;
    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Preveri naziv in e-poštni naslov."
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
                            Materiali · Dobavitelji
                        </p>
                        <h1 className="text-xl font-bold text-slate-900">
                            Uredi dobavitelja
                        </h1>
                    </div>
                    <Link href="/materiali/dobavitelji" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Prekliči
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-4xl px-6 py-10">
                <form action={urediDobavitelja.bind(null, dobavitelj.id)} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <h2 className="mb-7 text-2xl font-bold text-slate-900">
                        Podatki dobavitelja
                    </h2>

                    {sporociloNapake && (
                        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {sporociloNapake}
                        </div>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="naziv" className="mb-2 block text-sm font-medium text-slate-700">Naziv *</label>
                            <input id="naziv" name="naziv" required maxLength={200} defaultValue={dobavitelj.naziv} className={inputClassName} />
                        </div>
                        <div>
                            <label htmlFor="kratica" className="mb-2 block text-sm font-medium text-slate-700">Kratica</label>
                            <input id="kratica" name="kratica" defaultValue={dobavitelj.kratica ?? ""} className={inputClassName} />
                        </div>
                        <div>
                            <label htmlFor="telefonskaStevilka" className="mb-2 block text-sm font-medium text-slate-700">Telefonska številka</label>
                            <input id="telefonskaStevilka" name="telefonskaStevilka" type="tel" defaultValue={dobavitelj.telefonska_stevilka ?? ""} className={inputClassName} />
                        </div>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">E-poštni naslov</label>
                            <input id="email" name="email" type="email" defaultValue={dobavitelj.email ?? ""} className={inputClassName} />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="naslov" className="mb-2 block text-sm font-medium text-slate-700">Naslov</label>
                            <input id="naslov" name="naslov" defaultValue={dobavitelj.naslov ?? ""} className={inputClassName} />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="spletnaStran" className="mb-2 block text-sm font-medium text-slate-700">Spletna stran</label>
                            <input id="spletnaStran" name="spletnaStran" type="url" defaultValue={dobavitelj.spletna_stran ?? ""} className={inputClassName} />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                        <Link href="/materiali/dobavitelji" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
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
