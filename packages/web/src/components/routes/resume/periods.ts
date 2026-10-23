interface TimelineEntry {
  startYear: number;
  endYear: number;
  date: string;
  title: string;
  subtitle: string;
  location: string;
}

export interface Period {
  label: string;
  education: (TimelineEntry & { icon: string }) | null;
  experience: (TimelineEntry & { icon: string }) | null;
}

const rmit: TimelineEntry & { icon: string } = {
  icon: '🎓',
  startYear: 2022,
  endYear: 2025,
  date: 'Oct 2022 - Sep 2025',
  title: 'Bachelor of Psychology',
  subtitle: 'RMIT University',
  location: 'Ho Chi Minh City, Vietnam',
};

const lab: TimelineEntry & { icon: string } = {
  icon: '🎓',
  startYear: 2013,
  endYear: 2016,
  date: 'Sep 2013 - Dec 2016',
  title: 'Bachelor of BIT',
  subtitle: 'LAB University of Applied Sciences',
  location: 'Lahti, Finland',
};

const nabLead: TimelineEntry & { icon: string } = {
  icon: '💼',
  startYear: 2026,
  endYear: 2026,
  date: 'Jan 2026 - Present',
  title: 'Engineer, Lead',
  subtitle: 'NAB',
  location: 'Ho Chi Minh City, Vietnam',
};

const nabSr: TimelineEntry & { icon: string } = {
  icon: '💼',
  startYear: 2024,
  endYear: 2025,
  date: 'Jan 2024 - Dec 2025',
  title: 'Engineer, Senior Analyst',
  subtitle: 'NAB',
  location: 'Ho Chi Minh City, Vietnam',
};

const nabAnalyst: TimelineEntry & { icon: string } = {
  icon: '💼',
  startYear: 2021,
  endYear: 2023,
  date: 'Aug 2021 - Dec 2023',
  title: 'Engineer, Analyst',
  subtitle: 'NAB',
  location: 'Ho Chi Minh City, Vietnam',
};

const boost: TimelineEntry & { icon: string } = {
  icon: '💼',
  startYear: 2019,
  endYear: 2021,
  date: 'Mar 2019 - Apr 2021',
  title: 'Back-end Engineer',
  subtitle: 'BoostCommerce',
  location: 'Hanoi, Vietnam',
};

const admetrics: TimelineEntry & { icon: string } = {
  icon: '💼',
  startYear: 2017,
  endYear: 2019,
  date: 'Mar 2017 - Jan 2019',
  title: 'Front-end Engineer',
  subtitle: 'admetrics',
  location: 'Frankfurt am Main, Germany',
};

const witrafi: TimelineEntry & { icon: string } = {
  icon: '💼',
  startYear: 2015,
  endYear: 2017,
  date: 'Jan 2015 - Feb 2017',
  title: 'Front-end Engineer',
  subtitle: 'Witrafi',
  location: 'Helsinki, Finland',
};

export const PERIODS: Period[] = [
  { label: '2026', education: null, experience: nabLead },
  { label: '2025', education: null, experience: null },
  { label: '2024', education: null, experience: nabSr },
  { label: '2023', education: null, experience: null },
  { label: '2022', education: rmit, experience: null },
  { label: '2021', education: null, experience: nabAnalyst },
  { label: '2020', education: null, experience: null },
  { label: '2019', education: null, experience: boost },
  { label: '2018', education: null, experience: null },
  { label: '2017', education: null, experience: admetrics },
  { label: '2016', education: null, experience: null },
  { label: '2015', education: null, experience: witrafi },
  { label: '2014', education: null, experience: null },
  { label: '2013', education: lab, experience: null },
];
