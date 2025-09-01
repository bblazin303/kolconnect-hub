-- Create RLS policies to enforce Twitter verification requirements

-- Prevent unverified projects from posting jobs
CREATE POLICY "Only verified projects can create campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND user_type = 'project' 
    AND twitter_verified = true
  )
);

-- Prevent unverified KOLs from applying to jobs
CREATE POLICY "Only verified KOLs can apply to campaigns" 
ON public.campaign_applications 
FOR INSERT 
WITH CHECK (
  auth.uid() = kol_id 
  AND EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND user_type = 'kol' 
    AND twitter_verified = true
  )
);

-- Update existing campaign policy to include verification check
DROP POLICY IF EXISTS "Project users can manage their campaigns" ON public.campaigns;

CREATE POLICY "Verified project users can manage their campaigns" 
ON public.campaigns 
FOR ALL 
USING (
  auth.uid() = project_id 
  AND EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND user_type = 'project' 
    AND twitter_verified = true
  )
);

-- Allow viewing campaigns for everyone (no verification needed to view)
CREATE POLICY "Anyone can view campaigns" 
ON public.campaigns 
FOR SELECT 
USING (true);