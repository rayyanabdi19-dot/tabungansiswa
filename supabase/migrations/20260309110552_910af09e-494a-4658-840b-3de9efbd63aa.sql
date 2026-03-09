
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- students
DROP POLICY IF EXISTS "Admins can do everything with students" ON public.students;
DROP POLICY IF EXISTS "Parents can view their children" ON public.students;
CREATE POLICY "Admins can do everything with students" ON public.students FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view their children" ON public.students FOR SELECT TO authenticated USING (parent_user_id = auth.uid());

-- transactions
DROP POLICY IF EXISTS "Admins full access transactions" ON public.transactions;
DROP POLICY IF EXISTS "Parents can view children transactions" ON public.transactions;
CREATE POLICY "Admins full access transactions" ON public.transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view children transactions" ON public.transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM students WHERE students.id = transactions.student_id AND students.parent_user_id = auth.uid()));

-- loans
DROP POLICY IF EXISTS "Admins full access loans" ON public.loans;
DROP POLICY IF EXISTS "Parents can view children loans" ON public.loans;
CREATE POLICY "Admins full access loans" ON public.loans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view children loans" ON public.loans FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM students WHERE students.id = loans.student_id AND students.parent_user_id = auth.uid()));

-- loan_payments
DROP POLICY IF EXISTS "Admins full access loan_payments" ON public.loan_payments;
DROP POLICY IF EXISTS "Parents can view children loan payments" ON public.loan_payments;
CREATE POLICY "Admins full access loan_payments" ON public.loan_payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view children loan payments" ON public.loan_payments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM loans JOIN students ON students.id = loans.student_id WHERE loans.id = loan_payments.loan_id AND students.parent_user_id = auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- user_roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- school_settings
DROP POLICY IF EXISTS "Admins can manage school settings" ON public.school_settings;
DROP POLICY IF EXISTS "Anyone can read school settings" ON public.school_settings;
CREATE POLICY "Admins can manage school settings" ON public.school_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read school settings" ON public.school_settings FOR SELECT TO authenticated USING (true);
