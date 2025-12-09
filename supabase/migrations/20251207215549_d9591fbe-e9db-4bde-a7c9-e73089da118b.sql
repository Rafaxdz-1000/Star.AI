-- Create enums
CREATE TYPE public.gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE public.marital_status_enum AS ENUM ('single', 'married', 'divorced', 'widowed', 'separated', 'union');
CREATE TYPE public.scenario_type_enum AS ENUM ('probable', 'possible', 'bold');

-- Create form_data table
CREATE TABLE public.form_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  age INTEGER NOT NULL,
  gender gender_enum NOT NULL,
  profession VARCHAR(255) NOT NULL,
  studying BOOLEAN NOT NULL,
  study_level VARCHAR(255),
  marital_status marital_status_enum NOT NULL,
  has_children BOOLEAN NOT NULL,
  children_quantity INTEGER,
  state VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(255),
  hand_photo_url VARCHAR(500) NOT NULL,
  main_objective_other VARCHAR(500),
  area_to_improve_other VARCHAR(500),
  current_challenge_other VARCHAR(500)
);

-- Create form_data_main_objectives table
CREATE TABLE public.form_data_main_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_data_id UUID NOT NULL REFERENCES public.form_data(id) ON DELETE CASCADE,
  objective VARCHAR(500) NOT NULL
);

-- Create form_data_areas_to_improve table
CREATE TABLE public.form_data_areas_to_improve (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_data_id UUID NOT NULL REFERENCES public.form_data(id) ON DELETE CASCADE,
  area VARCHAR(500) NOT NULL
);

-- Create form_data_current_challenges table
CREATE TABLE public.form_data_current_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_data_id UUID NOT NULL REFERENCES public.form_data(id) ON DELETE CASCADE,
  challenge VARCHAR(500) NOT NULL
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  form_data_id UUID NOT NULL UNIQUE REFERENCES public.form_data(id) ON DELETE CASCADE,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  summary TEXT NOT NULL,
  destiny_number INTEGER NOT NULL,
  numerology_meaning TEXT NOT NULL
);

-- Create report_rituals table
CREATE TABLE public.report_rituals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  ritual VARCHAR(500) NOT NULL
);

-- Create report_scenarios table
CREATE TABLE public.report_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  scenario_type scenario_type_enum NOT NULL,
  description VARCHAR(500) NOT NULL
);

-- Create report_insights table
CREATE TABLE public.report_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  insight VARCHAR(500) NOT NULL
);

-- Create report_numerology_mega_sena table
CREATE TABLE public.report_numerology_mega_sena (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  number INTEGER NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_form_data_updated_at
  BEFORE UPDATE ON public.form_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.form_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_data_main_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_data_areas_to_improve ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_data_current_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_numerology_mega_sena ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_data (public inserts, read by form_data_id)
CREATE POLICY "Anyone can insert form_data" ON public.form_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read form_data by id" ON public.form_data FOR SELECT USING (true);

-- RLS Policies for form_data_main_objectives
CREATE POLICY "Anyone can insert objectives" ON public.form_data_main_objectives FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read objectives" ON public.form_data_main_objectives FOR SELECT USING (true);

-- RLS Policies for form_data_areas_to_improve
CREATE POLICY "Anyone can insert areas" ON public.form_data_areas_to_improve FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read areas" ON public.form_data_areas_to_improve FOR SELECT USING (true);

-- RLS Policies for form_data_current_challenges
CREATE POLICY "Anyone can insert challenges" ON public.form_data_current_challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read challenges" ON public.form_data_current_challenges FOR SELECT USING (true);

-- RLS Policies for reports
CREATE POLICY "Anyone can insert reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Anyone can update reports" ON public.reports FOR UPDATE USING (true);

-- RLS Policies for report_rituals
CREATE POLICY "Anyone can insert rituals" ON public.report_rituals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read rituals" ON public.report_rituals FOR SELECT USING (true);

-- RLS Policies for report_scenarios
CREATE POLICY "Anyone can insert scenarios" ON public.report_scenarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read scenarios" ON public.report_scenarios FOR SELECT USING (true);

-- RLS Policies for report_insights
CREATE POLICY "Anyone can insert insights" ON public.report_insights FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read insights" ON public.report_insights FOR SELECT USING (true);

-- RLS Policies for report_numerology_mega_sena
CREATE POLICY "Anyone can insert mega_sena" ON public.report_numerology_mega_sena FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read mega_sena" ON public.report_numerology_mega_sena FOR SELECT USING (true);

-- Create storage bucket for hand photos
INSERT INTO storage.buckets (id, name, public) VALUES ('hand-photos', 'hand-photos', true);

-- Storage policies for hand photos
CREATE POLICY "Anyone can upload hand photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hand-photos');
CREATE POLICY "Anyone can view hand photos" ON storage.objects FOR SELECT USING (bucket_id = 'hand-photos');