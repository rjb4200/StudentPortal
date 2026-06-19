CREATE POLICY "Admins can delete students" ON students
  FOR DELETE USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
