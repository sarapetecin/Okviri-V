"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const novaPostavkaSchema = z.object({
  dokumentId: z.number().int().positive(),

  kolicina: z.number().int().min(1).max(100),

  dolzina: z.number().positive().max(10000),

  sirina: z.number().positive().max(10000),

  opisSlike: z.string().trim().nullable(),

  opombe: z.string().trim().nullable(),

  merePaspartuja: z
    .string()
    .trim()
    .max(100)
    .nullable(),

  ogledalo: z.boolean(),

  okvirIds: z.array(z.number().int().positive()).max(3),

  paspartuIds: z.array(z.number().int().positive()).max(2),

  postavitev: z.enum([
    "pokoncno",
    "lezece",
  ]),

  naciniPaspartuja: z
    .array(z.enum(["vrezan", "polozen"]))
    .max(2),

  stekloId: z.number().int().positive().nullable(),

  vrstaPodokvirja: z
    .enum([
      "navadni",
      "po_narocilu",
      "standardni",
    ])
    .nullable(),

  dodajPodokvir: z.boolean(),

  dodatnoDeloIds: z
    .array(z.number().int().positive())
    .max(50),
  enkratnoDeloNaziv: z
    .string()
    .trim()
    .max(200)
    .nullable(),

  enkratnoDeloOpis: z
    .string()
    .trim()
    .max(500)
    .nullable(),

  enkratnoDeloCena: z
    .number()
    .min(0)
    .nullable(),
});

function preberiStevilo(
  vrednost: FormDataEntryValue | null,
) {
  if (
    typeof vrednost !== "string" ||
    vrednost.trim() === ""
  ) {
    return Number.NaN;
  }

  return Number(vrednost);
}

