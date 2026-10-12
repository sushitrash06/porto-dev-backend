export type BlockType =
  | 'HERO_PROFILE'
  | 'ABOUT_ME'
  | 'PROJECT_LIST'
  | 'EXPERIENCE_TIMELINE'
  | 'SKILLS_LIST'
  | 'SERVICES_GRID'
  | 'CONTACT_SECTION'
  | 'CUSTOM_BANNER';

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
    isVisible?: boolean;
    props?: Record<string, any>;
  }>;
}
