"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const vrstaMaterialaSchema = z.enum([
    "okvir",
    "paspartu",
    "steklo",
    "podokvir",
    "dodatno_delo",
    "dobavitelj",
    "barva",
]);

export type VrstaMateriala = z.infer<
    typeof vrstaMaterialaSchema
>;

const potiKatalogov: Record<VrstaMateriala, string> = {
    okvir: "/materiali/okvirji",
    paspartu: "/materiali/paspartuji",
    steklo: "/materiali/stekla",
    podokvir: "/materiali/podokvirji",
    dodatno_delo: "/materiali/dodatna-dela",
    dobavitelj: "/materiali/dobavitelji",
    barva: "/materiali/barve",
};

export async function izbrisiMaterial(
    vrstaMateriala: VrstaMateriala,
    materialId: number,
) {
    const vrsta = vrstaMaterialaSchema.safeParse(vrstaMateriala);
    const id = z.number().int().positive().safeParse(materialId);

    const povratnaPot = vrsta.success
        ? potiKatalogov[vrsta.data]
        : "/materiali";

    if (!vrsta.success || !id.success) {
        redirect(`${povratnaPot}?napaka=brisanje`);
    }

    const supabase = await createClient();
    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { error } = await supabase.rpc(
        "izbrisi_material_iz_kataloga",
        {
            p_material_id: id.data,
            p_vrsta: vrsta.data,
        },
    );

    if (error) {
        console.error("Napaka pri brisanju materiala:", error);
        redirect(`${povratnaPot}?napaka=brisanje`);
    }

    revalidatePath("/materiali");
    revalidatePath(povratnaPot);
    redirect(`${povratnaPot}?uspeh=izbrisano`);
}
