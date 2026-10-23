export interface ResumeData {
  info: PersonalInfo;
  theme?: ResumeTheme;
  ats?: AtsConfig;
  social_networks?: SocialNetwork[];
  personal_statement?: string;
  sections: ResumeSections;
}

export type ResumeTheme = 'classic' | 'modern' | 'contrast';

export interface AtsConfig {
  keywords?: string[];
}

export interface PersonalInfo {
  name: string;
  title: string;
  mobile?: string;
  email?: string;
  website?: string;
  address?: string;
  gender?: 'Male' | 'Female' | 'Other' | string;
}

export interface SocialNetwork {
  platform: string;
  username: string;
}

export interface ResumeSections {
  experiences?: Experience[];
  education?: Education[];
  projects?: Project[];
  skills?: SkillGroup[];
  languages?: Language[];
  awards?: Award[];
  certifications?: Certification[];
  publications?: Publication[];
  references?: Reference[];
}

export type DateString = `${number}-${number}` | 'Present' | string;

export interface Experience {
  company: string;
  position: string;
  start_date?: DateString;
  end_date?: DateString;
  highlights?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  start_date?: DateString;
  end_date?: DateString;
  highlights?: string[];
}

export interface Project {
  name: string;
  description: string;
  link?: string;
}

export interface SkillGroup {
  name: string;
  keywords?: string[];
}

export interface Language {
  name: string;
  proficiency?: 'Basic' | 'Intermediate' | 'Fluent' | 'Native' | string;
}

export interface Award {
  title: string;
  issuer?: string;
  date?: DateString;
  description?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: DateString;
}

export interface Publication {
  title: string;
  publisher?: string;
  date?: DateString;
  link?: string;
}

export interface Reference {
  name: string;
  position?: string;
  contact?: string;
}
