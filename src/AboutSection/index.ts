// src/AboutSection/index.ts

export { default as AboutSection } from './AboutSection';
export { default as TechSpecs } from './TechSpecs';
export { default as InteractiveModel } from './InteractiveModel';

export interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface ProcessStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}

export interface SpecificationProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
}

export interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
}
