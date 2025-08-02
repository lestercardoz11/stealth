import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

jest.mock('@/lib/utils/supabase/server');
jest.mock('next/headers');

describe('Home', () => {
  it('renders a heading', async () => {
    const HomeResolved = await Home();
    render(HomeResolved);

    const heading = screen.getByRole('heading', {
      name: /STEALTH/i,
    });

    expect(heading).toBeInTheDocument();
  });
});
