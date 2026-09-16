"use client";

type GumbIzbrisiMaterialProps = {
    naziv: string;
    action: () => void | Promise<void>;
};

export function GumbIzbrisiMaterial({
    naziv,
    action,
}: GumbIzbrisiMaterialProps) {
    return (
        <form
            action={action}
            onSubmit={(dogodek) => {
                const potrjeno = window.confirm(
                    `Ali res želiš izbrisati »${naziv}« iz kataloga? Material bo odstranjen iz kataloga, podatki na obstoječih dokumentih pa bodo ostali shranjeni.`,
                );

                if (!potrjeno) {
                    dogodek.preventDefault();
                }
            }}
        >
            <button
                type="submit"
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
                Izbriši
            </button>
        </form>
    );
}
