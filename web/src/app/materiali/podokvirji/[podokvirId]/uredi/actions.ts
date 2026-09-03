"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const praznoStevilo = (vrednost: unknown) => {
    if (
        vrednost === "" ||
        vrednost === null ||
        vrednost === undefined
    ) {
        return null;
    }

    return vrednost;
};

const urediPodokvirSchema = z.object({
    podokvirId: z.coerce.number().int().positive(),

    dolzina: z.coerce
        .number()
        .positive("Dolžina mora biti večja od 0.")
        .max(10000),

    cenaNaMeter: z.preprocess(
        praznoStevilo,
        z.coerce.number().min(0).nullable(),
    ),

    cenaNaPodokvir: z.preprocess(
        praznoStevilo,
        z.coerce.number().min(0).nullable(),
    ),

    naProdaj: z.boolean(),
});

export async function urediPodokvir(
    podokvirId: number,
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = urediPodokvirSchema.safeParse({
        podokvirId,
        dolzina: formData.get("dolzina"),
        cenaNaMeter: formData.get("cenaNaMeter"),
        cenaNaPodokvir: formData.get("cenaNaPodokvir"),
        naProdaj: formData.get("naProdaj") === "on",
    });

    if (!rezultat.success) {
        console.error(
            "Neveljavni podatki podokvirja:",
            rezultat.error.flatten(),
        );

        redirect(
            `/materiali/podokvirji/${podokvirId}/uredi?napaka=neveljavni-podatki`,
        );
    }

    const { error } = await supabase
        .from("podokvir")
        .update({
            dolzina: rezultat.data.dolzina,
            cena_na_meter: rezultat.data.cenaNaMeter,
            cena_na_podokvir: rezultat.data.cenaNaPodokvir,
            na_prodaj: rezultat.data.naProdaj,
        })
        .eq("id", rezultat.data.podokvirId);

    if (error) {
        console.error("Napaka pri urejanju podokvirja:", error);

        redirect(
            `/materiali/podokvirji/${podokvirId}/uredi?napaka=shranjevanje`,
        );
    }

    revalidatePath("/materiali");
    revalidatePath("/materiali/podokvirji");
    revalidatePath(
        `/materiali/podokvirji/${podokvirId}/uredi`,
    );

    redirect("/materiali/podokvirji");
}