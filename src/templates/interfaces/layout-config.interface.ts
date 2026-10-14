export type BlockType =
  | 'HERO_PROFILE'
  | 'ABOUT_ME'
  | 'PROJECT_LIST'
  | 'EXPERIENCE_TIMELINE'
  | 'SKILLS_LIST'
  | 'SERVICES_GRID'
  | 'CONTACT_SECTION'
  | 'CUSTOM_BANNER'
  | 'CLIENTS_LOGO'
  | 'TESTIMONIALS'
  | 'COMPANY_STATS'
  | 'TEAM_MEMBERS'
  | 'PROCESS_WORKFLOW'
  | 'FAQ_ACCORDION'
  | 'CTA_BANNER';

export interface ThemeTokens {
  fontFamily: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor: string;
  surfaceColor?: string;
  textColor?: string;
  borderRadius?: string;
  darkMode?: boolean;
}

// ─── Business Section Prop Models ──────────────────────────────────────────

export interface ClientLogoItem {
  id?: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
}

export interface ClientsLogoProps {
  title?: string;
  subtitle?: string;
  logos: ClientLogoItem[];
}

export interface TestimonialItem {
  id?: string;
  clientName: string;
  clientRole?: string;
  clientCompany?: string;
  avatarUrl?: string;
  rating?: number;
  content: string;
}

export interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials: TestimonialItem[];
}

export interface CompanyStatItem {
  id?: string;
  value: string;
  label: string;
  description?: string;
}

export interface CompanyStatsProps {
  title?: string;
  subtitle?: string;
  stats: CompanyStatItem[];
}

export interface TeamMemberItem {
  id?: string;
  name: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface TeamMembersProps {
  title?: string;
  subtitle?: string;
  members: TeamMemberItem[];
}

export interface ProcessStepItem {
  id?: string;
  step: string;
  title: string;
  description: string;
  icon?: string;
}

export interface ProcessWorkflowProps {
  title?: string;
  subtitle?: string;
  steps: ProcessStepItem[];
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  title?: string;
  subtitle?: string;
  faqs: FaqItem[];
}

export interface CtaBannerProps {
  title: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
}

// ─── Core Layout Models ───────────────────────────────────────────────────

export interface SectionBlock {
  id: string;
  type: BlockType | string;
  title?: string;
  variant?: string;
  isVisible: boolean;
  props?: Record<string, any>;
}

export interface LayoutConfig {
  theme: ThemeTokens;
  sections: SectionBlock[];
}

export interface UserCustomConfig {
  theme?: Partial<ThemeTokens>;
  sections?: Array<{
    id: string;
    type?: string;
    title?: string;
    variant?: string;
    isVisible?: boolean;
    props?: Record<string, any>;
  }>;
}
