import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Cloud, LogIn, UserPlus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, buttonStyles } from '../components/Button';
import { PageIntro } from '../components/PageIntro';
import { useAuth } from '../context/AuthContext';
import { cx } from '../lib/cx';
import { useTranslation } from 'react-i18next';
export function LoginPage() {
    const { t } = useTranslation('pages');
    const { configured, loading: authLoading, signIn, signUp, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = location.state?.returnTo ?? '/track';
    const [mode, setMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    useEffect(() => {
        if (user)
            navigate(returnTo, { replace: true });
    }, [navigate, returnTo, user]);
    async function submit(event) {
        event.preventDefault();
        setError('');
        setNotice('');
        if (password.length < 6) {
            setError(t('auth.passwordLength'));
            return;
        }
        setSubmitting(true);
        try {
            if (mode === 'signin') {
                await signIn(email.trim(), password);
                navigate(returnTo, { replace: true });
            }
            else {
                const result = await signUp(email.trim(), password);
                if (result.confirmationRequired) {
                    setNotice(t('auth.checkEmail'));
                }
                else {
                    navigate(returnTo, { replace: true });
                }
            }
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : t('auth.genericError'));
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs(_Fragment, { children: [_jsx(PageIntro, { title: t('auth.title') }), _jsx("section", { className: "page-shell pb-14", children: _jsxs("div", { className: "mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1fr_22rem]", children: [_jsxs("div", { className: "card p-5 sm:p-7", children: [_jsx("div", { className: "flex rounded-xl bg-mist p-1", children: ['signin', 'signup'].map((item) => (_jsx("button", { type: "button", onClick: () => {
                                            setMode(item);
                                            setError('');
                                            setNotice('');
                                        }, className: cx('h-10 flex-1 rounded-lg text-sm font-semibold transition', mode === item ? 'bg-card text-paper shadow-soft' : 'text-muted hover:text-paper'), children: item === 'signin' ? t('auth.signIn') : t('auth.createAccount') }, item))) }), _jsxs("form", { className: "mt-6 space-y-4", onSubmit: submit, children: [_jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "login-email", children: t('auth.email') }), _jsx("input", { id: "login-email", type: "email", autoComplete: "email", required: true, value: email, onChange: (event) => setEmail(event.target.value), className: cx('text-field', error && 'field-invalid'), placeholder: "you@example.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "field-label", htmlFor: "login-password", children: t('auth.password') }), _jsx("input", { id: "login-password", type: "password", autoComplete: mode === 'signin' ? 'current-password' : 'new-password', required: true, minLength: 6, value: password, onChange: (event) => setPassword(event.target.value), className: cx('text-field', error && 'field-invalid'), placeholder: t('auth.passwordPlaceholder') })] }), error ? _jsx("p", { className: "text-sm font-semibold text-alert", children: error }) : null, notice ? _jsx("p", { className: "rounded-xl border border-brand/25 bg-brand/[0.06] p-3 text-sm text-paper", children: notice }) : null, !configured ? (_jsx("p", { className: "rounded-xl border border-alert/25 bg-alert/[0.05] p-3 text-sm leading-6 text-alert", children: t('auth.notConfigured') })) : null, _jsxs(Button, { type: "submit", size: "lg", className: "w-full", loading: submitting || authLoading, disabled: !configured, children: [mode === 'signin' ? _jsx(LogIn, { className: "h-4 w-4" }) : _jsx(UserPlus, { className: "h-4 w-4" }), mode === 'signin' ? t('auth.signIn') : t('auth.createAccount')] })] })] }), _jsxs("aside", { className: "surface-soft p-5 sm:p-6", children: [_jsx(Cloud, { className: "h-6 w-6 text-brand" }), _jsx("h2", { className: "mt-4 text-lg font-semibold text-paper", children: t('auth.whyTitle') }), _jsx("p", { className: "mt-2 text-sm leading-6 text-muted", children: t('auth.whyBody') }), _jsxs("ul", { className: "mt-4 space-y-2 text-sm leading-6 text-paper", children: [_jsx("li", { children: t('auth.benefitReports') }), _jsx("li", { children: t('auth.benefitPrivate') }), _jsx("li", { children: t('auth.benefitGuest') })] }), _jsx(Link, { to: "/", className: cx(buttonStyles('secondary', 'md'), 'mt-6 w-full'), children: t('auth.continueGuest') })] })] }) })] }));
}
