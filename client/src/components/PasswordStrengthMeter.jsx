import React, { useMemo } from 'react';

export default function PasswordStrengthMeter({ password }) {
    const strength = useMemo(() => {
        if (!password) return { score: 0, label: '', color: '' };

        let score = 0;


        score += Math.min(password.length * 2, 30);


        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;


        const uniqueChars = new Set(password).size;
        score += Math.min(uniqueChars * 2, 30);

        const finalScore = Math.min(score, 100);

        let label, color;
        if (finalScore < 30) {
            label = 'Weak';
            color = '#ef4444';
        } else if (finalScore < 60) {
            label = 'Fair';
            color = '#f59e0b';
        } else if (finalScore < 80) {
            label = 'Good';
            color = '#10b981';
        } else {
            label = 'Strong';
            color = '#059669';
        }

        return { score: finalScore, label, color };
    }, [password]);

    if (!password) return null;

    return (
        <div style={{ marginTop: '0.5rem' }}>
            <div style={{
                height: '6px',
                background: '#e5e7eb',
                borderRadius: '3px',
                overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%',
                    width: `${strength.score}%`,
                    background: strength.color,
                    transition: 'all 0.3s ease',
                }} />
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.25rem',
                fontSize: '0.875rem',
            }}>
                <span style={{ color: strength.color, fontWeight: 500 }}>
                    {strength.label}
                </span>
                <span style={{ color: '#6b7280' }}>
                    {strength.score}%
                </span>
            </div>
        </div>
    );
}
