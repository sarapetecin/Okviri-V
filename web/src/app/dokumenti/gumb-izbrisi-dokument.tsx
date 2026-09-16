"use client";

import { useFormStatus } from "react-dom";

type Props = {
    action: () => Promise<void>;
};

function Gumb() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
        >
            {pending ? "Brišem ..." : "Izbriši"}
        </button>
    );
}

export function GumbIzbrisiDokument({ action }: Props) {
    return (
        <form
            action={action}
            onClick={(dogodek) => {
                dogodek.stopPropagation();
            }}
            onSubmit={(dogodek) => {
                dogodek.stopPropagation();

                const potrjeno = window.confirm(
                    "Ali želiš trajno izbrisati ta dokument in vse njegove postavke? Tega dejanja ni mogoče razveljaviti.",
                );

                if (!potrjeno) {
                    dogodek.preventDefault();
                }
            }}
        >
            <Gumb />
        </form>
    );
}