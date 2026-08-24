export interface CvProfile {
  network?: string;
  url: string;
  username?: string;
}

export interface CvBasics {
  name: string;
  label?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: string;
  profiles?: CvProfile[];
}

export interface CvWork {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  website?: string;
  summary?: string;
  description?: string;
  highlights?: string[];
}

export interface CvEducation {
  institution: string;
  startDate: string;
  url?: string;
  area?: string;
  studyType?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface CvSkill {
  name: string;
  level?: string;
  keywords: string[];
}

export interface CvProject {
  name: string;
  description?: string;
  highlights?: string[];
  github?: string;
  url?: string;
  image?: string;
  roles?: string[];
  entity?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface CvMeta {
  draft?: boolean;
}

export interface CvData {
  basics: CvBasics;
  work: CvWork[];
  education: CvEducation[];
  skills: CvSkill[];
  projects?: CvProject[];
  meta?: CvMeta;
}
