-- ============================================
-- AI ATTENDANCE AGENT - DATABASE FIX
-- ============================================

-- 1. Add missing face enrollment column
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS face_enrolled BOOLEAN DEFAULT FALSE NOT NULL;


-- 2. Check the actual students columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'students'
ORDER BY ordinal_position;