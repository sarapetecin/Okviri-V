import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { spremeniPrvoGeslo } from "./actions";

type SpremeniGesloPageProps = {
    searchParams: Promise<{
        napaka?: string;
    }>;
};

export default async function SpremeniGesloPage({
    searchParams,
}: SpremeniGesloPageProps) {
    const { napaka } = await searchParams;
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    const authUserId = podatkiZetona?.claims?.sub;

    if (napakaZetona || !authUserId) {
        redirect("/prijava");
    }

    const { data: profil, error: napakaProfila } =
        await supabase
            .from("uporabnik")
            .select("aktiven, mora_spremeniti_geslo")
            .eq("auth_user_id", authUserId)
            .maybeSingle();

    if (napakaProfila || !profil) {
        redirect("/prijava?napaka=profil");
    }

    if (!profil.aktiven) {
        redirect("/racun-deaktiviran");
    }

    if (!profil.mora_spremeniti_geslo) {
        redirect("/");
    }

    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Geslo mora imeti najmanj 12 znakov, obe gesli pa se morata ujemati."
            : napaka === "sprememba-gesla"
                ? "Gesla ni bilo mogoče spremeniti."
                : napaka === "zakljucek"
                    ? "Geslo je bilo spremenjeno, vendar postopka ni bilo mogoče zaključiti. Poskusi ponovno."
                    : null;

    const inputClassName =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
            <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-7">
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Okviri V
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-slate-900">
                        Spremeni začasno geslo
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Pred nadaljevanjem nastavi svoje novo geslo.
                        Začasno geslo po spremembi ne bo več veljalo.
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

                <form action={spremeniPrvoGeslo}>
                    <div>
                        <label
                            htmlFor="novoGeslo"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Novo geslo *
                        </label>

                        <input
                            id="novoGeslo"
                            name="novoGeslo"
                            type="password"
                            required
                            minLength={12}
                            maxLength={200}
                            autoComplete="new-password"
                            autoFocus
                            className={inputClassName}
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Geslo mora imeti najmanj 12 znakov.
                        </p>
                    </div>

                    <div className="mt-5">
                        <label
                            htmlFor="ponoviGeslo"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Ponovi novo geslo *
                        </label>

                        <input
                            id="ponoviGeslo"
                            name="ponoviGeslo"
                            type="password"
                            required
                            minLength={12}
                            maxLength={200}
                            autoComplete="new-password"
                            className={inputClassName}
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-7 w-full rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700"
                    >
                        Spremeni geslo in nadaljuj
                    </button>
                </form>
            </section>
        </main>
    );
}