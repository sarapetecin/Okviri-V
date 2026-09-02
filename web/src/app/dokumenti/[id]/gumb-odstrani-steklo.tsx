"use client";

type GumbOdstraniStekloProps = {
    action: (formData: FormData) => void | Promise<void>;
};

export function GumbOdstraniSteklo({
    action,
}: GumbOdstraniStekloProps) {
    return (
        <form
            action={action}
            onSubmit={(event) => {
                const potrjeno = window.confirm(
                    "Ali res želiš odstraniti steklo iz postavke?",
                );

                if (!potrjeno) {
                    event.preventDefault();
                }
            }}
        >
            <button
                type="submit"
                className="rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
            >
                Odstrani
            </button>
        </form>
    );
}