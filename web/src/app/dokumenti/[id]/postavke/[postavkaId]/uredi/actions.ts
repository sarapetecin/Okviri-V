"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const urejenaPostavkaSchema = z.object({
    dokumentId: z.number().int().positive(),
    postavkaId: z.number().int().positive(),
    kolicina: z.number().int().min(1).max(100),
    dolzina: z.number().positive().max(10000),
    sirina: z.number().positive().max(10000),
    opisSlike: z.string().trim().nullable(),
    opombe: z.string().trim().nullable(),
    ogledalo: z.boolean(),
    okvirIds: z.array(z.number().int().positive()).max(3),
    paspartuIds: z.array(z.number().int().positive()).max(2),
    naciniPaspartuja: z.array(z.enum(["vrezan", "polozen"])).max(2),
    stekloId: z.number().int().positive().nullable(),
    dodajPodokvir: z.boolean(),
    dodatnoDeloIds: z.array(z.number().int().positive()).max(50),
});

function preberiStevilo(vrednost: FormDataEntryValue | null) {
    if (typeof vrednost !== "string" || vrednost.trim() === "") {
        return Number.NaN;
    }

    return Number(vrednost);
}

function preberiId(vrednost: FormDataEntryValue | null) {
    const id = preberiStevilo(vrednost);

    return Number.isInteger(id) && id > 0 ? id : null;
}

function preberiIdje(formData: FormData, imePolja: string) {
    return formData
        .getAll(imePolja)
        .map((vrednost) => preberiId(vrednost))
        .filter((id): id is number => id !== null);
}

export async function urediPostavko(
    dokumentId: number,
    postavkaId: number,
    formData: FormData,
) {
    const potNapake = (napaka: string) =>
        formData.get("vdelano") === "da"
            ? `/dokumenti/${dokumentId}?urediPostavko=${postavkaId}&napaka=${napaka}#nova-postavka`
            : `/dokumenti/${dokumentId}/postavke/${postavkaId}/uredi?napaka=${napaka}`;

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const {
        data: uporabniskaVloga,
        error: napakaUporabniskeVloge,
    } = await supabase.rpc(
        "trenutna_uporabniska_vloga",
    );

    if (
        napakaUporabniskeVloge ||
        !uporabniskaVloga
    ) {
        redirect("/");
    }

    const jePartner =
        uporabniskaVloga === "partner";

    const opisSlikeVrednost = formData.get("opisSlike");
    const opombeVrednost = formData.get("opombe");

    const rezultat = urejenaPostavkaSchema.safeParse({
        dokumentId,
        postavkaId,
        kolicina: preberiStevilo(formData.get("kolicina")),
        dolzina: preberiStevilo(formData.get("dolzina")),
        sirina: preberiStevilo(formData.get("sirina")),

        opisSlike:
            typeof opisSlikeVrednost === "string"
                ? opisSlikeVrednost.trim() || null
                : null,

        opombe:
            typeof opombeVrednost === "string"
                ? opombeVrednost.trim() || null
                : null,

        ogledalo: formData.get("ogledalo") === "on",
        okvirIds: preberiIdje(formData, "okvirId"),
        paspartuIds: preberiIdje(formData, "paspartuId"),
        naciniPaspartuja: [
            formData.get("nacinPaspartu1") === "polozen"
                ? "polozen"
                : "vrezan",

            formData.get("nacinPaspartu2") === "polozen"
                ? "polozen"
                : "vrezan",
        ],
        stekloId: preberiId(formData.get("stekloId")),
        dodajPodokvir: formData.get("dodajPodokvir") === "on",
        dodatnoDeloIds: preberiIdje(formData, "dodatnoDeloId"),
    });

    if (!rezultat.success) {
        console.error(
            "Neveljavni podatki urejene postavke:",
            rezultat.error.flatten(),
        );

        redirect(potNapake("neveljavni-podatki"));
    }

    const { data: postavka, error: napakaPostavke } = await supabase
        .from("narocilo_postavka")
        .select("id")
        .eq("id", rezultat.data.postavkaId)
        .eq("narocilo_id", rezultat.data.dokumentId)
        .maybeSingle();

    if (napakaPostavke || !postavka) {
        redirect(`/dokumenti/${dokumentId}`);
    }

    const parametri = {
        p_postavka_id: postavka.id,
        p_kolicina: rezultat.data.kolicina,
        p_dolzina: rezultat.data.dolzina,
        p_sirina: rezultat.data.sirina,
        p_ogledalo: rezultat.data.ogledalo,
        p_okvir_ids: rezultat.data.okvirIds,
        p_paspartu_ids: rezultat.data.paspartuIds,
        p_dodaj_podokvir: rezultat.data.dodajPodokvir,
        p_dodatno_delo_ids: rezultat.data.dodatnoDeloIds,

        ...(rezultat.data.opisSlike
            ? { p_opis_slike: rezultat.data.opisSlike }
            : {}),

        ...(rezultat.data.opombe
            ? { p_opombe: rezultat.data.opombe }
            : {}),

        ...(rezultat.data.stekloId
            ? { p_steklo_id: rezultat.data.stekloId }
            : {}),
    };

    const rezultatShranjevanja = jePartner
        ? await supabase.rpc(
            "partner_uredi_celotno_postavko",
            parametri,
        )
        : await supabase.rpc(
            "uredi_celotno_postavko",
            parametri,
        );

    const napakaShranjevanja =
        rezultatShranjevanja.error;

    if (napakaShranjevanja) {
        console.error(
            "Napaka pri urejanju celotne postavke:",
            napakaShranjevanja,
        );

        redirect(potNapake("shranjevanje"));
    }

    if (rezultat.data.paspartuIds.length > 0) {
        const { error: napakaNacinaPaspartuja } = await supabase.rpc(
            "nastavi_nacine_paspartuja",
            {
                p_postavka_id: postavka.id,
                p_nacini: rezultat.data.naciniPaspartuja.slice(
                    0,
                    rezultat.data.paspartuIds.length,
                ),
            },
        );

        if (napakaNacinaPaspartuja) {
            console.error(
                "Napaka pri urejanju načina paspartuja:",
                napakaNacinaPaspartuja,
            );

            redirect(potNapake("shranjevanje"));
        }
    }

    revalidatePath(`/dokumenti/${dokumentId}`);
    revalidatePath(`/dokumenti/${dokumentId}/natisni`);
    revalidatePath("/dokumenti");

    redirect(`/dokumenti/${dokumentId}`);
}
