import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from '../app/page';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="next-link">{children}</a>
  ),
}));

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/A Nova Era da Elegância/i);
  });

  it('renders navigation links', () => {
    render(<LandingPage />);
    const continueButtons = screen.getAllByText('Continuar');
    expect(continueButtons.length).toBeGreaterThan(0);
  });

  it('contains correct links to the auth login route', () => {
    render(<LandingPage />);
    const links = screen.getAllByTestId('next-link');
    // Ensure the link goes to '/auth/login'
    const authLinks = links.filter(link => link.getAttribute('href') === '/auth/login');
    expect(authLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the brand title', () => {
    render(<LandingPage />);
    const brandTitles = screen.getAllByText('E.S.T.I.L.O.');
    expect(brandTitles.length).toBeGreaterThan(0);
  });

});
