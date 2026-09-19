"use client";

import { useFormStatus } from "react-dom";

type StatusDokumenta =
    | "osnutek"
    | "poslano_v_pregled"
    | "zavrnjeno"
    | "potrjeno"
    | "v_izdelavi"
    | "dokoncano"
    | "rocno_zaprto"
    | "preklicano";

type VrstaDokumenta = "ponudba" | "narocilo";

type GumbiStatusaProps = {
    status: StatusDokumenta;
    vrsta: VrstaDokumenta;
    jePartner: boolean;
    action: (formData: FormData) => void | Promise<void>;
};

type StatusniGumb = {
    status: StatusDokumenta;
    naziv: string;
    nevaren?: boolean;
    opozorilo?: string;
};

function StatusniGumb({
    naziv,
    nevaren = false,
}: {
    naziv: string;
    nevaren?: boolean;
}) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={
                nevaren
                    ? "rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    : "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            }
        >
            {pending ? "Shranjujem ..." : naziv}
        </button>
    );
}

export function GumbiStatusa({
    status,
    vrsta,
    action,
}: GumbiStatusaProps) {
    const gumbi: StatusniGumb[] = [];

    const jeDokumentZakljucen =
        status === "dokoncano" ||
        status === "preklicano" ||
        status === "rocno_zaprto";

    if (!jeDokumentZakljucen) {
        if (vrsta === "ponudba") {
            gumbi.push({
                status: "potrjeno",
                naziv: "Ponudba → naročilo",
                opozorilo:
                    "Ponudba se bo spremenila v naročilo. Ali želiš nadaljevati?",
            });
        }

        if (vrsta === "narocilo") {
            gumbi.push({
                status: "dokoncano",
                naziv: "Dokončano",
                opozorilo:
                    "Naročilo bo označeno kot dokončano. Ali želiš nadaljevati?",
            });

            gumbi.push({
                status: "preklicano",
                naziv: "Ročno zapri naročilo",
                nevaren: true,
                opozorilo:
                    "Preklicanega naročila ne bo mogoče nadaljevati. Ali želiš nadaljevati?",
            });
        }
    }
    return (
        <div className="flex flex-wrap gap-3">
            {gumbi.map((gumb) => (
                <form
                    key={`${gumb.status}-${gumb.naziv}`}
                    action={action}
                    onSubmit={(dogodek) => {
                        if (
                            gumb.opozorilo &&
                            !window.confirm(gumb.opozorilo)
                        ) {
                            dogodek.preventDefault();
                        }
                    }}
                >
                    <input
                        type="hidden"
                        name="noviStatus"
                        value={gumb.status}
                    />

                    <StatusniGumb
                        naziv={gumb.naziv}
                        nevaren={gumb.nevaren}
                    />
                </form>
            ))}
        </div>
    );
}