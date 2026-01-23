import { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    error?: string;
    name?: string;
    autoComplete?: string;
    required?: boolean;
    ariaLabel?: string;
}

export function PasswordInput({
    value,
    onChange,
    placeholder = 'Password',
    label,
    disabled = false,
    error,
    name = 'password',
    autoComplete = 'current-password',
    required = true,
    ariaLabel = 'Password',
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        // Maintain focus after toggle
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-grey-400 text-sm mb-2 font-medium">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={inputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    name={name}
                    autoComplete={autoComplete}
                    required={required}
                    disabled={disabled}
                    aria-label={ariaLabel}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : undefined}
                    className={clsx(
                        'w-full bg-charcoal-900 border text-white rounded-lg px-4 py-3 pr-12',
                        'focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50',
                        'placeholder-grey-600 transition-colors',
                        'disabled:bg-charcoal-800 disabled:text-grey-500 disabled:cursor-not-allowed',
                        error
                            ? 'border-red-500'
                            : 'border-charcoal-700'
                    )}
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={disabled}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    className={clsx(
                        'absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg',
                        'transition-colors',
                        disabled
                            ? 'opacity-50 cursor-not-allowed text-grey-500'
                            : 'text-grey-500 hover:text-white hover:bg-charcoal-800'
                    )}
                >
                    {showPassword ? (
                        <Eye className="w-5 h-5" />
                    ) : (
                        <EyeOff className="w-5 h-5" />
                    )}
                </button>
            </div>
            {error && (
                <div
                    id={`${name}-error`}
                    role="alert"
                    className="block text-red-400 text-xs mt-1"
                >
                    {error}
                </div>
            )}
        </div>
    );
}
