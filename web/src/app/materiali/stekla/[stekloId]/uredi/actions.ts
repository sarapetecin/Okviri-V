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

const urediStekloSchema = z.object({
    stekloId: z.coerce.number().int().positive(),

    oznaka: z
        .string()
        .trim()
        .min(1, "Oznaka je obvezna.")
        .max(100),

    naziv: z
        .string()
        .trim()
        .min(1, "Naziv je obvezen.")
        .max(200),

    prodajnaCena: z.coerce
        .number()
        .min(0, "Prodajna cena ne sme biti negativna."),

    nabavnaCena: z.preprocess(
        praznoStevilo,
        z.coerce
            .number()
            .min(0, "Nabavna cena ne sme biti negativna.")
            .nullable(),
    ),

    dobaviteljId: z.preprocess(
        praznoStevilo,
        z.coerce.number().int().positive().nullable(),
    ),

    naProdaj: z.boolean(),
});

export async function urediSteklo(
    stekloId: number,
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = urediStekloSchema.safeParse({
        stekloId,
        oznaka: formData.get("oznaka"),
        naziv: formData.get("naziv"),
        prodajnaCena: formData.get("prodajnaCena"),
        nabavnaCena: formData.get("nabavnaCena"),
        dobaviteljId: formData.get("dobaviteljId"),
        naProdaj: formData.get("naProdaj") === "on",
    });

    if (!rezultat.success) {
        console.error(
            "Neveljavni podatki stekla:",
            rezultat.error.flatten(),
        );

        redirect(
            `/materiali/stekla/${stekloId}/uredi?napaka=neveljavni-podatki`,
        );
    }

    const { error } = await supabase
        .from("steklo")
        .update({
            oznaka: rezultat.data.oznaka,
            naziv: rezultat.data.naziv,
            prodajna_cena: rezultat.data.prodajnaCena,
            nabavna_cena: rezultat.data.nabavnaCena,
            dobavitelj_id: rezultat.data.dobaviteljId,
            na_prodaj: rezultat.data.naProdaj,
        })
        .eq("id", rezultat.data.stekloId);

    if (error) {
        console.error("Napaka pri urejanju stekla:", error);

        redirect(
            `/materiali/stekla/${stekloId}/uredi?napaka=shranjevanje`,
        );
    }

    revalidatePath("/materiali");
    revalidatePath("/materiali/stekla");
    revalidatePath(
        `/materiali/stekla/${stekloId}/uredi`,
    );

    redirect("/materiali/stekla");
}