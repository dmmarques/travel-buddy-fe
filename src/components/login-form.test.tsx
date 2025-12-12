import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';
import { signIn } from '../../server/users';
import { authClient } from '../../lib/auth-client';

vi.mock('../../server/users', () => ({
  signIn: vi.fn(),
}));

vi.mock('../../lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('should render login form with all elements', () => {
    render(<LoginForm />);

    expect(screen.getByText('Welcome to TravelBuddy')).toBeInTheDocument();
    expect(screen.getByText('Login with your Google account')).toBeInTheDocument();
    expect(screen.getByText('Login with Google')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('johndoe@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('*****')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();
  });

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('johndoe@example.com');
    const submitButton = screen.getByRole('button', { name: /^Login$/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('johndoe@example.com');
    const passwordInput = screen.getByPlaceholderText('*****');
    const submitButton = screen.getByRole('button', { name: /^Login$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '12345');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
    });
  });

  it('should call signIn with correct credentials on valid form submission', async () => {
    const user = userEvent.setup();
    vi.mocked(signIn).mockResolvedValue({ success: true, message: 'Success' });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('johndoe@example.com');
    const passwordInput = screen.getByPlaceholderText('*****');
    const submitButton = screen.getByRole('button', { name: /^Login$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show loading state during form submission', async () => {
    const user = userEvent.setup();
    vi.mocked(signIn).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, message: '' }), 100))
    );

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('johndoe@example.com');
    const passwordInput = screen.getByPlaceholderText('*****');
    const submitButton = screen.getByRole('button', { name: /^Login$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it('should handle failed login attempt', async () => {
    const user = userEvent.setup();
    vi.mocked(signIn).mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('johndoe@example.com');
    const passwordInput = screen.getByPlaceholderText('*****');
    const submitButton = screen.getByRole('button', { name: /^Login$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
    });
  });

  it('should call Google sign-in when Google button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const googleButton = screen.getByText('Login with Google');
    await user.click(googleButton);

    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: 'http://localhost:3000/home',
    });
  });

  it('should have link to signup page', () => {
    render(<LoginForm />);

    const signupLink = screen.getByRole('link', { name: /Sign up/i });
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('should accept custom className', () => {
    const { container } = render(<LoginForm className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass('custom-class');
  });
});
