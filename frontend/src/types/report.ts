export interface ReportSection {
  id: string;
  report_id: string;
  section_key: string;
  title: string;
  content: string;
  order_index: number;
  updated_at: string;
}

export interface Report {
  id: string;
  student_id: string;
  author_id: string;
  template_id: string | null;
  title: string;
  period: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  sections: ReportSection[];
}

export interface ReportCreate {
  student_id: string;
  template_id?: string;
  title: string;
  period?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  sections: { key: string; title: string; order: number }[];
  created_at: string;
}
