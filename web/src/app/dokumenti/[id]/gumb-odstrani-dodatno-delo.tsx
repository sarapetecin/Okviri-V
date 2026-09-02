"use client";

type GumbOdstraniDodatnoDeloProps = {
    action: (formData: FormData) => void | Promise<void>;
};

export function GumbOdstraniDodatnoDelo({
    action,
}: GumbOdstraniDodatnoDeloProps) {
    return (
        <form
            action={action}
            onSubmit={(dogodek) => {
                const potrjeno = window.confirm(
                    "Ali želiš odstraniti dodatno delo?",
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
                Odstrani
            </button>
        </form>
    );
}