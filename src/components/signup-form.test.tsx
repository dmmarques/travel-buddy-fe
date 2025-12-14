import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from './signup-form';
import { toast } from 'sonner';

// Mock the server action
vi.mock('../../server/users', () => ({
  signUp: vi.fn(),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => {
  const mockToastFn = vi.fn();
  mockToastFn.success = vi.fn();
  return {
    toast: mockToastFn,
  };
});

import { signUp } from '../../server/users';
import { toast } from 'sonner';

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the signup form with all fields', () => {
    render(<SignupForm />);

    expect(screen.getByText('Welcome to Travel Buddy')).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should have Terms of Service and Privacy Policy links', () => {
    render(<SignupForm />);

    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
  });

  it('should have a link to login page', () => {
    render(<SignupForm />);

    const loginLink = screen.getByRole('link', { name: /log in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should show validation error for short username', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'ab');

    // Click submit to trigger validation
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Username must be at least 3 characters')
      ).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    // Click submit to trigger validation
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, '12345');

    // Click submit to trigger validation
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
    });
  });

  it('should accept valid username (3+ characters)', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'johndoe');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.queryByText('Username must be at least 3 characters')
      ).not.toBeInTheDocument();
    });
  });

  it('should accept valid email format', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'john@example.com');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.queryByText('Invalid email address')
      ).not.toBeInTheDocument();
    });
  });

  it('should accept valid password (6+ characters)', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'password123');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.queryByText('Password must be at least 6 characters')
      ).not.toBeInTheDocument();
    });
  });

  it('should call signUp with correct values on form submit', async () => {
    const user = userEvent.setup();
    vi.mocked(signUp).mockResolvedValue({ success: true, message: '' });

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        'johndoe',
        'john@example.com',
        'password123'
      );
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    vi.mocked(signUp).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, message: '' }), 100))
    );

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();

    // Should show loading icon
    await waitFor(() => {
      expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    });

    // Wait for completion
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should show success toast and redirect on successful signup', async () => {
    const user = userEvent.setup();
    vi.mocked(signUp).mockResolvedValue({ success: true, message: '' });

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Signed up successfully! You can now log in.'
      );
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should show error toast on failed signup', async () => {
    const user = userEvent.setup();
    vi.mocked(signUp).mockResolvedValue({
      success: false,
      message: 'Email already exists',
    });

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith('Signup failed: \n Email already exists');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('should prevent submission with invalid data', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    // Should show validation errors and not call signUp
    await waitFor(() => {
      expect(
        screen.getByText('Username must be at least 3 characters')
      ).toBeInTheDocument();
    });
    expect(signUp).not.toHaveBeenCalled();
  });

  it('should handle custom className prop', () => {
    const { container } = render(<SignupForm className="custom-class" />);

    const formContainer = container.firstChild as HTMLElement;
    expect(formContainer).toHaveClass('custom-class');
    expect(formContainer).toHaveClass('flex');
    expect(formContainer).toHaveClass('flex-col');
  });

  it('should mask password input', () => {
    render(<SignupForm />);

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should have proper placeholder texts', () => {
    render(<SignupForm />);

    expect(screen.getByPlaceholderText('johndoe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('johndoe@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('*****')).toBeInTheDocument();
  });

  it('should have proper form descriptions', () => {
    render(<SignupForm />);

    expect(screen.getByText('This is your username.')).toBeInTheDocument();
    expect(screen.getByText('This is your email.')).toBeInTheDocument();
    expect(screen.getByText('Insert your password here.')).toBeInTheDocument();
  });

  it('should handle special characters in inputs', async () => {
    const user = userEvent.setup();
    vi.mocked(signUp).mockResolvedValue({ success: true, message: '' });

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/username/i), 'user_name-123');
    await user.type(screen.getByLabelText(/email/i), 'user+test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'P@ssw0rd!');

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        'user_name-123',
        'user+test@example.com',
        'P@ssw0rd!'
      );
    });
  });
});
