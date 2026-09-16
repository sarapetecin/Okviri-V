"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function izbrisiDokument(dokumentId: number) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    if (!Number.isInteger(dokumentId) || dokumentId <= 0) {
        redirect("/dokumenti");
    }

    const { data: postavke, error: napakaPostavk } =
        await supabase
            .from("narocilo_postavka")
            .select("id")
            .eq("narocilo_id", dokumentId);

    if (napakaPostavk) {
        console.error(
            "Napaka pri pridobivanju postavk:",
            napakaPostavk,
        );

        redirect("/dokumenti?napaka=brisanje");
    }

    for (const postavka of postavke ?? []) {
        const { error } = await supabase.rpc(
            "izbrisi_celotno_postavko",
            {
                p_postavka_id: postavka.id,
            },
        );

        if (error) {
            console.error(
                "Napaka pri brisanju postavke:",
                error,
            );

            redirect("/dokumenti?napaka=brisanje");
        }
    }

    const { error: napakaSporocil } = await supabase
        .from("sms_sporocilo")
        .delete()
        .eq("narocilo_id", dokumentId);

    if (napakaSporocil) {
        console.error(
            "Napaka pri brisanju SMS-sporočil:",
            napakaSporocil,
        );

        redirect("/dokumenti?napaka=brisanje");
    }

    const { error: napakaZgodovine } = await supabase
        .from("zgodovina_statusa_narocila")
        .delete()
        .eq("narocilo_id", dokumentId);

    if (napakaZgodovine) {
        console.error(
            "Napaka pri brisanju zgodovine:",
            napakaZgodovine,
        );

        redirect("/dokumenti?napaka=brisanje");
    }

    const { error: napakaBrisanja } = await supabase
        .from("narocilo")
        .delete()
        .eq("id", dokumentId);

    if (napakaBrisanja) {
        console.error(
            "Napaka pri brisanju dokumenta:",
            napakaBrisanja,
        );

        redirect("/dokumenti?napaka=brisanje");
    }

    revalidatePath("/");
    revalidatePath("/dokumenti");

    redirect("/dokumenti");
}