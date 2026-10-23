import PresenterView from '@/app/apps/office/keynotes/presenter/[id]/PresenterView';

export function generateStaticParams() {
  return [{ id: 'new' }];
}

export default function Page() {
  return <PresenterView />;
}
