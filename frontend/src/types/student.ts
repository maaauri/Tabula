export interface Student {
  id: string;
  rut: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  grade: string | null;
  school_name: string | null;
  diagnosis: string | null;
  needs: string[];
  assigned_educator_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentCreate {
  rut?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  grade?: string;
  school_name?: string;
  diagnosis?: string;
  needs?: string[];
}

export interface StudentUpdate extends Partial<StudentCreate> {}
