import { ErrorTemplate } from '@/components/templates/shared/ErrorTemplate';

const ForbiddenPage = () => (
  <ErrorTemplate
    error={{ code: 403, message: 'Forbidden' }}
    messages={['You do not have permission to access this page.']}
  />
);

export default ForbiddenPage;
