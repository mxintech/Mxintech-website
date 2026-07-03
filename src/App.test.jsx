import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

describe('App', () => {
  it('renders the home page with nav, hero, and footer', () => {
    renderAt('/');
    expect(
      screen.getByText('Mexico in Tech | AWS User Group Tlaxcala')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: /mexico in tech/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/DE DEVS PARA DEVS/)).toBeInTheDocument();
    expect(screen.getByText(/todos los derechos reservados/i)).toBeInTheDocument();
  });

  it('renders the universidades section with benefits and CTAs', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: 'Universidades' })).toBeInTheDocument();
    expect(screen.getByText(/en tlaxcala ese ecosistema apenas está naciendo/i)).toBeInTheDocument();
    expect(screen.getByText('Forma líderes')).toBeInTheDocument();
    expect(screen.getByText('Skills que pide la industria')).toBeInTheDocument();
    expect(screen.getByText('Confianza al egresar')).toBeInTheDocument();
    expect(screen.getByText('Apoyo para docentes')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /estudiantes universitarios/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /propón una colaboración/i })).toHaveAttribute(
      'href',
      '/contact/business'
    );
  });

  it('renders the contact wizard on persona routes', () => {
    renderAt('/contact/speaker');
    expect(screen.getByText(/comparte como speaker/i)).toBeInTheDocument();
    expect(screen.getByText(/¿De qué te gustaría hablar\?/)).toBeInTheDocument();
  });

  it('shows the 404 page for unknown routes', () => {
    renderAt('/esta-ruta-no-existe');
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/página no encontrada/i)).toBeInTheDocument();
  });
});
