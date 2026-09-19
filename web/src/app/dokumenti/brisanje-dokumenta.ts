"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type VrstaDokumenta =
    | "ponudba"
    | "narocilo"
    | null;

function povratnaPot(vrsta: VrstaDokumenta) {
    if (vrsta === "narocilo") {
        return "/dokumenti?vrsta=narocilo";
    }

    if (vrsta === "ponudba") {
        return "/dokumenti?vrsta=ponudba";
    }

    return "/dokumenti";
}

export async function izbrisiDokumente(
    dokumentIds: number[],
    vrsta: VrstaDokumenta,
) {
    const supabase = await createClient();
    const pot = povratnaPot(vrsta);

    const {
        data: podatkiZetona,
        error: napakaZetona,
    } = await supabase.auth.getClaims();

    if (
        napakaZetona ||
        !podatkiZetona?.claims?.sub
    ) {
        redirect("/prijava");
    }

    const veljavniIds = Array.from(
        new Set(
            dokumentIds.filter(
                (id) =>
                    Number.isInteger(id) &&
                    id > 0,
            ),
        ),
    );

    if (veljavniIds.length === 0) {
        redirect(pot);
    }

    const { error } = await supabase.rpc(
        "izbrisi_dokumente",
        {
            p_dokument_ids: veljavniIds,
        },
    );

    if (error) {
        console.error(
            "Napaka pri skupinskem brisanju:",
            error,
        );

        redirect(
            `${pot}${pot.includes("?") ? "&" : "?"}napaka=brisanje`,
        );
    }

    revalidatePath("/");
    revalidatePath("/dokumenti");

    redirect(pot);
}