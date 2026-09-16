"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const strankaIdSchema = z.number().int().positive();

export async function izbrisiStranko(strankaId: number) {
    const rezultat = strankaIdSchema.safeParse(strankaId);

    if (!rezultat.success) {
        redirect("/stranke?napaka=brisanje");
    }

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { error } = await supabase.rpc(
        "izbrisi_stranko_z_dokumenti",
        {
            p_stranka_id: rezultat.data,
        },
    );

    if (error) {
        console.error("Napaka pri brisanju stranke:", error);
        redirect("/stranke?napaka=brisanje");
    }

    revalidatePath("/stranke");
    redirect("/stranke?uspeh=stranka-izbrisana");
}
