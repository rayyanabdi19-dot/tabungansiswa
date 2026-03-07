
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'parent');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role app_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nis TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  parent_name TEXT NOT NULL DEFAULT '',
  parent_phone TEXT NOT NULL DEFAULT '',
  balance BIGINT NOT NULL DEFAULT 0,
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('setoran', 'penarikan')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  note TEXT DEFAULT '',
  balance_after BIGINT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  remaining BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'cancelled')),
  note TEXT DEFAULT '',
  due_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Loan payments table
CREATE TABLE public.loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

-- School settings table
CREATE TABLE public.school_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  npsn TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  province TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  principal TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'admin'));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'admin'));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: users can read own, admins can read all
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User roles: users can read own
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Students: admins full access, parents read only their children
CREATE POLICY "Admins can do everything with students" ON public.students
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can view their children" ON public.students
  FOR SELECT USING (parent_user_id = auth.uid());

-- Transactions: admins full access, parents read only their children's
CREATE POLICY "Admins full access transactions" ON public.transactions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can view children transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = transactions.student_id
      AND students.parent_user_id = auth.uid()
    )
  );

-- Loans: admins full access, parents read only their children's
CREATE POLICY "Admins full access loans" ON public.loans
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can view children loans" ON public.loans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = loans.student_id
      AND students.parent_user_id = auth.uid()
    )
  );

-- Loan payments: admins full access, parents read only
CREATE POLICY "Admins full access loan_payments" ON public.loan_payments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can view children loan payments" ON public.loan_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.loans
      JOIN public.students ON students.id = loans.student_id
      WHERE loans.id = loan_payments.loan_id
      AND students.parent_user_id = auth.uid()
    )
  );

-- School settings: admins full access, all authenticated can read
CREATE POLICY "Anyone can read school settings" ON public.school_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage school settings" ON public.school_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
