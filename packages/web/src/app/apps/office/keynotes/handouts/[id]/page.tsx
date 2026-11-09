import HandoutsPage from '@/app/apps/office/keynotes/handouts/[id]/HandoutsPage';

export function generateStaticParams() {
  return [{ id: 'new' }];
}

export default function Page() {
  return <HandoutsPage />;
}
