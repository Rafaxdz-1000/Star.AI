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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      form_data: {
        Row: {
          age: number
          area_to_improve_other: string | null
          children_quantity: number | null
          city: string
          created_at: string
          current_challenge_other: string | null
          email: string
          gender: Database["public"]["Enums"]["gender_enum"]
          hand_photo_url: string
          has_children: boolean
          id: string
          main_objective_other: string | null
          marital_status: Database["public"]["Enums"]["marital_status_enum"]
          neighborhood: string | null
          profession: string
          state: string
          study_level: string | null
          studying: boolean
          updated_at: string
        }
        Insert: {
          age: number
          area_to_improve_other?: string | null
          children_quantity?: number | null
          city: string
          created_at?: string
          current_challenge_other?: string | null
          email: string
          gender: Database["public"]["Enums"]["gender_enum"]
          hand_photo_url: string
          has_children: boolean
          id?: string
          main_objective_other?: string | null
          marital_status: Database["public"]["Enums"]["marital_status_enum"]
          neighborhood?: string | null
          profession: string
          state: string
          study_level?: string | null
          studying: boolean
          updated_at?: string
        }
        Update: {
          age?: number
          area_to_improve_other?: string | null
          children_quantity?: number | null
          city?: string
          created_at?: string
          current_challenge_other?: string | null
          email?: string
          gender?: Database["public"]["Enums"]["gender_enum"]
          hand_photo_url?: string
          has_children?: boolean
          id?: string
          main_objective_other?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status_enum"]
          neighborhood?: string | null
          profession?: string
          state?: string
          study_level?: string | null
          studying?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      form_data_areas_to_improve: {
        Row: {
          area: string
          form_data_id: string
          id: string
        }
        Insert: {
          area: string
          form_data_id: string
          id?: string
        }
        Update: {
          area?: string
          form_data_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_data_areas_to_improve_form_data_id_fkey"
            columns: ["form_data_id"]
            isOneToOne: false
            referencedRelation: "form_data"
            referencedColumns: ["id"]
          },
        ]
      }
      form_data_current_challenges: {
        Row: {
          challenge: string
          form_data_id: string
          id: string
        }
        Insert: {
          challenge: string
          form_data_id: string
          id?: string
        }
        Update: {
          challenge?: string
          form_data_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_data_current_challenges_form_data_id_fkey"
            columns: ["form_data_id"]
            isOneToOne: false
            referencedRelation: "form_data"
            referencedColumns: ["id"]
          },
        ]
      }
      form_data_main_objectives: {
        Row: {
          form_data_id: string
          id: string
          objective: string
        }
        Insert: {
          form_data_id: string
          id?: string
          objective: string
        }
        Update: {
          form_data_id?: string
          id?: string
          objective?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_data_main_objectives_form_data_id_fkey"
            columns: ["form_data_id"]
            isOneToOne: false
            referencedRelation: "form_data"
            referencedColumns: ["id"]
          },
        ]
      }
      report_insights: {
        Row: {
          id: string
          insight: string
          report_id: string
        }
        Insert: {
          id?: string
          insight: string
          report_id: string
        }
        Update: {
          id?: string
          insight?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_insights_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_numerology_mega_sena: {
        Row: {
          id: string
          number: number
          report_id: string
        }
        Insert: {
          id?: string
          number: number
          report_id: string
        }
        Update: {
          id?: string
          number?: number
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_numerology_mega_sena_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_rituals: {
        Row: {
          id: string
          report_id: string
          ritual: string
        }
        Insert: {
          id?: string
          report_id: string
          ritual: string
        }
        Update: {
          id?: string
          report_id?: string
          ritual?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_rituals_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_scenarios: {
        Row: {
          description: string
          id: string
          report_id: string
          scenario_type: Database["public"]["Enums"]["scenario_type_enum"]
        }
        Insert: {
          description: string
          id?: string
          report_id: string
          scenario_type: Database["public"]["Enums"]["scenario_type_enum"]
        }
        Update: {
          description?: string
          id?: string
          report_id?: string
          scenario_type?: Database["public"]["Enums"]["scenario_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "report_scenarios_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          destiny_number: number
          form_data_id: string
          id: string
          is_paid: boolean
          numerology_meaning: string
          summary: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destiny_number: number
          form_data_id: string
          id?: string
          is_paid?: boolean
          numerology_meaning: string
          summary: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destiny_number?: number
          form_data_id?: string
          id?: string
          is_paid?: boolean
          numerology_meaning?: string
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_form_data_id_fkey"
            columns: ["form_data_id"]
            isOneToOne: true
            referencedRelation: "form_data"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gender_enum: "male" | "female" | "other" | "prefer_not_to_say"
      marital_status_enum:
        | "single"
        | "married"
        | "divorced"
        | "widowed"
        | "separated"
        | "union"
      scenario_type_enum: "probable" | "possible" | "bold"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      gender_enum: ["male", "female", "other", "prefer_not_to_say"],
      marital_status_enum: [
        "single",
        "married",
        "divorced",
        "widowed",
        "separated",
        "union",
      ],
      scenario_type_enum: ["probable", "possible", "bold"],
    },
  },
} as const
