// This will be replaced by actual Supabase client initialization
// when credentials are provided.

export const supabase = {
  // Placeholder mock
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: (data: any) => Promise.resolve({ data, error: null }),
    update: (data: any) => Promise.resolve({ data, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
};
