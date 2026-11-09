import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewControls } from '@/components/office/md/molecules/ViewControls';

describe('ViewControls', () => {
  it('calls back with the selected view mode', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<ViewControls value='split' onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Preview' }));
    expect(onChange).toHaveBeenCalledWith('preview');
  });
});
