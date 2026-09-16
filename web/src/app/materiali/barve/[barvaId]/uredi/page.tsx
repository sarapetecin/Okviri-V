import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { urediBarvo } from "./actions";

type PageProps = {
    params: Promise<{ barvaId: string }>;
    searchParams: Promise<{ napaka?: string }>;
};

export default async function UrediBarvoPage({
    params,
    searchParams,
}: PageProps) {
    const { barvaId: idBesedilo } = await params;
    const barvaId = Number(idBesedilo);

    if (!Number.isInteger(barvaId) || barvaId <= 0) {
        notFound();
    }

    const supabase = await createClient();
    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { data: barva, error } = await supabase
        .from("barva")
        .select("id, naziv")
        .eq("id", barvaId)
        .maybeSingle();

    if (error || !barva) {
        notFound();
    }

    const { napaka } = await searchParams;
    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Vnesi veljaven naziv barve."
            : napaka === "shranjevanje"
              ? "Sprememb ni bilo mogoče shraniti. Naziv morda že obstaja."
              : null;

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Materiali · Barve
                        </p>
                        <h1 className="text-xl font-bold text-slate-900">
                            Uredi barvo
                        </h1>
                    </div>
                    <Link href="/materiali/barve" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Prekliči
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-3xl px-6 py-10">
                <form action={urediBarvo.bind(null, barva.id)} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <h2 className="mb-7 text-2xl font-bold text-slate-900">
                        Podatki barve
                    </h2>

                    {sporociloNapake && (
                        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {sporociloNapake}
                        </div>
                    )}

                    <label htmlFor="naziv" className="mb-2 block text-sm font-medium text-slate-700">
                        Naziv *
                    </label>
                    <input id="naziv" name="naziv" required maxLength={100} autoFocus defaultValue={barva.naziv} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200" />

                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                        <Link href="/materiali/barve" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
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
