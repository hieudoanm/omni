import { FC, ReactNode } from 'react';
import { PiArrowUpRight, PiBookOpen, PiBriefcase, PiCpu, PiFolderOpen } from 'react-icons/pi';
import type { ResumeEducation, ResumeExperience, ResumeProject, ResumeSkillGroup } from './data';

const SectionHeading: FC<{
  icon: ReactNode;
  title: string;
  eyebrow: string;
}> = ({ icon, title, eyebrow }) => (
  <div className='mb-6 flex items-center gap-4'>
    <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl'>
      {icon}
    </div>
    <div>
      <p className='text-primary text-xs tracking-[0.2em] uppercase'>{eyebrow}</p>
      <h2 className='text-xl'>{title}</h2>
    </div>
  </div>
);

export const ExperienceSection: FC<{
  experiences: ResumeExperience[];
}> = ({ experiences }) => (
  <section id='experience' className='py-10'>
    <SectionHeading
      icon={<PiBriefcase className='h-5 w-5' />}
      title='Work experience'
      eyebrow='Experience'
    />
    <div className='flex flex-col gap-4'>
      {experiences.map((exp) => (
        <article
          key={`${exp.role}-${exp.company}`}
          className='border-base-content/10 bg-base-200 rounded-2xl border p-6'>
          <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
            <div>
              <h3 className='text-base font-medium'>{exp.role}</h3>
              <p className='text-primary mt-0.5 text-sm'>{exp.company}</p>
            </div>
            <span className='badge badge-ghost badge-sm rounded-full'>{exp.period}</span>
          </div>
          <p className='text-base-content/40 mb-3 text-xs'>{exp.location}</p>
          <p className='text-base-content/60 mb-4 text-sm leading-relaxed'>{exp.summary}</p>
          <ul className='flex flex-col gap-1.5'>
            {exp.highlights.map((highlight) => (
              <li key={highlight} className='text-base-content/60 text-sm'>
                <span className='text-primary mr-2'>&rsaquo;</span>
                {highlight}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  </section>
);

export const ProjectSection: FC<{
  projects: ResumeProject[];
}> = ({ projects }) => (
  <section id='projects' className='py-10'>
    <SectionHeading
      icon={<PiFolderOpen className='h-5 w-5' />}
      title='Selected projects'
      eyebrow='Projects'
    />
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {projects.map((project) => (
        <article
          key={project.name}
          className='border-base-content/10 bg-base-200 hover:border-primary/50 flex flex-col rounded-2xl border p-6 transition-colors'>
          <div className='mb-3 flex items-start justify-between gap-2'>
            <h3 className='text-base font-medium'>{project.name}</h3>
            {project.url && (
              <a
                href={project.url}
                target='_blank'
                rel='noreferrer'
                className='text-base-content/40 hover:text-primary transition-colors'
                aria-label={`Open ${project.name}`}>
                <PiArrowUpRight className='h-4 w-4' />
              </a>
            )}
          </div>
          <p className='text-base-content/60 mb-4 text-sm leading-relaxed'>{project.description}</p>
          <div className='mt-auto flex flex-wrap gap-2'>
            {project.tech.map((tech) => (
              <span key={tech} className='badge badge-ghost badge-sm'>
                {tech}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  </section>
);

export const SkillSection: FC<{
  skills: ResumeSkillGroup[];
}> = ({ skills }) => (
  <section id='skills' className='py-10'>
    <SectionHeading
      icon={<PiCpu className='h-5 w-5' />}
      title='Skills &amp; tools'
      eyebrow='Skills'
    />
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      {skills.map((group) => (
        <div
          key={group.label}
          className='border-base-content/10 bg-base-200 rounded-2xl border p-6'>
          <p className='mb-4 text-sm font-medium'>{group.label}</p>
          <div className='flex flex-wrap gap-2'>
            {group.skills.map((skill) => (
              <span key={skill} className='badge badge-outline badge-sm'>
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const EducationSection: FC<{
  education: ResumeEducation[];
}> = ({ education }) => (
  <section id='education' className='py-10'>
    <SectionHeading
      icon={<PiBookOpen className='h-5 w-5' />}
      title='Education'
      eyebrow='Education'
    />
    <div className='flex flex-col gap-4'>
      {education.map((item) => (
        <article
          key={`${item.degree}-${item.school}`}
          className='border-base-content/10 bg-base-200 rounded-2xl border p-6'>
          <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
            <div>
              <h3 className='text-base font-medium'>{item.degree}</h3>
              <p className='text-base-content/50 mt-0.5 text-sm'>{item.school}</p>
            </div>
            <span className='badge badge-ghost badge-sm rounded-full'>{item.period}</span>
          </div>
          <p className='text-base-content/40 mb-3 text-xs'>{item.location}</p>
          <p className='text-base-content/60 text-sm leading-relaxed'>{item.details}</p>
        </article>
      ))}
    </div>
  </section>
);
