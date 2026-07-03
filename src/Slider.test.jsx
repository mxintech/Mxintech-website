import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Slider from './Slider';

describe('Slider', () => {
  it('renders the first slide caption and one dot per slide', () => {
    render(<Slider />);
    expect(screen.getByText(/Kubernetes Community Day 2026/)).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });

  it('navigates with the arrows, wrapping around', async () => {
    const user = userEvent.setup();
    render(<Slider />);

    await user.click(screen.getByRole('button', { name: /slide siguiente/i }));
    expect(screen.getByText(/Oficialmente Somos un AWS User Group/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /slide anterior/i }));
    await user.click(screen.getByRole('button', { name: /slide anterior/i }));
    expect(
      screen.getByText(/Webinar: Aprendimos sobre GitOps, ArgoCD, Rollouts y más/)
    ).toBeInTheDocument();
  });
});
