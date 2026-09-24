"use client";

import { useFormStatus } from "react-dom";

type Props = {
    action: () => Promise<void>;
    uporabniskoIme: string;
};

function Gumb() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {pending
                ? "Odstranjujem ..."
                : "Odstrani"}
        </button>
    );
}

export function GumbIzbrisiUporabnika({
    action,
    uporabniskoIme,
}: Props) {
    return (
        <form
            action={action}
            onSubmit={(dogodek) => {
                const potrjeno =
                    window.confirm(
                        `Ali želiš trajno odstraniti uporabnika "${uporabniskoIme}"? Uporabnik se ne bo mogel več prijaviti.`,
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