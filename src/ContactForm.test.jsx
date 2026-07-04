import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ContactForm from './ContactForm';
import { CONTACT_FORMS } from './config/contactForms';

const jsonResponse = (body, ok = true) => ({
  ok,
  headers: { get: () => 'application/json' },
  json: async () => body,
});

const renderForm = (contactType) => {
  const config = CONTACT_FORMS[contactType];
  return render(
    <MemoryRouter>
      <ContactForm
        contactType={contactType}
        formConfig={config.form}
        wizardConfig={config.wizard}
        requirements={config.requirements}
      />
    </MemoryRouter>
  );
};

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue(jsonResponse({ expiresInMinutes: 15 }));
});

describe('ContactForm wizard', () => {
  it('walks a member through chips → message → contact → OTP → success', async () => {
    const user = userEvent.setup();
    renderForm('member');

    /* Step 1: interest chips */
    expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument();
    expect(screen.getByText(CONTACT_FORMS.member.wizard.choice.title)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Cloud & AWS/ }));
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    /* Step 2: message */
    expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();
    await user.type(
      screen.getByPlaceholderText(CONTACT_FORMS.member.form.messagePlaceholder),
      'Quiero aprender con la comunidad.'
    );
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    /* Step 3: contact info */
    expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana López');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
    await user.click(
      screen.getByRole('button', { name: CONTACT_FORMS.member.form.submitLabel })
    );

    /* OTP request: chips flow into the message payload */
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = global.fetch.mock.calls[0];
    expect(requestUrl).toContain('/contact/request');
    const payload = JSON.parse(requestInit.body);
    expect(payload.contactType).toBe('member');
    expect(payload.email).toBe('ana@example.com');
    expect(payload.message).toContain('Intereses: Cloud & AWS');
    expect(payload.message).toContain('Quiero aprender con la comunidad.');

    /* OTP step */
    expect(await screen.findByText(/confirma tu correo/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/código de verificación/i), '123456');
    await user.click(screen.getByRole('button', { name: /confirmar y enviar/i }));

    const [verifyUrl, verifyInit] = global.fetch.mock.calls[1];
    expect(verifyUrl).toContain('/contact/verify');
    expect(JSON.parse(verifyInit.body).token).toBe('123456');

    /* Success panel */
    expect(await screen.findByText(/¡Listo, Ana!/)).toBeInTheDocument();
    expect(screen.getByText(/únete al grupo en meetup/i)).toBeInTheDocument();
  });

  it('starts the speaker flow with the talk title and requires it', async () => {
    const user = userEvent.setup();
    renderForm('speaker');

    expect(screen.getByText(CONTACT_FORMS.speaker.wizard.talkTitle.title)).toBeInTheDocument();

    /* Cannot advance without a title */
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/título/i);

    await user.type(
      screen.getByPlaceholderText(CONTACT_FORMS.speaker.form.talkTitlePlaceholder),
      'Introducción a EKS'
    );
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();
  });

  it('blocks empty required steps and supports going back', async () => {
    const user = userEvent.setup();
    renderForm('leader');

    /* Leader chips are required */
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/al menos un área/i);

    await user.click(screen.getByRole('button', { name: /organizar eventos/i }));
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    expect(screen.getByText('Paso 2 de 4')).toBeInTheDocument();

    /* Back returns to the chips with the selection kept */
    await user.click(screen.getByRole('button', { name: /atrás/i }));
    expect(screen.getByRole('button', { name: /organizar eventos/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('requires leaders to confirm every requirement before contact', async () => {
    const user = userEvent.setup();
    renderForm('leader');

    await user.click(screen.getByRole('button', { name: /organizar eventos/i }));
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    await user.type(
      screen.getByPlaceholderText(CONTACT_FORMS.leader.form.messagePlaceholder),
      'Quiero organizar meetups.'
    );
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    /* Requirements step: all checkboxes must be confirmed */
    expect(screen.getByText('Paso 3 de 4')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(CONTACT_FORMS.leader.requirements.items.length);

    await user.click(screen.getByRole('button', { name: /continuar/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/confirma todos los requisitos/i);

    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    expect(screen.getByText('Paso 4 de 4')).toBeInTheDocument();

    /* Full submit records the confirmation in the message payload */
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana López');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
    await user.click(
      screen.getByRole('button', { name: CONTACT_FORMS.leader.form.submitLabel })
    );
    const payload = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(payload.message).toContain('Requisitos del rol confirmados');
  });

  it('shows API errors without leaving the contact step', async () => {
    const user = userEvent.setup();
    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'Demasiadas solicitudes' }, false));
    renderForm('business');

    await user.click(screen.getByRole('button', { name: /patrocinio de eventos/i }));
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    await user.type(
      screen.getByPlaceholderText(CONTACT_FORMS.business.form.messagePlaceholder),
      'Queremos patrocinar.'
    );
    await user.click(screen.getByRole('button', { name: /continuar/i }));
    await user.type(screen.getByLabelText(/nombre completo/i), 'Empresa SA');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'contacto@empresa.com');
    await user.click(
      screen.getByRole('button', { name: CONTACT_FORMS.business.form.submitLabel })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiadas solicitudes');
    /* Still on the contact step, not the OTP step */
    expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument();
  });
});
