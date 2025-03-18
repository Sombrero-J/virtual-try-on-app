export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          address_id: number | null;
          created_at: string;
          description: string | null;
          id: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          address_id?: number | null;
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          address_id?: number | null;
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      clothings: {
        Row: {
          back_image_url: string | null;
          brands_id: number | null;
          categories_id: number | null;
          colors_id: number | null;
          created_at: string;
          description: string | null;
          expiry_back: string | null;
          expiry_front: string | null;
          front_image_url: string;
          id: number;
          materials_id: number | null;
          name: string | null;
          signed_back: string | null;
          signed_front: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          back_image_url?: string | null;
          brands_id?: number | null;
          categories_id?: number | null;
          colors_id?: number | null;
          created_at?: string;
          description?: string | null;
          expiry_back?: string | null;
          expiry_front?: string | null;
          front_image_url: string;
          id?: number;
          materials_id?: number | null;
          name?: string | null;
          signed_back?: string | null;
          signed_front?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          back_image_url?: string | null;
          brands_id?: number | null;
          categories_id?: number | null;
          colors_id?: number | null;
          created_at?: string;
          description?: string | null;
          expiry_back?: string | null;
          expiry_front?: string | null;
          front_image_url?: string;
          id?: number;
          materials_id?: number | null;
          name?: string | null;
          signed_back?: string | null;
          signed_front?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clothings_brands_id_fkey";
            columns: ["brands_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clothings_categories_id_fkey";
            columns: ["categories_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clothings_colors_id_fkey";
            columns: ["colors_id"];
            isOneToOne: false;
            referencedRelation: "colors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clothings_materials_id_fkey";
            columns: ["materials_id"];
            isOneToOne: false;
            referencedRelation: "materials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clothings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["user_id"];
          }
        ];
      };
      colors: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      drawers: {
        Row: {
          created_at: string;
          description: string | null;
          drawer_name: string;
          icon_url: string | null;
          id: number;
          sort_order: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          drawer_name: string;
          icon_url?: string | null;
          id?: number;
          sort_order?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          drawer_name?: string;
          icon_url?: string | null;
          id?: number;
          sort_order?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "drawers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["user_id"];
          }
        ];
      };
      drawers_clothings: {
        Row: {
          clothing_id: number;
          created_at: string;
          drawer_id: number;
        };
        Insert: {
          clothing_id: number;
          created_at?: string;
          drawer_id: number;
        };
        Update: {
          clothing_id?: number;
          created_at?: string;
          drawer_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "drawers_clothings_clothing_id_fkey";
            columns: ["clothing_id"];
            isOneToOne: false;
            referencedRelation: "clothings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "drawers_clothings_drawer_id_fkey";
            columns: ["drawer_id"];
            isOneToOne: false;
            referencedRelation: "drawers";
            referencedColumns: ["id"];
          }
        ];
      };
      items: {
        Row: {
          business_id: number;
          clothings_id: number;
          created_at: string;
          description: string | null;
          id: number;
          price: number;
          reviews_id: number | null;
          status_id: number;
          updated_at: string | null;
        };
        Insert: {
          business_id: number;
          clothings_id: number;
          created_at?: string;
          description?: string | null;
          id?: number;
          price: number;
          reviews_id?: number | null;
          status_id: number;
          updated_at?: string | null;
        };
        Update: {
          business_id?: number;
          clothings_id?: number;
          created_at?: string;
          description?: string | null;
          id?: number;
          price?: number;
          reviews_id?: number | null;
          status_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "items_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "items_clothings_id_fkey";
            columns: ["clothings_id"];
            isOneToOne: false;
            referencedRelation: "clothings";
            referencedColumns: ["id"];
          }
        ];
      };
      materials: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      model_images: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          image_url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          image_url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          image_url?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "model_images_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["user_id"];
          }
        ];
      };
      outfit_clothings: {
        Row: {
          clothing_id: number;
          created_at: string;
          outfit_id: number;
          position: number | null;
        };
        Insert: {
          clothing_id: number;
          created_at?: string;
          outfit_id: number;
          position?: number | null;
        };
        Update: {
          clothing_id?: number;
          created_at?: string;
          outfit_id?: number;
          position?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "outfit_clothings_clothing_id_fkey";
            columns: ["clothing_id"];
            isOneToOne: false;
            referencedRelation: "clothings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outfit_clothings_outfit_id_fkey";
            columns: ["outfit_id"];
            isOneToOne: false;
            referencedRelation: "outfits";
            referencedColumns: ["id"];
          }
        ];
      };
      outfits: {
        Row: {
          cover_image_url: string;
          created_at: string;
          description: string | null;
          expiry_cover: string | null;
          id: number;
          outfit_name: string | null;
          signed_cover: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          cover_image_url: string;
          created_at?: string;
          description?: string | null;
          expiry_cover?: string | null;
          id?: number;
          outfit_name?: string | null;
          signed_cover?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          cover_image_url?: string;
          created_at?: string;
          description?: string | null;
          expiry_cover?: string | null;
          id?: number;
          outfit_name?: string | null;
          signed_cover?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "outfits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["user_id"];
          }
        ];
      };
      try_on_sessions: {
        Row: {
          clothings_id: number;
          created_at: string;
          id: number;
          model_images_id: number;
          signed_expiry: string | null;
          signed_try_on: string | null;
          task_id: string;
          try_on_url: string;
          user_id: string;
        };
        Insert: {
          clothings_id: number;
          created_at?: string;
          id?: number;
          model_images_id: number;
          signed_expiry?: string | null;
          signed_try_on?: string | null;
          task_id: string;
          try_on_url: string;
          user_id: string;
        };
        Update: {
          clothings_id?: number;
          created_at?: string;
          id?: number;
          model_images_id?: number;
          signed_expiry?: string | null;
          signed_try_on?: string | null;
          task_id?: string;
          try_on_url?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "try_on_sessions_clothings_id_fkey";
            columns: ["clothings_id"];
            isOneToOne: false;
            referencedRelation: "clothings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "try_on_sessions_model_images_id_fkey";
            columns: ["model_images_id"];
            isOneToOne: false;
            referencedRelation: "model_images";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "try_on_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["user_id"];
          }
        ];
      };
      uploads: {
        Row: {
          id: number;
          image_path: string;
          session_token: string;
          uploaded_at: string | null;
        };
        Insert: {
          id?: number;
          image_path: string;
          session_token: string;
          uploaded_at?: string | null;
        };
        Update: {
          id?: number;
          image_path?: string;
          session_token?: string;
          uploaded_at?: string | null;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          created_at: string;
          email: string;
          id: number;
          updated_at: string | null;
          user_id: string;
          username: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: number;
          updated_at?: string | null;
          user_id: string;
          username?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: number;
          updated_at?: string | null;
          user_id?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      waiting_list: {
        Row: {
          created_at: string;
          email: string;
          id: number;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: number;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_clothings_for_outfit: {
        Args: {
          p_outfit_id: number;
        };
        Returns: {
          clothing_id: number;
          name: string;
          description: string;
          front_image_url: string;
          back_image_url: string;
          position: number;
          created_at: string;
        }[];
      };
      save_try_on_to_wardrobe: {
        Args: {
          p_user_id: string;
          p_clothing_name: string;
          p_task_id: string;
          p_clothing_image_url: string;
          p_model_image_url: string;
          p_try_on_image_url: string;
        };
        Returns: number;
      };
      upload_clothings: {
        Args: {
          user_id: string;
          file_path: string;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
