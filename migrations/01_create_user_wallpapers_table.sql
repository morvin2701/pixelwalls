-- Create the user_wallpapers table for Supabase
CREATE TABLE IF NOT EXISTS user_wallpapers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,  -- Using text to match application's userId format
    url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    resolution TEXT DEFAULT '4K',
    aspect_ratio TEXT DEFAULT '9:16',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    favorite BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'uncategorized',
    tags TEXT[] DEFAULT '{}'
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_wallpapers_user_id ON user_wallpapers(user_id);

-- RLS policies are not needed since we're not using Supabase Auth
-- The application handles authorization via the userId stored in localStorage