import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
    'https://okawhzshfmfwqkqtqinh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rYXdoenNoZm1md3FrcXRxaW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTA3MTcxOSwiZXhwIjoyMDI0NjQ3NzE5fQ.q8h6Yi8NDo4Mg2IyYG42KGIoTxKw7LxQH8s1dQml6DU'
);
