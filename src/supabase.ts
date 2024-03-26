import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
    'https://okawhzshfmfwqkqtqinh.supabase.co',
    Bun.env.SUPABASE_SERVICE_TOKEN || ""
);
