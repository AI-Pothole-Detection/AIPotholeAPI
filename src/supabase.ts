import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
    'https://okawhzshfmfwqkqtqinh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rYXdoenNoZm1md3FrcXRxaW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMTQwODQ1NywiZXhwIjoyMDI2OTg0NDU3fQ.DReHfW_fvKgZuhI5R-fP3b0lfQnL3J5n-XIDsBSrE_Y'
);
