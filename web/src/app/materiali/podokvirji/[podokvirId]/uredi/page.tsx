import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { urediPodokvir } from "./actions";

type UrediPodokvirPageProps = {
    params: Promise<{
        podokvirId: string;
    }>;

    searchParams: Promise<{
        napaka?: string;
    }>;
};

export default async function UrediPodokvirPage({
    params,
    searchParams,
}: UrediPodokvirPageProps) {
    const { podokvirId: podokvirIdBesedilo } =
        await params;

    const { napaka } = await searchParams;
    const podokvirId = Number(podokvirIdBesedilo);

    if (!Number.isInteger(podokvirId) || podokvirId <= 0) {
        notFound();
    }

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { data: podokvir, error } = await supabase
        .from("podokvir")
        .select(`
      id,
      dolzina,
      cena_na_meter,
      cena_na_podokvir,
      na_prodaj
    `)
        .eq("id", podokvirId)
        .maybeSingle();

    if (error || !podokvir) {
        notFound();
    }

    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Preveri dolžino in vnesene cene."
            : napaka === "shranjevanje"
                ? "Sprememb podokvirja ni bilo mogoče shraniti."
                : null;

    const inputClassName =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

    const shraniPodokvir = urediPodokvir.bind(
        null,
        podokvir.id,
    );

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Materiali · Podokvirji
                        </p>

                        <h1 className="text-xl font-bold text-slate-900">
                            Uredi podokvir
                        </h1>
                    </div>

                    <Link
                        href="/materiali/podokvirji"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Prekliči
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-4xl px-6 py-10">
                <form
                    action={shraniPodokvir}
                    className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Podatki podokvirja
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Spremeni dolžino, cene ali stanje podokvirja.
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

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="dolzina"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Dolžina (cm) *
                            </label>

                            <input
                                id="dolzina"
                                name="dolzina"
                                type="number"
                                required
                                min="0.01"
                                max="10000"
                                step="0.01"
                                defaultValue={podokvir.dolzina ?? ""}
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="cenaNaMeter"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Cena na meter (€)
                            </label>

                            <input
                                id="cenaNaMeter"
                                name="cenaNaMeter"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={podokvir.cena_na_meter ?? ""}
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="cenaNaPodokvir"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Cena na podokvir (€)
                            </label>

                            <input
                                id="cenaNaPodokvir"
                                name="cenaNaPodokvir"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={
                                    podokvir.cena_na_podokvir ?? ""
                                }
                                className={inputClassName}
                            />
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                            <input
                                name="naProdaj"
                                type="checkbox"
                                defaultChecked={podokvir.na_prodaj}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                            />

                            <span>
                                <span className="block text-sm font-semibold text-slate-900">
                                    Podokvir je na prodaj
                                </span>

                                <span className="mt-1 block text-sm text-slate-600">
                                    Aktivni podokvir bo na voljo pri sestavi postavke.
                                </span>
                            </span>
                        </label>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                        <Link
                            href="/materiali/podokvirji"
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Prekliči
                        </Link>

                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-700"
                        >
                            Shrani spremembe
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}