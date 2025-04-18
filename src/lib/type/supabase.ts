export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address_id: number | null
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          address_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          address_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: Database["public"]["Enums"]["categories_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: Database["public"]["Enums"]["categories_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: Database["public"]["Enums"]["categories_type"]
        }
        Relationships: []
      }
      clothings: {
        Row: {
          back_image_url: string | null
          brands_id: number | null
          categories_id: number | null
          created_at: string
          description: string | null
          expiry_back: string | null
          expiry_front: string | null
          front_image_url: string
          id: number
          last_modified: string | null
          name: string
          owned: boolean | null
          signed_back: string | null
          signed_front: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          back_image_url?: string | null
          brands_id?: number | null
          categories_id?: number | null
          created_at?: string
          description?: string | null
          expiry_back?: string | null
          expiry_front?: string | null
          front_image_url: string
          id?: number
          last_modified?: string | null
          name: string
          owned?: boolean | null
          signed_back?: string | null
          signed_front?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          back_image_url?: string | null
          brands_id?: number | null
          categories_id?: number | null
          created_at?: string
          description?: string | null
          expiry_back?: string | null
          expiry_front?: string | null
          front_image_url?: string
          id?: number
          last_modified?: string | null
          name?: string
          owned?: boolean | null
          signed_back?: string | null
          signed_front?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clothings_brands_id_fkey"
            columns: ["brands_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clothings_categories_id_fkey"
            columns: ["categories_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clothings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      clothings_colors: {
        Row: {
          clothing_id: number
          color_id: number
        }
        Insert: {
          clothing_id: number
          color_id: number
        }
        Update: {
          clothing_id?: number
          color_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "clothings_colors_clothing_id_fkey"
            columns: ["clothing_id"]
            isOneToOne: false
            referencedRelation: "clothings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clothings_colors_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
        ]
      }
      clothings_materials: {
        Row: {
          clothing_id: number
          material_id: number
        }
        Insert: {
          clothing_id: number
          material_id: number
        }
        Update: {
          clothing_id?: number
          material_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "clothings_materials_clothing_id_fkey"
            columns: ["clothing_id"]
            isOneToOne: false
            referencedRelation: "clothings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clothings_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      colors: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: Database["public"]["Enums"]["colors_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: Database["public"]["Enums"]["colors_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: Database["public"]["Enums"]["colors_type"]
        }
        Relationships: []
      }
      drawers: {
        Row: {
          created_at: string
          description: string | null
          drawer_name: string
          icon_url: string | null
          id: number
          sort_order: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          drawer_name: string
          icon_url?: string | null
          id?: number
          sort_order?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          drawer_name?: string
          icon_url?: string | null
          id?: number
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drawers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      drawers_clothings: {
        Row: {
          clothing_id: number
          created_at: string
          drawer_id: number
        }
        Insert: {
          clothing_id: number
          created_at?: string
          drawer_id: number
        }
        Update: {
          clothing_id?: number
          created_at?: string
          drawer_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "drawers_clothings_clothing_id_fkey"
            columns: ["clothing_id"]
            isOneToOne: false
            referencedRelation: "clothings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drawers_clothings_drawer_id_fkey"
            columns: ["drawer_id"]
            isOneToOne: false
            referencedRelation: "drawers"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          business_id: number
          clothings_id: number
          created_at: string
          description: string | null
          id: number
          price: number
          reviews_id: number | null
          status_id: number
          updated_at: string | null
        }
        Insert: {
          business_id: number
          clothings_id: number
          created_at?: string
          description?: string | null
          id?: number
          price: number
          reviews_id?: number | null
          status_id: number
          updated_at?: string | null
        }
        Update: {
          business_id?: number
          clothings_id?: number
          created_at?: string
          description?: string | null
          id?: number
          price?: number
          reviews_id?: number | null
          status_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_clothings_id_fkey"
            columns: ["clothings_id"]
            isOneToOne: false
            referencedRelation: "clothings"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: Database["public"]["Enums"]["materials_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: Database["public"]["Enums"]["materials_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: Database["public"]["Enums"]["materials_type"]
        }
        Relationships: []
      }
      model_images: {
        Row: {
          created_at: string
          description: string | null
          expiry_signed: string | null
          id: number
          image_url: string
          signed_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expiry_signed?: string | null
          id?: number
          image_url: string
          signed_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expiry_signed?: string | null
          id?: number
          image_url?: string
          signed_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      outfit_clothings: {
        Row: {
          clothing_id: number
          created_at: string
          outfit_id: number
          position: number | null
        }
        Insert: {
          clothing_id: number
          created_at?: string
          outfit_id: number
          position?: number | null
        }
        Update: {
          clothing_id?: number
          created_at?: string
          outfit_id?: number
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_clothings_clothing_id_fkey"
            columns: ["clothing_id"]
            isOneToOne: false
            referencedRelation: "clothings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_clothings_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfits: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          error: string | null
          expiry_cover: string | null
          id: number
          model_path: string
          outfit_name: string | null
          signed_cover: string | null
          status: Database["public"]["Enums"]["clothing_status"]
          task_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          error?: string | null
          expiry_cover?: string | null
          id?: number
          model_path: string
          outfit_name?: string | null
          signed_cover?: string | null
          status?: Database["public"]["Enums"]["clothing_status"]
          task_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          error?: string | null
          expiry_cover?: string | null
          id?: number
          model_path?: string
          outfit_name?: string | null
          signed_cover?: string | null
          status?: Database["public"]["Enums"]["clothing_status"]
          task_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      try_on_sessions: {
        Row: {
          clothings_id: number
          created_at: string
          error: string | null
          id: number
          model_images_id: number
          signed_expiry: string | null
          signed_try_on: string | null
          status: Database["public"]["Enums"]["clothing_status"] | null
          task_id: string | null
          try_on_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clothings_id: number
          created_at?: string
          error?: string | null
          id?: number
          model_images_id: number
          signed_expiry?: string | null
          signed_try_on?: string | null
          status?: Database["public"]["Enums"]["clothing_status"] | null
          task_id?: string | null
          try_on_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clothings_id?: number
          created_at?: string
          error?: string | null
          id?: number
          model_images_id?: number
          signed_expiry?: string | null
          signed_try_on?: string | null
          status?: Database["public"]["Enums"]["clothing_status"] | null
          task_id?: string | null
          try_on_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "try_on_sessions_clothings_id_fkey"
            columns: ["clothings_id"]
            isOneToOne: false
            referencedRelation: "clothings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "try_on_sessions_model_images_id_fkey"
            columns: ["model_images_id"]
            isOneToOne: false
            referencedRelation: "model_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "try_on_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      uploads: {
        Row: {
          id: number
          image_path: string
          session_token: string
          uploaded_at: string | null
        }
        Insert: {
          id?: number
          image_path: string
          session_token: string
          uploaded_at?: string | null
        }
        Update: {
          id?: number
          image_path?: string
          session_token?: string
          uploaded_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          id: number
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      waiting_list: {
        Row: {
          created_at: string
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_new_clothings: {
        Args: {
          p_clothing_name: string
          p_clothing_image_url: string
          p_user_id: string
          p_description: string
          p_colors: string[]
          p_brands: string
          p_materials: string[]
          p_category: string
        }
        Returns: number
      }
      add_new_models: {
        Args: { p_image_urls: string[]; p_user_id: string }
        Returns: number
      }
      create_new_outfit: {
        Args: {
          p_clothing_ids: number[]
          p_user_id: string
          p_cover_image_url: string
          p_model_path: string
          p_outfit_name?: string
        }
        Returns: number
      }
      find_outfit_id_by_combination: {
        Args: { p_item_id_1: number; p_item_id_2: number }
        Returns: number
      }
      get_clothings_for_outfit: {
        Args: { p_outfit_id: number }
        Returns: {
          clothing_id: number
          name: string
          description: string
          front_image_url: string
          back_image_url: string
          position: number
          created_at: string
        }[]
      }
      save_tryon: {
        Args: {
          p_clothing_name: string
          p_clothing_image_url: string
          p_user_id: string
          p_try_on_image_url: string
          p_task_id: string
          p_model_image_url: string
          p_description: string
          p_colors: string[]
          p_brands: string
          p_materials: string
          p_category: string
        }
        Returns: number
      }
      update_clothing_metadata: {
        Args: {
          p_user_id: string
          p_id: number
          p_name: string
          p_brands: string
          p_categories: string
          p_materials: string[]
          p_colors: string[]
        }
        Returns: undefined
      }
    }
    Enums: {
      categories_type:
        | "T-Shirts"
        | "Long-Sleeve Tops"
        | "Shirts"
        | "Sweaters"
        | "Hoodies"
        | "Sleeveless"
        | "Jeans"
        | "Pants"
        | "Skirts"
        | "Shorts"
        | "Athletic Bottoms"
        | "Coats"
        | "Jackets"
        | "Blazers"
        | "Dresses"
        | "Jumpsuits"
        | "Sneakers"
        | "Boots"
        | "Sandals"
        | "Heels"
        | "Flats"
        | "Formal Shoes"
        | "Bags"
        | "Scarves"
        | "Hats"
        | "Belts"
        | "Jewellery"
        | "Sunglasses"
        | "Watches"
        | "Ties"
        | "Socks"
        | "Swimwear"
        | "Loungewear"
      clothing_status:
        | "uploaded"
        | "processing"
        | "done"
        | "error"
        | "unavailable"
      colors_type:
        | "Black"
        | "White"
        | "Ivory / Cream"
        | "Grey"
        | "Charcoal"
        | "Beige / Tan"
        | "Brown"
        | "Navy"
        | "Red"
        | "Burgundy / Wine"
        | "Pink"
        | "Hot Pink / Fuchsia"
        | "Purple / Violet"
        | "Lavender / Lilac"
        | "Blue"
        | "Light Blue / Sky Blue"
        | "Teal / Turquoise"
        | "Green"
        | "Olive / Khaki"
        | "Mint / Sage"
        | "Yellow"
        | "Mustard"
        | "Orange"
        | "Rust / Terracotta"
        | "Coral / Peach"
        | "Gold"
        | "Silver"
        | "Bronze / Rose Gold"
      materials_type:
        | "Acetate"
        | "Acrylic"
        | "Alpaca"
        | "Bamboo Viscose"
        | "Cashmere"
        | "Chiffon"
        | "Corduroy"
        | "Cotton"
        | "Cupro"
        | "Denim"
        | "Down"
        | "Elastane"
        | "Faux Fur"
        | "Faux Leather"
        | "Flannel"
        | "Fleece"
        | "Hemp"
        | "Jersey"
        | "Jute"
        | "Lace"
        | "Leather"
        | "Linen"
        | "Lyocell"
        | "Mesh"
        | "Microfiber"
        | "Modal"
        | "Mohair"
        | "Neoprene"
        | "Nylon"
        | "Organic Cotton"
        | "Polyester"
        | "Polyurethane"
        | "Ramie"
        | "Rayon"
        | "Satin"
        | "Sequin"
        | "Silk"
        | "Spandex"
        | "Suede"
        | "Tencel"
        | "Terry Cloth"
        | "Tweed"
        | "Velvet"
        | "Viscose"
        | "Wool"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      categories_type: [
        "T-Shirts",
        "Long-Sleeve Tops",
        "Shirts",
        "Sweaters",
        "Hoodies",
        "Sleeveless",
        "Jeans",
        "Pants",
        "Skirts",
        "Shorts",
        "Athletic Bottoms",
        "Coats",
        "Jackets",
        "Blazers",
        "Dresses",
        "Jumpsuits",
        "Sneakers",
        "Boots",
        "Sandals",
        "Heels",
        "Flats",
        "Formal Shoes",
        "Bags",
        "Scarves",
        "Hats",
        "Belts",
        "Jewellery",
        "Sunglasses",
        "Watches",
        "Ties",
        "Socks",
        "Swimwear",
        "Loungewear",
      ],
      clothing_status: [
        "uploaded",
        "processing",
        "done",
        "error",
        "unavailable",
      ],
      colors_type: [
        "Black",
        "White",
        "Ivory / Cream",
        "Grey",
        "Charcoal",
        "Beige / Tan",
        "Brown",
        "Navy",
        "Red",
        "Burgundy / Wine",
        "Pink",
        "Hot Pink / Fuchsia",
        "Purple / Violet",
        "Lavender / Lilac",
        "Blue",
        "Light Blue / Sky Blue",
        "Teal / Turquoise",
        "Green",
        "Olive / Khaki",
        "Mint / Sage",
        "Yellow",
        "Mustard",
        "Orange",
        "Rust / Terracotta",
        "Coral / Peach",
        "Gold",
        "Silver",
        "Bronze / Rose Gold",
      ],
      materials_type: [
        "Acetate",
        "Acrylic",
        "Alpaca",
        "Bamboo Viscose",
        "Cashmere",
        "Chiffon",
        "Corduroy",
        "Cotton",
        "Cupro",
        "Denim",
        "Down",
        "Elastane",
        "Faux Fur",
        "Faux Leather",
        "Flannel",
        "Fleece",
        "Hemp",
        "Jersey",
        "Jute",
        "Lace",
        "Leather",
        "Linen",
        "Lyocell",
        "Mesh",
        "Microfiber",
        "Modal",
        "Mohair",
        "Neoprene",
        "Nylon",
        "Organic Cotton",
        "Polyester",
        "Polyurethane",
        "Ramie",
        "Rayon",
        "Satin",
        "Sequin",
        "Silk",
        "Spandex",
        "Suede",
        "Tencel",
        "Terry Cloth",
        "Tweed",
        "Velvet",
        "Viscose",
        "Wool",
      ],
    },
  },
} as const
