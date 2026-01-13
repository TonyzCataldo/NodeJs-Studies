export interface Subject {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  subjects: Subject[];
}

export const COURSES: Course[] = [
  {
    id: "esa",
    name: "ESA - Escola de Sargentos das Armas",
    subjects: [
      { id: "mat-esa", name: "Matemática" },
      { id: "por-esa", name: "Português" },
      { id: "his-esa", name: "História" },
      { id: "geo-esa", name: "Geografia" },
      { id: "ing-esa", name: "Inglês" },
    ],
  },
  {
    id: "espcex",
    name: "EsPCEx - Escola Preparatória de Cadetes",
    subjects: [
      { id: "fis-espcex", name: "Física" },
      { id: "qui-espcex", name: "Química" },
      { id: "mat-espcex", name: "Matemática" },
      { id: "por-espcex", name: "Português" },
      { id: "his-espcex", name: "História" },
      { id: "geo-espcex", name: "Geografia" },
      { id: "ing-espcex", name: "Inglês" },
    ],
  },
  {
    id: "eear",
    name: "EEAR - Escola de Especialistas de Aeronáutica",
    subjects: [
      { id: "fis-eear", name: "Física" },
      { id: "por-eear", name: "Português" },
      { id: "mat-eear", name: "Matemática" },
      { id: "ing-eear", name: "Inglês" },
    ],
  }
];

export const QUESTION_AMOUNTS = [10, 20, 30, 50];

export const FILTER_TYPES = [
  { id: "all", label: "Todas" },
  { id: "unanswered", label: "Não Resolvidas" },
  { id: "answered", label: "Resolvidas" },
  { id: "correct", label: "Acertei" },
  { id: "incorrect", label: "Errei" },
];
