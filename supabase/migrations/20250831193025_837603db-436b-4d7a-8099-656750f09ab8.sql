-- Allow public access to view KOL profiles in the directory
CREATE POLICY "KOL profiles are publicly viewable" 
ON public.users 
FOR SELECT 
USING (user_type = 'kol');

-- Update kol_profiles policy to be more explicit about public access
DROP POLICY IF EXISTS "KOL profiles are publicly viewable" ON public.kol_profiles;
CREATE POLICY "KOL profiles are publicly viewable" 
ON public.kol_profiles 
FOR SELECT 
USING (true);