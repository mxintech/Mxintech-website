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

  it('renders community metrics in the acercade section', () => {
    renderAt('/');
    expect(screen.getByText(/seguidores en redes/i)).toBeInTheDocument();
    /* Appears in the hero proof badge and in the metric card */
    expect(screen.getAllByText(/webinars grabados/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/eventos en colaboración/i)).toBeInTheDocument();
    expect(screen.getByText('KCD México 2026')).toBeInTheDocument();
    expect(screen.getByText('AWS Community Day 2025')).toBeInTheDocument();
  });

  it('keeps universidades off the home page', () => {
    renderAt('/');
    expect(screen.queryByRole('heading', { name: 'Universidades' })).not.toBeInTheDocument();
    expect(screen.queryByText('Forma líderes')).not.toBeInTheDocument();
  });

  it('renders the universidades page with benefits and CTAs', () => {
    renderAt('/universidades');
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

  it('renders the leader standards page', () => {
    renderAt('/lideres/estandares');
    expect(
      screen.getByRole('heading', { name: /estándares de líderes/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/responsabilidades del rol/i)).toBeInTheDocument();
    expect(screen.getByText(/ser amable/i)).toBeInTheDocument();
    expect(screen.getByText(/atraer a nuevos miembros/i)).toBeInTheDocument();
    expect(screen.getByText(/blogs, tutoriales, videos, charlas/i)).toBeInTheDocument();
    expect(screen.getByText(/respeto e inclusión/i)).toBeInTheDocument();
    expect(screen.getByText(/vigencia del rol/i)).toBeInTheDocument();
    /* Benefits card */
    expect(screen.getByText(/beneficios del rol/i)).toBeInTheDocument();
    expect(screen.getByText(/reconocimiento por tu experiencia/i)).toBeInTheDocument();
    expect(screen.getByText(/certificaciones AWS/i)).toBeInTheDocument();
    expect(screen.getByText(/swag exclusivo/i)).toBeInTheDocument();
    /* Evaluation criteria card */
    expect(screen.getByText(/criterios de evaluación/i)).toBeInTheDocument();
    expect(screen.getByText(/3 contribuciones al mes/i)).toBeInTheDocument();
    expect(screen.getByText(/speaker en público/i)).toBeInTheDocument();
    expect(screen.getByText(/blogs, videos u otros recursos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /aplica para ser líder/i })).toHaveAttribute(
      'href',
      '/contact/leader'
    );
  });

  it('shows the 404 page for unknown routes', () => {
    renderAt('/esta-ruta-no-existe');
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/página no encontrada/i)).toBeInTheDocument();
  });
});
