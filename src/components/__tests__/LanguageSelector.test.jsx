// src/components/__tests__/LanguageSelector.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import LanguageSelector from '../ui/LanguageSelector';

// Mock do i18n
const mockI18n = {
  language: 'pt',
  changeLanguage: vi.fn(),
  t: (key) => key,
};

// Configuração básica do i18n para testes
i18n.init({
  lng: 'pt',
  resources: {
    pt: { translation: {} },
    en: { translation: {} },
    es: { translation: {} },
  },
});

const renderWithI18n = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('LanguageSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders language selector correctly', () => {
    renderWithI18n(<LanguageSelector />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label');
  });

  it('displays current language flag', () => {
    renderWithI18n(<LanguageSelector showFlags={true} />);

    // Deve mostrar a bandeira brasileira (🇧🇷) por padrão
    expect(screen.getByText('🇧🇷')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    renderWithI18n(<LanguageSelector variant="dropdown" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Deve abrir o dropdown
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('changes language when option is selected', async () => {
    renderWithI18n(<LanguageSelector variant="dropdown" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Clicar na opção de inglês
    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);

    expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en');
  });

  it('renders minimal variant correctly', () => {
    renderWithI18n(<LanguageSelector variant="minimal" />);

    // Deve mostrar apenas bandeiras
    expect(screen.getByText('🇧🇷')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('🇪🇸')).toBeInTheDocument();
  });

  it('handles language change errors gracefully', async () => {
    mockI18n.changeLanguage.mockRejectedValueOnce(new Error('Network error'));

    renderWithI18n(<LanguageSelector variant="dropdown" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const englishOption = screen.getByText('English');
    fireEvent.click(englishOption);

    // Deve chamar changeLanguage mesmo com erro
    expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en');
  });
});
