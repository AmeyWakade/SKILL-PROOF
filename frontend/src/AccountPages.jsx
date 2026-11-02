import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { api } from './api'
import CareerWorkspace from './CareerWorkspace'
import PublicProfileView from './PublicProfileView'
import ThemePicker from './ThemePicker'

export function AuthPage({ mode, onMode, onBack, onAuthenticated, theme, onChangeTheme, appearance, onChangeAppearance }) {
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const register = mode === 'register'
  const change = (key) => (event) => setForm({ ...form, [key]: event.target.value })
  async function submit(event) {
    event.preventDefault(); setError('')
    if (register && form.password !== form.confirm) return setError('Those passwords do not match.')
    setBusy(true)
    try {
      const user = await api(`/api/v1/auth/${register ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password, ...(register ? { displayName: form.displayName } : {}) }) })
      onAuthenticated(user)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <main className="account-screen"><ThemePicker className="account-theme" theme={theme} onChange={onChangeTheme} appearance={appearance} onChangeAppearance={onChangeAppearance}/><button className="account-back" onClick={onBack}><ArrowLeft size={16}/> Back to explore</button><section className="account-card"><div className="account-brand"><span className="brand-icon"><ShieldCheck size={20}/></span> skillproof</div><div className="account-heading"><span className="section-kicker">YOUR SKILLS, YOUR STORY</span><h1>{register ? 'Create your account' : 'Welcome back'}</h1><p>{register ? 'Start building a profile that makes your skills visible.' : 'Sign in to pick up where you left off.'}</p></div><form className="account-form" onSubmit={submit}>
    {register && <label>Full name<input autoComplete="name" required maxLength="80" value={form.displayName} onChange={change('displayName')} placeholder="e.g. Alex Rivera"/></label>}
    <label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={change('email')} placeholder="you@example.com"/></label>
    <label>Password<div className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} required minLength={8} maxLength={72} value={form.password} onChange={change('password')} placeholder="At least 8 characters"/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Show or hide password">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></label>
    {register && <label>Confirm password<input type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={form.confirm} onChange={change('confirm')} placeholder="Enter your password again"/></label>}
    {error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button auth-submit" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'} <span>→</span></button></form><p className="account-switch">{register ? 'Already have an account?' : 'New to SkillProof?'} <button onClick={() => { setError(''); onMode(register ? 'login' : 'register') }}>{register ? 'Sign in' : 'Create an account'}</button></p><p className="account-note"><ShieldCheck size={14}/> Your password is securely hashed. We never show it on your profile.</p></section></main>
}

export function ProfilePage(props) { return <CareerWorkspace {...props}/> }

export function PublicProfilePage({ id, theme, onChangeTheme, appearance, onChangeAppearance }) {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api(`/api/v1/public-profiles/${id}`).then(setProfile).catch((e) => setError(e.message)) }, [id])
  if (error) return <main className="public-screen"><div className="public-card public-empty"><ShieldCheck size={30}/><h1>Profile unavailable</h1><p>This link may be private or no longer available.</p><a href="/">Visit SkillProof</a></div></main>
  if (!profile) return <main className="public-screen"><div className="public-card" role="status">Loading profile…</div></main>
  return <PublicProfileView profile={profile} theme={theme} onChangeTheme={onChangeTheme} appearance={appearance} onChangeAppearance={onChangeAppearance}/>
}