function preberiId(
  vrednost: FormDataEntryValue | null,
) {
  const id = preberiStevilo(vrednost);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function preberiIdje(
  formData: FormData,
  imePolja: string,
) {
  return formData
    .getAll(imePolja)
    .map((vrednost) => preberiId(vrednost))
    .filter((id): id is number => id !== null);
}

export async function ustvariPostavko(
  dokumentId: number,
  formData: FormData,
) {
  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const {
    data: uporabniskaVloga,
    error: napakaUporabniskeVloge,
  } = await supabase.rpc("trenutna_uporabniska_vloga");

  if (
    napakaUporabniskeVloge ||
    !uporabniskaVloga
  ) {
    redirect("/");
  }

  const jePartner = uporabniskaVloga === "partner";

  const opisSlikeVrednost = formData.get("opisSlike");
  const opombeVrednost = formData.get("opombe");

  const merePaspartujaVrednost =
    formData.get("merePaspartuja");

  const enkratnoDeloNazivVrednost =
    formData.get("enkratnoDeloNaziv");

  const enkratnoDeloOpisVrednost =
    formData.get("enkratnoDeloOpis");

  const enkratnoDeloCenaVrednost =
    formData.get("enkratnoDeloCena");

  const vrstaPodokvirjaVrednost =
    formData.get("vrstaPodokvirja");

  const vrstaPodokvirja =
    vrstaPodokvirjaVrednost === "navadni" ||
      vrstaPodokvirjaVrednost === "po_narocilu" ||
      vrstaPodokvirjaVrednost === "standardni"
      ? vrstaPodokvirjaVrednost
      : null;

  const rezultat = novaPostavkaSchema.safeParse({
    dokumentId,
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

    merePaspartuja:
      typeof merePaspartujaVrednost === "string"
        ? merePaspartujaVrednost.trim() || null
        : null,

    ogledalo: formData.get("ogledalo") === "on",

    postavitev:
      formData.get("postavitev") === "lezece"
        ? "lezece"
        : "pokoncno",

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

    vrstaPodokvirja:
      formData.get("vrstaPodokvirja") || null,

    dodajPodokvir:
      vrstaPodokvirja !== null,

    dodatnoDeloIds: preberiIdje(
      formData,
      "dodatnoDeloId",
    ),

    enkratnoDeloNaziv:
      typeof enkratnoDeloNazivVrednost ===
        "string"
        ? enkratnoDeloNazivVrednost.trim() ||
        null
        : null,

    enkratnoDeloOpis:
      typeof enkratnoDeloOpisVrednost ===
        "string"
        ? enkratnoDeloOpisVrednost.trim() ||
        null
        : null,

    enkratnoDeloCena:
      typeof enkratnoDeloCenaVrednost ===
        "string" &&
        enkratnoDeloCenaVrednost.trim() !== ""
        ? Number(enkratnoDeloCenaVrednost)
        : null,
  });

  if (!rezultat.success) {
    console.error(
      "Neveljavni podatki celotne postavke:",
      rezultat.error.flatten(),
    );

    redirect(
      `/dokumenti/${dokumentId}/postavke/nova?napaka=neveljavni-podatki`,
    );
  }

  const { data: dokument, error: napakaDokumenta } =
    await supabase
      .from("narocilo")
      .select("id, vrsta, status")
      .eq("id", rezultat.data.dokumentId)
      .maybeSingle();

  if (napakaDokumenta || !dokument) {
    redirect("/dokumenti");
  }

  if (
    jePartner &&
    (
      dokument.vrsta !== "ponudba" ||
      !["osnutek", "zavrnjeno"].includes(dokument.status)
    )
  ) {
    redirect(
      `/dokumenti/${dokumentId}?napaka=ni-dovoljenja`,
    );
  }

  const parametri = {
    p_narocilo_id: dokument.id,
    p_kolicina: rezultat.data.kolicina,
    p_dolzina: rezultat.data.dolzina,
    p_sirina: rezultat.data.sirina,
    p_ogledalo: rezultat.data.ogledalo,
    p_okvir_ids: rezultat.data.okvirIds,
    p_paspartu_ids: rezultat.data.paspartuIds,
    p_dodaj_podokvir: false,

    p_vrsta_podokvirja:
      rezultat.data.vrstaPodokvirja,
    p_dodatno_delo_ids:
      rezultat.data.dodatnoDeloIds,

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
      "partner_ustvari_celotno_postavko",
      parametri,
    )
    : await supabase.rpc(
      "ustvari_celotno_postavko",
      parametri,
    );

  const novaPostavkaId =
    rezultatShranjevanja.data;

  const napakaShranjevanja =
    rezultatShranjevanja.error;

  if (napakaShranjevanja) {
    console.error(
      "Napaka pri ustvarjanju celotne postavke:",
      napakaShranjevanja,
    );

    redirect(
      `/dokumenti/${dokumentId}/postavke/nova?napaka=shranjevanje`,
    );
  }

  if (!novaPostavkaId) {
    console.error(
      "Supabase ni vrnil ID-ja nove postavke.",
    );

    redirect(
      `/dokumenti/${dokumentId}/postavke/nova?napaka=shranjevanje`,
    );
  }

  const { error: napakaPostavitve } =
    await supabase
      .from("narocilo_postavka")
      .update({
        postavitev:
          rezultat.data.postavitev,
      })
      .eq("id", novaPostavkaId)
      .eq("narocilo_id", dokumentId);

  if (napakaPostavitve) {
    console.error(
      "Napaka pri shranjevanju postavitve:",
      napakaPostavitve,
    );

    redirect(
      `/dokumenti/${dokumentId}/postavke/nova?napaka=shranjevanje-postavitve`,
    );
  }

  if (rezultat.data.paspartuIds.length > 0) {
    const { error: napakaNacinaPaspartuja } =
      await supabase.rpc(
        "nastavi_nacine_paspartuja",
        {
          p_postavka_id: novaPostavkaId,
          p_nacini:
            rezultat.data.naciniPaspartuja.slice(
              0,
              rezultat.data.paspartuIds.length,
            ),
        },
      );
    const { error: napakaMerPaspartuja } =
      await supabase
        .from("narocilo_postavka")
        .update({
          mere_paspartuja:
            rezultat.data.merePaspartuja,
        })
        .eq("id", novaPostavkaId)
        .eq("narocilo_id", dokumentId);

    if (napakaMerPaspartuja) {
      console.error(
        "Napaka pri shranjevanju mer paspartuja:",
        napakaMerPaspartuja,
      );

      await supabase.rpc(
        "izbrisi_celotno_postavko",
        {
          p_postavka_id: novaPostavkaId,
        },
      );

      redirect(
        `/dokumenti/${dokumentId}/postavke/nova?napaka=shranjevanje`,
      );
    }

    if (napakaNacinaPaspartuja) {
      console.error(
        "Napaka pri shranjevanju načina paspartuja:",
        napakaNacinaPaspartuja,
      );

      await supabase.rpc(
        "izbrisi_celotno_postavko",
        {
          p_postavka_id: novaPostavkaId,
        },
      );

      redirect(
        `/dokumenti/${dokumentId}/postavke/nova?napaka=shranjevanje`,
      );
    }
  }

  if (
    rezultat.data.enkratnoDeloNaziv &&
    rezultat.data.enkratnoDeloCena !== null
  ) {
    const cenaEnote =
      rezultat.data.enkratnoDeloCena;

    const skupnaCena =
      cenaEnote * rezultat.data.kolicina;

    const { error: napakaEnkratnegaDela } =
      await supabase
        .from("postavka_dodatno_delo")
        .insert({
          postavka_id: novaPostavkaId,
          dodatno_delo_id: null,
          naziv:
            rezultat.data.enkratnoDeloNaziv,
          opis:
            rezultat.data.enkratnoDeloOpis,
          nacin_obracuna: "kos",
          kolicina:
            rezultat.data.kolicina,
          cena_enote: cenaEnote,
          skupna_cena: skupnaCena,
        });

    if (napakaEnkratnegaDela) {
      console.error(
        "Napaka pri shranjevanju enkratnega dela:",
        napakaEnkratnegaDela,
      );

      redirect(
        `/dokumenti/${dokumentId}/postavke/nova?napaka=enkratno-delo`,
      );
    }

    const { error: napakaCenePostavke } =
      await supabase.rpc(
        "osvezi_ceno_postavke",
        {
          p_postavka_id: novaPostavkaId,
        },
      );

    if (napakaCenePostavke) {
      console.error(
        "Napaka pri osvežitvi cene postavke:",
        napakaCenePostavke,
      );

      redirect(
        `/dokumenti/${dokumentId}/postavke/nova?napaka=izracun-cene`,
      );
    }

    const { error: napakaSkupnegaZneska } =
      await supabase.rpc(
        "osvezi_skupni_znesek_dokumenta",
        {
          p_narocilo_id: dokumentId,
        },
      );

    if (napakaSkupnegaZneska) {
      console.error(
        "Napaka pri osvežitvi skupnega zneska:",
        napakaSkupnegaZneska,
      );
    }
  }

  revalidatePath(`/dokumenti/${dokumentId}`);
  revalidatePath(
    `/dokumenti/${dokumentId}/natisni`,
  );

  redirect(`/dokumenti/${dokumentId}`);
}