import PresentPage from '@/app/apps/office/keynotes/present/[id]/PresentPage';

export function generateStaticParams() {
  return [{ id: 'new' }];
}

export default function Page() {
  return <PresentPage />;
}
