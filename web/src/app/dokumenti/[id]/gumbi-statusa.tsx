"use client";

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

export function GumbiStatusa({
    status,
    vrsta,
    jePartner,
    action,
}: GumbiStatusaProps) {
    const gumbi: StatusniGumb[] = [];

    if (jePartner) {
        if (
            vrsta === "ponudba" &&
            (status === "osnutek" || status === "zavrnjeno")
        ) {
            gumbi.push({
                status: "poslano_v_pregled",
                naziv:
                    status === "zavrnjeno"
                        ? "Ponovno pošlji v pregled"
                        : "Pošlji v pregled",
            });
        }

        if (
            vrsta === "ponudba" &&
            status === "poslano_v_pregled"
        ) {
            gumbi.push({
                status: "osnutek",
                naziv: "Umakni iz pregleda",
                nevaren: true,
                opozorilo:
                    "Ponudba se bo vrnila v osnutek. Nato jo boš lahko ponovno urejal. Ali želiš nadaljevati?",
            });
        }
    } else {
        if (status === "osnutek") {
            if (vrsta === "ponudba") {
                gumbi.push({
                    status: "poslano_v_pregled",
                    naziv: "Pošlji v pregled",
                });

                gumbi.push({
                    status: "potrjeno",
                    naziv: "Potrdi ponudbo",
                    opozorilo:
                        "Ponudba se bo spremenila v naročilo. Ali želiš nadaljevati?",
                });
            } else {
                gumbi.push({
                    status: "potrjeno",
                    naziv: "Potrdi naročilo",
                });
            }
        }

        if (status === "poslano_v_pregled") {
            gumbi.push({
                status: "potrjeno",
                naziv: "Potrdi ponudbo",
                opozorilo:
                    "Ponudba se bo spremenila v naročilo. Ali želiš nadaljevati?",
            });

            gumbi.push({
                status: "zavrnjeno",
                naziv: "Zavrni ponudbo",
                nevaren: true,
                opozorilo: "Ali želiš zavrniti ponudbo?",
            });
        }

        if (status === "zavrnjeno") {
            gumbi.push({
                status: "osnutek",
                naziv: "Vrni v osnutek",
            });
        }

        if (
            status === "potrjeno" ||
            status === "v_izdelavi"
        ) {
            gumbi.push({
                status: "dokoncano",
                naziv: "Označi kot dokončano",
                opozorilo:
                    "Dokument bo označen kot dokončan. SMS se v tej fazi še ne bo poslal.",
            });

            gumbi.push({
                status: "rocno_zaprto",
                naziv: "Ročno zapri",
                nevaren: true,
                opozorilo:
                    "Naročilo bo zaprto brez SMS-obvestila. Ali želiš nadaljevati?",
            });
        }

        if (
            status !== "dokoncano" &&
            status !== "rocno_zaprto" &&
            status !== "preklicano"
        ) {
            gumbi.push({
                status: "preklicano",
                naziv: "Prekliči dokument",
                nevaren: true,
                opozorilo:
                    "Preklicanega dokumenta ne bo mogoče nadaljevati. Ali želiš nadaljevati?",
            });
        }
    }

    if (gumbi.length === 0) {
        return (
            <p className="text-sm text-slate-500">
                {jePartner
                    ? "Ponudbe ni več mogoče spreminjati."
                    : "Dokument je zaključen."}
            </p>
        );
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

                    <button
                        type="submit"
                        className={
                            gumb.nevaren
                                ? "rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                : "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                        }
                    >
                        {gumb.naziv}
                    </button>
                </form>
            ))}
        </div>
    );
}