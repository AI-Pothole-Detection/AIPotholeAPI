export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            potholes: {
                Row: {
                    created_at: string;
                    expires_at: string;
                    id: number;
                    last_reported_at: string;
                    location: unknown;
                    reports: number;
                };
                Insert: {
                    created_at?: string;
                    expires_at?: string;
                    id?: number;
                    last_reported_at?: string;
                    location: unknown;
                    reports?: number;
                };
                Update: {
                    created_at?: string;
                    expires_at?: string;
                    id?: number;
                    last_reported_at?: string;
                    location?: unknown;
                    reports?: number;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            increment: {
                Args: {
                    id_to_increment: number;
                };
                Returns: undefined;
            };
            nearby_potholes: {
                Args: {
                    lat: number;
                    long: number;
                };
                Returns: {
                    id: number;
                    lat: number;
                    long: number;
                    dist_meters: number;
                }[];
            };
            nearby_restaurants: {
                Args: {
                    lat: number;
                    long: number;
                };
                Returns: {
                    id: number;
                    lat: number;
                    long: number;
                    dist_meters: number;
                }[];
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

export type Tables<
    PublicTableNameOrOptions extends
        | keyof (Database['public']['Tables'] & Database['public']['Views'])
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
              Database[PublicTableNameOrOptions['schema']]['Views'])
        : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
          Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
          Database['public']['Views'])
    ? (Database['public']['Tables'] &
          Database['public']['Views'])[PublicTableNameOrOptions] extends {
          Row: infer R;
      }
        ? R
        : never
    : never;

export type TablesInsert<
    PublicTableNameOrOptions extends
        | keyof Database['public']['Tables']
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
        : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
          Insert: infer I;
      }
        ? I
        : never
    : never;

export type TablesUpdate<
    PublicTableNameOrOptions extends
        | keyof Database['public']['Tables']
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
        : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
          Update: infer U;
      }
        ? U
        : never
    : never;

export type Enums<
    PublicEnumNameOrOptions extends
        | keyof Database['public']['Enums']
        | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
        : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
    : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;
