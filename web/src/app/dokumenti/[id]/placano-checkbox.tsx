"use client";

type PlaciloInPopustProps = {
    placano: boolean;
    popust: number;
    actionPlacano: (
        formData: FormData,
    ) => void | Promise<void>;
    actionPopust: (
        formData: FormData,
    ) => void | Promise<void>;
};

export function PlaciloInPopust({
    placano,
    popust,
    actionPlacano,
    actionPopust,
}: PlaciloInPopustProps) {
    return (
        <div className="mt-4 space-y-4">
            <form action={actionPlacano}>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        name="placano"
                        defaultChecked={placano}
                        onChange={(dogodek) => {
                            dogodek.currentTarget.form?.requestSubmit();
                        }}
                        className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                    />

                    Plačano
                </label>
            </form>

            <form action={actionPopust}>
                <label
                    htmlFor="popust"
                    className="block text-sm font-medium text-slate-700"
                >
                    Popust v %
                </label>

                <div className="mt-2 flex gap-2">
                    <input
                        id="popust"
                        name="popust"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        defaultValue={popust}
                        required
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                        Shrani popust
                    </button>
                </div>
            </form>
        </div>
    );
}