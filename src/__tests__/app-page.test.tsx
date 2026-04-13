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
    expect(screen.getByText('Portal da Consultora')).toBeInTheDocument();
    expect(screen.getByText('Área da Cliente')).toBeInTheDocument();
  });

  it('contains correct links to the auth register route', () => {
    render(<LandingPage />);
    const links = screen.getAllByTestId('next-link');
    // Ensure both links go to '/auth/register'
    const authLinks = links.filter(link => link.getAttribute('href') === '/auth/register');
    expect(authLinks).toHaveLength(2);
  });

  it('renders the brand title', () => {
    render(<LandingPage />);
    expect(screen.getByText('E.S.T.I.L.O.')).toBeInTheDocument();
  });

  it('renders trust bar brand names', () => {
    render(<LandingPage />);
    const brands = ['VOGUE', 'ELLE', 'BAZAAR', 'L’OFFICIEL', 'GLAMOUR'];
    brands.forEach((brand) => {
      expect(screen.getByText(brand)).toBeInTheDocument();
    });
  });
});
