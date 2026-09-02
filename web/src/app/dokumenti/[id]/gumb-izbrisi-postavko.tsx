"use client";

import { useFormStatus } from "react-dom";

type GumbIzbrisiPostavkoProps = {
    action: () => Promise<void>;
};

function GumbZaPotrditev() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {pending ? "Brišem ..." : "Izbriši"}
        </button>
    );
}

export function GumbIzbrisiPostavko({
    action,
}: GumbIzbrisiPostavkoProps) {
    return (
        <form
            action={action}
            onSubmit={(dogodek) => {
                const potrjeno = window.confirm(
                    "Ali želiš izbrisati celotno postavko in vse njene materiale? Tega dejanja ni mogoče razveljaviti.",
                );

                if (!potrjeno) {
                    dogodek.preventDefault();
                }
            }}
        >
            <GumbZaPotrditev />
        </form>
    );
}