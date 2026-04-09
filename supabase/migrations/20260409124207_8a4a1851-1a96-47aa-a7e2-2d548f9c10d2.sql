
-- Add owner_id to students table
ALTER TABLE public.students ADD COLUMN owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add owner_id to school_settings table  
ALTER TABLE public.school_settings ADD COLUMN owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old admin RLS policies
DROP POLICY IF EXISTS "Admins can do everything with students" ON public.students;
DROP POLICY IF EXISTS "Admins full access transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins full access loans" ON public.loans;
DROP POLICY IF EXISTS "Admins full access loan_payments" ON public.loan_payments;
DROP POLICY IF EXISTS "Admins can manage school settings" ON public.school_settings;

-- Students: admin can only access own students
CREATE POLICY "Admins manage own students"
ON public.students FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND owner_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND owner_id = auth.uid());

-- Transactions: admin can only access transactions of own students
CREATE POLICY "Admins manage own transactions"
ON public.transactions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM students WHERE students.id = transactions.student_id AND students.owner_id = auth.uid()
))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM students WHERE students.id = transactions.student_id AND students.owner_id = auth.uid()
));

-- Loans: admin can only access loans of own students
CREATE POLICY "Admins manage own loans"
ON public.loans FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM students WHERE students.id = loans.student_id AND students.owner_id = auth.uid()
))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM students WHERE students.id = loans.student_id AND students.owner_id = auth.uid()
));

-- Loan payments: admin can only access payments of own students' loans
CREATE POLICY "Admins manage own loan_payments"
ON public.loan_payments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM loans JOIN students ON students.id = loans.student_id
  WHERE loans.id = loan_payments.loan_id AND students.owner_id = auth.uid()
))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM loans JOIN students ON students.id = loans.student_id
  WHERE loans.id = loan_payments.loan_id AND students.owner_id = auth.uid()
));

-- School settings: admin can only manage own settings
CREATE POLICY "Admins manage own school_settings"
ON public.school_settings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND owner_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND owner_id = auth.uid());

-- Keep public read for school settings (for PDF headers etc)
DROP POLICY IF EXISTS "Anyone can read school settings" ON public.school_settings;
CREATE POLICY "Authenticated can read own school settings"
ON public.school_settings FOR SELECT TO authenticated
USING (owner_id = auth.uid());

-- Update link_parent_to_student to still work (SECURITY DEFINER bypasses RLS)
