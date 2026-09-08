import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default function RacunDeaktiviranPage() {
    async function odjava() {
        "use server";

        const supabase = await createClient();
        await supabase.auth.signOut();

        redirect("/prijava");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
            <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">
                    !
                </div>

                <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Okviri V
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                    Račun ni aktiven
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                    Dostop do aplikacije je deaktiviran. Za ponovno
                    aktivacijo se obrni na administratorja.
                </p>

                <form action={odjava} className="mt-7">
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700"
                    >
                        Nazaj na prijavo
                    </button>
                </form>
            </section>
        </main>
    );
}