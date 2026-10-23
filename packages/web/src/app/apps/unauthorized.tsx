import { ErrorTemplate } from '@/components/templates/shared/ErrorTemplate';

const UnauthorizedPage = () => (
  <ErrorTemplate
    error={{ code: 401, message: 'Unauthorized' }}
    messages={['You must be authenticated to access this page.']}
  />
);

export default UnauthorizedPage;
