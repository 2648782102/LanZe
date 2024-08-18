import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = 'https://cm1fnea5g6hclq1elci0.baseapi.memfiredb.com'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6MzI0MTAwMjkzNywiaWF0IjoxNzAzMDgyOTM3LCJpc3MiOiJzdXBhYmFzZSJ9.hDVwuxB19frPrPMkthZH1E9lgbuhaiIVxuX2IZ3iqyg'
  const supabase = createClient(supabaseUrl, supabaseKey)

  export default supabase;

//   supabase 连接信息