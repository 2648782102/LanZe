import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = 'https://caqm0ri5g6h17oismvp0.baseapi.memfiredb.com'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6MzE5Mzk3MzkyOSwiaWF0IjoxNjU2MDUzOTI5LCJpc3MiOiJzdXBhYmFzZSJ9.pDkmh4NNw19c9lJIQUpidkadJHrKhlsB-e3ZdHGD6tA'
  const supabase = createClient(supabaseUrl, supabaseKey)

  export default supabase;

//   supabase 连接信息