// File: C:\Mis_Proyectos\Python\NextCRM\frontend\src\app\register\page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

// Define the form data type
interface RegisterFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  phone: string;
  company: string;
  position: string;
  gdpr_consent: boolean;
  marketing_consent: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    phone: '',
    company: '',
    position: '',
    gdpr_consent: true,
    marketing_consent: false,
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const res = await fetch('/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setSuccess(true);
      router.push('/login');
    } else {
      const data = await res.json();
      setError(JSON.stringify(data));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create Account
        </h1>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && (
          <p className="text-green-600 text-center mb-4">
            Account created! Redirecting...
          </p>
        )}

        {(Object.keys(formData) as Array<keyof RegisterFormData>)
          .filter(field => typeof formData[field] === 'string')
          .map((field, idx) => (
            <input
              key={idx}
              type={field.toLowerCase().includes('password') ? 'password' : 'text'}
              name={field}
              placeholder={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              value={formData[field] as string}
              onChange={handleChange}
              className="w-full border px-3 py-2 mb-4 rounded"
              required={['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm'].includes(field)}
            />
        ))}

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="gdpr_consent"
            checked={formData.gdpr_consent}
            onChange={handleChange}
            className="mr-2"
            required
          />
          <label htmlFor="gdpr_consent">I agree to the GDPR terms</label>
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            name="marketing_consent"
            checked={formData.marketing_consent}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="marketing_consent">I agree to receive marketing emails</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
