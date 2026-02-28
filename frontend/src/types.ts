export interface AmbossImage {
  eid: string;
  url: string;
  title: string;
  description: string;
  local_path: string;
  overlay_url?: string;
  overlay_local_path?: string;
}

export interface AmbossAnswer {
  letter: string;
  content: string;
  is_correct: boolean;
  explanation_why: string;
  explanation_but: string;
  selection_rate: number;
  images?: AmbossImage[];
}

export interface AmbossQuestion {
  eid: string;
  question_text: string;
  content_preview: string;
  correct_answer: string;
  difficulty: number;
  hint: string;
  learning_objective: string;
  source: string | null;
  answers: AmbossAnswer[];
  lab_values: string;
  images?: AmbossImage[];
  case?: { description: string; content: string };
}

export interface Subject {
  id: string;
  name: string;
  file: string;
  count: number;
  children?: Subject[];
}
