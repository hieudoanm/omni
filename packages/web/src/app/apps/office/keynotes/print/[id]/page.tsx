import PrintPage from '@/app/apps/office/keynotes/print/[id]/PrintPage';

export function generateStaticParams() {
  return [{ id: 'new' }];
}

export default function Page() {
  return <PrintPage />;
}
