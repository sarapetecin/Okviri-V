"use client";

type GumbIzbrisiStrankoProps = {
    naziv: string;
    action: () => void | Promise<void>;
};

export function GumbIzbrisiStranko({
    naziv,
    action,
}: GumbIzbrisiStrankoProps) {
    return (
        <form
            action={action}
            onSubmit={(dogodek) => {
                const potrjeno = window.confirm(
                    `Ali res želiš izbrisati stranko »${naziv}«? Izbrisani bodo tudi vse njene ponudbe, naročila in postavke. Tega dejanja ni mogoče razveljaviti.`,
                );

                if (!potrjeno) {
                    dogodek.preventDefault();
                }
            }}
        >
            <button
                type="submit"
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
                Izbriši
            </button>
        </form>
    );
}
