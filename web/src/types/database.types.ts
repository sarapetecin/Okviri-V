export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      barva: {
        Row: {
          id: number
          naziv: string
        }
        Insert: {
          id?: number
          naziv: string
        }
        Update: {
          id?: number
          naziv?: string
        }
        Relationships: []
      }
      dobavitelj: {
        Row: {
          email: string | null
          id: number
          kratica: string | null
          naslov: string | null
          naziv: string
          spletna_stran: string | null
          telefonska_stevilka: string | null
          ustvarjeno_at: string
        }
        Insert: {
          email?: string | null
          id?: number
          kratica?: string | null
          naslov?: string | null
          naziv: string
          spletna_stran?: string | null
          telefonska_stevilka?: string | null
          ustvarjeno_at?: string
        }
        Update: {
          email?: string | null
          id?: number
          kratica?: string | null
          naslov?: string | null
          naziv?: string
          spletna_stran?: string | null
          telefonska_stevilka?: string | null
          ustvarjeno_at?: string
        }
        Relationships: []
      }
      dodatna_dela: {
        Row: {
          cena: number | null
          cena_na_m: number | null
          cena_na_m2: number | null
          id: number
          na_prodaj: boolean
          naziv: string
        }
        Insert: {
          cena?: number | null
          cena_na_m?: number | null
          cena_na_m2?: number | null
          id?: number
          na_prodaj?: boolean
          naziv: string
        }
        Update: {
          cena?: number | null
          cena_na_m?: number | null
          cena_na_m2?: number | null
          id?: number
          na_prodaj?: boolean
          naziv?: string
        }
        Relationships: []
      }
      narocilo: {
        Row: {
          datum_sprejema: string
          dokoncano: boolean
          dokoncano_at: string | null
          id: number
          izdal_ime: string
          izdal_uporabnik_id: number | null
          placano: boolean
          ponudba_potrjena_at: string | null
          popust: number
          posodobljeno_at: string
          rok_izdelave: string | null
          skupni_znesek: number
          status: Database["public"]["Enums"]["status_prodajnega_dokumenta"]
          stranka_davcna_stevilka: string | null
          stranka_davcni_zavezanec: boolean
          stranka_email: string | null
          stranka_hisni_naslov: string | null
          stranka_id: number | null
          stranka_naziv: string
          stranka_telefonska_stevilka: string | null
          ustvarjeno_at: string
          vrsta: Database["public"]["Enums"]["vrsta_prodajnega_dokumenta"]
          zaprto_at: string | null
        }
        Insert: {
          datum_sprejema?: string
          dokoncano?: boolean
          dokoncano_at?: string | null
          id?: number
          izdal_ime: string
          izdal_uporabnik_id?: number | null
          placano?: boolean
          ponudba_potrjena_at?: string | null
          popust?: number
          posodobljeno_at?: string
          rok_izdelave?: string | null
          skupni_znesek?: number
          status?: Database["public"]["Enums"]["status_prodajnega_dokumenta"]
          stranka_davcna_stevilka?: string | null
          stranka_davcni_zavezanec?: boolean
          stranka_email?: string | null
          stranka_hisni_naslov?: string | null
          stranka_id?: number | null
          stranka_naziv: string
          stranka_telefonska_stevilka?: string | null
          ustvarjeno_at?: string
          vrsta?: Database["public"]["Enums"]["vrsta_prodajnega_dokumenta"]
          zaprto_at?: string | null
        }
        Update: {
          datum_sprejema?: string
          dokoncano?: boolean
          dokoncano_at?: string | null
          id?: number
          izdal_ime?: string
          izdal_uporabnik_id?: number | null
          placano?: boolean
          ponudba_potrjena_at?: string | null
          popust?: number
          posodobljeno_at?: string
          rok_izdelave?: string | null
          skupni_znesek?: number
          status?: Database["public"]["Enums"]["status_prodajnega_dokumenta"]
          stranka_davcna_stevilka?: string | null
          stranka_davcni_zavezanec?: boolean
          stranka_email?: string | null
          stranka_hisni_naslov?: string | null
          stranka_id?: number | null
          stranka_naziv?: string
          stranka_telefonska_stevilka?: string | null
          ustvarjeno_at?: string
          vrsta?: Database["public"]["Enums"]["vrsta_prodajnega_dokumenta"]
          zaprto_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "narocilo_izdal_uporabnik_id_fkey"
            columns: ["izdal_uporabnik_id"]
            isOneToOne: false
            referencedRelation: "uporabnik"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "narocilo_stranka_id_fkey"
            columns: ["stranka_id"]
            isOneToOne: false
            referencedRelation: "stranka"
            referencedColumns: ["id"]
          },
        ]
      }
      narocilo_postavka: {
        Row: {
          cena_postavke: number
          dolzina: number
          id: number
          kolicina: number
          narocilo_id: number
          ogledalo: boolean
          opis_slike: string | null
          opombe: string | null
          sirina: number
          ustvarjeno_at: string
          vrstni_red: number
        }
        Insert: {
          cena_postavke?: number
          dolzina: number
          id?: number
          kolicina?: number
          narocilo_id: number
          ogledalo?: boolean
          opis_slike?: string | null
          opombe?: string | null
          sirina: number
          ustvarjeno_at?: string
          vrstni_red?: number
        }
        Update: {
          cena_postavke?: number
          dolzina?: number
          id?: number
          kolicina?: number
          narocilo_id?: number
          ogledalo?: boolean
          opis_slike?: string | null
          opombe?: string | null
          sirina?: number
          ustvarjeno_at?: string
          vrstni_red?: number
        }
        Relationships: [
          {
            foreignKeyName: "narocilo_postavka_narocilo_id_fkey"
            columns: ["narocilo_id"]
            isOneToOne: false
            referencedRelation: "narocilo"
            referencedColumns: ["id"]
          },
        ]
      }
      okvir: {
        Row: {
          barva_id: number | null
          dobavitelj_id: number | null
          id: number
          na_prodaj: boolean
          nabavna_cena: number | null
          oznaka: string | null
          prodajna_cena: number
          sirina: number | null
          ustvarjeno_at: string
          vzorec: string
        }
        Insert: {
          barva_id?: number | null
          dobavitelj_id?: number | null
          id?: number
          na_prodaj?: boolean
          nabavna_cena?: number | null
          oznaka?: string | null
          prodajna_cena: number
          sirina?: number | null
          ustvarjeno_at?: string
          vzorec: string
        }
        Update: {
          barva_id?: number | null
          dobavitelj_id?: number | null
          id?: number
          na_prodaj?: boolean
          nabavna_cena?: number | null
          oznaka?: string | null
          prodajna_cena?: number
          sirina?: number | null
          ustvarjeno_at?: string
          vzorec?: string
        }
        Relationships: [
          {
            foreignKeyName: "okvir_barva_id_fkey"
            columns: ["barva_id"]
            isOneToOne: false
            referencedRelation: "barva"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okvir_dobavitelj_id_fkey"
            columns: ["dobavitelj_id"]
            isOneToOne: false
            referencedRelation: "dobavitelj"
            referencedColumns: ["id"]
          },
        ]
      }
      paspartu: {
        Row: {
          barva: string | null
          dobavitelj_id: number | null
          dodatni_opis: string | null
          id: number
          na_prodaj: boolean
          nabavna_cena: number | null
          naziv: string
          oznaka: string | null
          prodajna_cena: number
          ustvarjeno_at: string
        }
        Insert: {
          barva?: string | null
          dobavitelj_id?: number | null
          dodatni_opis?: string | null
          id?: number
          na_prodaj?: boolean
          nabavna_cena?: number | null
          naziv: string
          oznaka?: string | null
          prodajna_cena: number
          ustvarjeno_at?: string
        }
        Update: {
          barva?: string | null
          dobavitelj_id?: number | null
          dodatni_opis?: string | null
          id?: number
          na_prodaj?: boolean
          nabavna_cena?: number | null
          naziv?: string
          oznaka?: string | null
          prodajna_cena?: number
          ustvarjeno_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paspartu_dobavitelj_id_fkey"
            columns: ["dobavitelj_id"]
            isOneToOne: false
            referencedRelation: "dobavitelj"
            referencedColumns: ["id"]
          },
        ]
      }
      podokvir: {
        Row: {
          cena_na_meter: number | null
          cena_na_podokvir: number | null
          dobavitelj_id: number | null
          dolzina: number | null
          id: number
          na_prodaj: boolean
          oznaka: string | null
          zaloga: number
        }
        Insert: {
          cena_na_meter?: number | null
          cena_na_podokvir?: number | null
          dobavitelj_id?: number | null
          dolzina?: number | null
          id?: number
          na_prodaj?: boolean
          oznaka?: string | null
          zaloga?: number
        }
        Update: {
          cena_na_meter?: number | null
          cena_na_podokvir?: number | null
          dobavitelj_id?: number | null
          dolzina?: number | null
          id?: number
          na_prodaj?: boolean
          oznaka?: string | null
          zaloga?: number
        }
        Relationships: [
          {
            foreignKeyName: "podokvir_dobavitelj_id_fkey"
            columns: ["dobavitelj_id"]
            isOneToOne: false
            referencedRelation: "dobavitelj"
            referencedColumns: ["id"]
          },
        ]
      }
      postavka_dodatno_delo: {
        Row: {
          cena_enote: number
          cena_na_m: number
          cena_na_m2: number
          dodatno_delo_id: number | null
          id: number
          izracunan_obseg: number
          izracunana_povrsina: number
          kolicina: number
          nacin_obracuna: string
          naziv: string
          opis: string | null
          osnovna_cena: number
          postavka_id: number
          skupna_cena: number
          vrstni_red: number
        }
        Insert: {
          cena_enote?: number
          cena_na_m?: number
          cena_na_m2?: number
          dodatno_delo_id?: number | null
          id?: number
          izracunan_obseg?: number
          izracunana_povrsina?: number
          kolicina?: number
          nacin_obracuna?: string
          naziv: string
          opis?: string | null
          osnovna_cena?: number
          postavka_id: number
          skupna_cena?: number
          vrstni_red?: number
        }
        Update: {
          cena_enote?: number
          cena_na_m?: number
          cena_na_m2?: number
          dodatno_delo_id?: number | null
          id?: number
          izracunan_obseg?: number
          izracunana_povrsina?: number
          kolicina?: number
          nacin_obracuna?: string
          naziv?: string
          opis?: string | null
          osnovna_cena?: number
          postavka_id?: number
          skupna_cena?: number
          vrstni_red?: number
        }
        Relationships: [
          {
            foreignKeyName: "postavka_dodatno_delo_dodatno_delo_id_fkey"
            columns: ["dodatno_delo_id"]
            isOneToOne: false
            referencedRelation: "dodatna_dela"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postavka_dodatno_delo_postavka_id_fkey"
            columns: ["postavka_id"]
            isOneToOne: false
            referencedRelation: "narocilo_postavka"
            referencedColumns: ["id"]
          },
        ]
      }
      postavka_okvir: {
        Row: {
          barva: string | null
          cena_okvirja: number
          id: number
          okvir_id: number | null
          postavka_id: number
          sirina_okvirja: number | null
          vrstni_red: number
          vzorec: string
        }
        Insert: {
          barva?: string | null
          cena_okvirja?: number
          id?: number
          okvir_id?: number | null
          postavka_id: number
          sirina_okvirja?: number | null
          vrstni_red?: number
          vzorec: string
        }
        Update: {
          barva?: string | null
          cena_okvirja?: number
          id?: number
          okvir_id?: number | null
          postavka_id?: number
          sirina_okvirja?: number | null
          vrstni_red?: number
          vzorec?: string
        }
        Relationships: [
          {
            foreignKeyName: "postavka_okvir_okvir_id_fkey"
            columns: ["okvir_id"]
            isOneToOne: false
            referencedRelation: "okvir"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postavka_okvir_postavka_id_fkey"
            columns: ["postavka_id"]
            isOneToOne: false
            referencedRelation: "narocilo_postavka"
            referencedColumns: ["id"]
          },
        ]
      }
      postavka_paspartu: {
        Row: {
          barva: string | null
          cena_paspartuja: number
          dodatni_opis: string | null
          id: number
          nacin_paspartu: string | null
          oznaka: string | null
          paspartu_id: number | null
          postavka_id: number
          vrstni_red: number
        }
        Insert: {
          barva?: string | null
          cena_paspartuja?: number
          dodatni_opis?: string | null
          id?: number
          nacin_paspartu?: string | null
          oznaka?: string | null
          paspartu_id?: number | null
          postavka_id: number
          vrstni_red?: number
        }
        Update: {
          barva?: string | null
          cena_paspartuja?: number
          dodatni_opis?: string | null
          id?: number
          nacin_paspartu?: string | null
          oznaka?: string | null
          paspartu_id?: number | null
          postavka_id?: number
          vrstni_red?: number
        }
        Relationships: [
          {
            foreignKeyName: "postavka_paspartu_paspartu_id_fkey"
            columns: ["paspartu_id"]
            isOneToOne: false
            referencedRelation: "paspartu"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postavka_paspartu_postavka_id_fkey"
            columns: ["postavka_id"]
            isOneToOne: false
            referencedRelation: "narocilo_postavka"
            referencedColumns: ["id"]
          },
        ]
      }
      postavka_podokvir: {
        Row: {
          cena_podokvirja: number
          id: number
          je_podokvir: boolean
          podokvir_dolzina: number | null
          podokvir_id: number | null
          podokvir_sirina: number | null
          postavka_id: number
        }
        Insert: {
          cena_podokvirja?: number
          id?: number
          je_podokvir?: boolean
          podokvir_dolzina?: number | null
          podokvir_id?: number | null
          podokvir_sirina?: number | null
          postavka_id: number
        }
        Update: {
          cena_podokvirja?: number
          id?: number
          je_podokvir?: boolean
          podokvir_dolzina?: number | null
          podokvir_id?: number | null
          podokvir_sirina?: number | null
          postavka_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "postavka_podokvir_podokvir_id_fkey"
            columns: ["podokvir_id"]
            isOneToOne: false
            referencedRelation: "podokvir"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postavka_podokvir_postavka_id_fkey"
            columns: ["postavka_id"]
            isOneToOne: true
            referencedRelation: "narocilo_postavka"
            referencedColumns: ["id"]
          },
        ]
      }
      postavka_steklo: {
        Row: {
          cena_stekla: number
          id: number
          naziv: string
          postavka_id: number
          steklo_id: number | null
        }
        Insert: {
          cena_stekla?: number
          id?: number
          naziv: string
          postavka_id: number
          steklo_id?: number | null
        }
        Update: {
          cena_stekla?: number
          id?: number
          naziv?: string
          postavka_id?: number
          steklo_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "postavka_steklo_postavka_id_fkey"
            columns: ["postavka_id"]
            isOneToOne: true
            referencedRelation: "narocilo_postavka"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postavka_steklo_steklo_id_fkey"
            columns: ["steklo_id"]
            isOneToOne: false
            referencedRelation: "steklo"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_sporocilo: {
        Row: {
          id: number
          napaka: string | null
          narocilo_id: number
          poslano_at: string | null
          status: Database["public"]["Enums"]["status_sms_sporocila"]
          stevilo_poskusov: number
          telefonska_stevilka: string
          ustvarjeno_at: string
          vrsta_sporocila: string
          vsebina: string
        }
        Insert: {
          id?: number
          napaka?: string | null
          narocilo_id: number
          poslano_at?: string | null
          status?: Database["public"]["Enums"]["status_sms_sporocila"]
          stevilo_poskusov?: number
          telefonska_stevilka: string
          ustvarjeno_at?: string
          vrsta_sporocila?: string
          vsebina: string
        }
        Update: {
          id?: number
          napaka?: string | null
          narocilo_id?: number
          poslano_at?: string | null
          status?: Database["public"]["Enums"]["status_sms_sporocila"]
          stevilo_poskusov?: number
          telefonska_stevilka?: string
          ustvarjeno_at?: string
          vrsta_sporocila?: string
          vsebina?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_sporocilo_narocilo_id_fkey"
            columns: ["narocilo_id"]
            isOneToOne: false
            referencedRelation: "narocilo"
            referencedColumns: ["id"]
          },
        ]
      }
      steklo: {
        Row: {
          dobavitelj_id: number | null
          id: number
          na_prodaj: boolean
          nabavna_cena: number | null
          naziv: string
          oznaka: string
          prodajna_cena: number
          ustvarjeno_at: string
        }
        Insert: {
          dobavitelj_id?: number | null
          id?: number
          na_prodaj?: boolean
          nabavna_cena?: number | null
          naziv: string
          oznaka: string
          prodajna_cena: number
          ustvarjeno_at?: string
        }
        Update: {
          dobavitelj_id?: number | null
          id?: number
          na_prodaj?: boolean
          nabavna_cena?: number | null
          naziv?: string
          oznaka?: string
          prodajna_cena?: number
          ustvarjeno_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "steklo_dobavitelj_id_fkey"
            columns: ["dobavitelj_id"]
            isOneToOne: false
            referencedRelation: "dobavitelj"
            referencedColumns: ["id"]
          },
        ]
      }
      stranka: {
        Row: {
          davcna_stevilka: string | null
          davcni_zavezanec: boolean
          email: string | null
          hisni_naslov: string | null
          id: number
          naziv: string
          telefonska_stevilka: string | null
          ustvarjeno_at: string
        }
        Insert: {
          davcna_stevilka?: string | null
          davcni_zavezanec?: boolean
          email?: string | null
          hisni_naslov?: string | null
          id?: number
          naziv: string
          telefonska_stevilka?: string | null
          ustvarjeno_at?: string
        }
        Update: {
          davcna_stevilka?: string | null
          davcni_zavezanec?: boolean
          email?: string | null
          hisni_naslov?: string | null
          id?: number
          naziv?: string
          telefonska_stevilka?: string | null
          ustvarjeno_at?: string
        }
        Relationships: []
      }
      uporabnik: {
        Row: {
          aktiven: boolean
          auth_user_id: string
          id: number
          mora_spremeniti_geslo: boolean
          uporabniske_pravice: Database["public"]["Enums"]["uporabniska_pravica"]
          uporabnisko_ime: string
          ustvarjeno_at: string
        }
        Insert: {
          aktiven?: boolean
          auth_user_id: string
          id?: number
          mora_spremeniti_geslo?: boolean
          uporabniske_pravice?: Database["public"]["Enums"]["uporabniska_pravica"]
          uporabnisko_ime: string
          ustvarjeno_at?: string
        }
        Update: {
          aktiven?: boolean
          auth_user_id?: string
          id?: number
          mora_spremeniti_geslo?: boolean
          uporabniske_pravice?: Database["public"]["Enums"]["uporabniska_pravica"]
          uporabnisko_ime?: string
          ustvarjeno_at?: string
        }
        Relationships: []
      }
      zgodovina_statusa_narocila: {
        Row: {
          id: number
          narocilo_id: number
          novi_status: Database["public"]["Enums"]["status_prodajnega_dokumenta"]
          opomba: string | null
          prejsnji_status:
            | Database["public"]["Enums"]["status_prodajnega_dokumenta"]
            | null
          spremenil_uporabnik_id: number | null
          ustvarjeno_at: string
        }
        Insert: {
          id?: number
          narocilo_id: number
          novi_status: Database["public"]["Enums"]["status_prodajnega_dokumenta"]
          opomba?: string | null
          prejsnji_status?:
            | Database["public"]["Enums"]["status_prodajnega_dokumenta"]
            | null
          spremenil_uporabnik_id?: number | null
          ustvarjeno_at?: string
        }
        Update: {
          id?: number
          narocilo_id?: number
          novi_status?: Database["public"]["Enums"]["status_prodajnega_dokumenta"]
          opomba?: string | null
          prejsnji_status?:
            | Database["public"]["Enums"]["status_prodajnega_dokumenta"]
            | null
          spremenil_uporabnik_id?: number | null
          ustvarjeno_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zgodovina_statusa_narocila_narocilo_id_fkey"
            columns: ["narocilo_id"]
            isOneToOne: false
            referencedRelation: "narocilo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zgodovina_statusa_narocila_spremenil_uporabnik_id_fkey"
            columns: ["spremenil_uporabnik_id"]
            isOneToOne: false
            referencedRelation: "uporabnik"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_posodobi_uporabnika: {
        Args: {
          p_aktiven: boolean
          p_auth_user_id: string
          p_uporabniske_pravice: string
        }
        Returns: undefined
      }
      admin_seznam_uporabnikov: {
        Args: never
        Returns: {
          aktiven: boolean
          auth_user_id: string
          email: string
          uporabnik_id: number
          uporabniske_pravice: string
          uporabnisko_ime: string
          ustvarjeno_at: string
          zadnja_prijava_at: string
        }[]
      }
      dodaj_dodatno_delo_postavki: {
        Args: { p_dodatno_delo_id: number; p_postavka_id: number }
        Returns: number
      }
      dodaj_okvir_postavki: {
        Args: { p_okvir_id: number; p_postavka_id: number }
        Returns: number
      }
      dodaj_paspartu_postavki: {
        Args: { p_paspartu_id: number; p_postavka_id: number }
        Returns: number
      }
      dodaj_podokvir_postavki: {
        Args: { p_postavka_id: number }
        Returns: number
      }
      dodaj_steklo_postavki: {
        Args: { p_postavka_id: number; p_steklo_id: number }
        Returns: number
      }
      izbrisi_celotno_postavko: {
        Args: { p_postavka_id: number }
        Returns: number
      }
      je_administrator: { Args: never; Returns: boolean }
      je_interni_uporabnik: { Args: never; Returns: boolean }
      nastavi_nacine_paspartuja: {
        Args: { p_nacini: string[]; p_postavka_id: number }
        Returns: undefined
      }
      odstrani_dodatno_delo_postavke: {
        Args: { p_postavka_dodatno_delo_id: number }
        Returns: undefined
      }
      odstrani_okvir_postavke: {
        Args: { p_postavka_okvir_id: number }
        Returns: undefined
      }
      odstrani_paspartu_postavke: {
        Args: { p_postavka_paspartu_id: number }
        Returns: undefined
      }
      odstrani_podokvir_postavke: {
        Args: { p_postavka_podokvir_id: number }
        Returns: undefined
      }
      odstrani_steklo_postavke: {
        Args: { p_postavka_steklo_id: number }
        Returns: undefined
      }
      osvezi_ceno_postavke: {
        Args: { p_postavka_id: number }
        Returns: undefined
      }
      osvezi_skupni_znesek_dokumenta: {
        Args: { p_narocilo_id: number }
        Returns: undefined
      }
      spremeni_status_dokumenta: {
        Args: {
          p_narocilo_id: number
          p_novi_status: Database["public"]["Enums"]["status_prodajnega_dokumenta"]
        }
        Returns: undefined
      }
      trenutna_uporabniska_vloga: { Args: never; Returns: string }
      uredi_celotno_postavko: {
        Args: {
          p_dodaj_podokvir?: boolean
          p_dodatno_delo_ids?: number[]
          p_dolzina: number
          p_kolicina: number
          p_ogledalo?: boolean
          p_okvir_ids?: number[]
          p_opis_slike?: string
          p_opombe?: string
          p_paspartu_ids?: number[]
          p_postavka_id: number
          p_sirina: number
          p_steklo_id?: number
        }
        Returns: number
      }
      ustvari_celotno_postavko: {
        Args: {
          p_dodaj_podokvir?: boolean
          p_dodatno_delo_ids?: number[]
          p_dolzina: number
          p_kolicina: number
          p_narocilo_id: number
          p_ogledalo?: boolean
          p_okvir_ids?: number[]
          p_opis_slike?: string
          p_opombe?: string
          p_paspartu_ids?: number[]
          p_sirina: number
          p_steklo_id?: number
        }
        Returns: number
      }
      zakljuci_prvo_spremembo_gesla: { Args: never; Returns: undefined }
    }
    Enums: {
      status_prodajnega_dokumenta:
        | "osnutek"
        | "poslano_v_pregled"
        | "zavrnjeno"
        | "potrjeno"
        | "v_izdelavi"
        | "dokoncano"
        | "rocno_zaprto"
        | "preklicano"
      status_sms_sporocila: "v_cakanju" | "poslano" | "napaka" | "preklicano"
      uporabniska_pravica: "administrator" | "zaposleni" | "partner"
      vrsta_prodajnega_dokumenta: "ponudba" | "narocilo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      status_prodajnega_dokumenta: [
        "osnutek",
        "poslano_v_pregled",
        "zavrnjeno",
        "potrjeno",
        "v_izdelavi",
        "dokoncano",
        "rocno_zaprto",
        "preklicano",
      ],
      status_sms_sporocila: ["v_cakanju", "poslano", "napaka", "preklicano"],
      uporabniska_pravica: ["administrator", "zaposleni", "partner"],
      vrsta_prodajnega_dokumenta: ["ponudba", "narocilo"],
    },
  },
} as const
