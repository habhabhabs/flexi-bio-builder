export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      link_analytics: {
        Row: {
          clicked_at: string | null
          country: string | null
          device_type: string | null
          id: string
          ip_address: unknown | null
          link_id: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          link_id?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          link_id?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_analytics_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          click_count: number | null
          created_at: string | null
          description: string | null
          icon_type: string | null
          icon_value: string | null
          id: string
          is_active: boolean | null
          position: number
          style_override: Json | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          description?: string | null
          icon_type?: string | null
          icon_value?: string | null
          id?: string
          is_active?: boolean | null
          position: number
          style_override?: Json | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          description?: string | null
          icon_type?: string | null
          icon_value?: string | null
          id?: string
          is_active?: boolean | null
          position?: number
          style_override?: Json | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      profile_settings: {
        Row: {
          background_type: string | null
          background_value: string | null
          bio: string | null
          canonical_url: string | null
          created_at: string | null
          custom_body_code: string | null
          custom_css: string | null
          custom_head_code: string | null
          display_name: string | null
          facebook_pixel_id: string | null
          google_analytics_id: string | null
          google_tag_manager_id: string | null
          id: string
          og_description: string | null
          og_image: string | null
          og_title: string | null
          profile_image: string | null
          robots_directive: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          theme: string | null
          twitter_card_type: string | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string | null
        }
        Insert: {
          background_type?: string | null
          background_value?: string | null
          bio?: string | null
          canonical_url?: string | null
          created_at?: string | null
          custom_body_code?: string | null
          custom_css?: string | null
          custom_head_code?: string | null
          display_name?: string | null
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          id?: string
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          profile_image?: string | null
          robots_directive?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          theme?: string | null
          twitter_card_type?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string | null
        }
        Update: {
          background_type?: string | null
          background_value?: string | null
          bio?: string | null
          canonical_url?: string | null
          created_at?: string | null
          custom_body_code?: string | null
          custom_css?: string | null
          custom_head_code?: string | null
          display_name?: string | null
          facebook_pixel_id?: string | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          id?: string
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          profile_image?: string | null
          robots_directive?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          theme?: string | null
          twitter_card_type?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
