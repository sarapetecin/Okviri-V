"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const praznoStevilo = (vrednost: unknown) =>
    vrednost === "" || vrednost === null ? null : vrednost;

const dodatnoDeloSchema = z.object({
    deloId: z.number().int().positive(),
    naziv: z.string().trim().min(1).max(200),
    cena: z.preprocess(
        praznoStevilo,
        z.coerce.number().min(0).nullable(),
    ),
    cenaNaMeter: z.preprocess(
        praznoStevilo,
        z.coerce.number().min(0).nullable(),
    ),
    cenaNaM2: z.preprocess(
        praznoStevilo,
        z.coerce.number().min(0).nullable(),
    ),
    naProdaj: z.boolean(),
});

export async function urediDodatnoDelo(
    deloId: number,
    formData: FormData,
) {
    const supabase = await createClient();
    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = dodatnoDeloSchema.safeParse({
        deloId,
        naziv: formData.get("naziv"),
        cena: formData.get("cena"),
        cenaNaMeter: formData.get("cenaNaMeter"),
        cenaNaM2: formData.get("cenaNaM2"),
        naProdaj: formData.get("naProdaj") === "on",
    });

    if (!rezultat.success) {
        redirect(
            `/materiali/dodatna-dela/${deloId}/uredi?napaka=neveljavni-podatki`,
        );
    }

    const { error } = await supabase
        .from("dodatna_dela")
        .update({
            naziv: rezultat.data.naziv,
            cena: rezultat.data.cena,
            cena_na_m: rezultat.data.cenaNaMeter,
            cena_na_m2: rezultat.data.cenaNaM2,
            na_prodaj: rezultat.data.naProdaj,
        })
        .eq("id", rezultat.data.deloId);

    if (error) {
        console.error("Napaka pri urejanju dodatnega dela:", error);
        redirect(
            `/materiali/dodatna-dela/${deloId}/uredi?napaka=shranjevanje`,
        );
    }

    revalidatePath("/materiali");
    revalidatePath("/materiali/dodatna-dela");
    redirect("/materiali/dodatna-dela?uspeh=posodobljeno");
}
