/**
 * @file SubPages.tsx
 * @description Standalone routes for individual portfolio sections. Each composes the
 * shared SectionPage layout with one or more section components exported from
 * ProfessionalView. These back the /about, /experience, /skills, /certifications, and
 * /contact routes — the foundation for the multi-page redesign.
 */

import { SectionPage } from './SectionPage';
import {
  AboutBand,
  Stats,
  ExperienceSection,
  Timeline,
  SkillsCloud,
  CertificationsSection,
  ContactCTA,
} from './ProfessionalView';

export function AboutPage() {
  return (
    <SectionPage title="About" active="/about">
      <AboutBand />
      <Stats />
    </SectionPage>
  );
}

export function ExperiencePage() {
  return (
    <SectionPage title="Experience" active="/experience">
      <Timeline />
      <ExperienceSection />
    </SectionPage>
  );
}

export function SkillsPage() {
  return (
    <SectionPage title="Skills" active="/skills">
      <SkillsCloud />
    </SectionPage>
  );
}

export function CertificationsPage() {
  return (
    <SectionPage title="Certifications" active="/certifications">
      <CertificationsSection />
    </SectionPage>
  );
}

export function ContactPage() {
  return (
    <SectionPage title="Contact" active="/contact">
      <ContactCTA />
    </SectionPage>
  );
}
