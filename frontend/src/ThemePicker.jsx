import { Moon, Palette, Sun } from 'lucide-react'

const themes = [
  ['light', 'Meadow'],
  ['ocean', 'Ocean'],
  ['lavender', 'Lavender'],
  ['sunset', 'Sunset'],
  ['dark', 'Midnight'],
]

export default function ThemePicker({ theme, onChange, appearance = 'light', onChangeAppearance = () => {}, className = '' }) {
  return <div className={`theme-picker ${className}`} title="Choose a color palette and display mode">
    <Palette size={16}/>
    <label className="sr-only" htmlFor="theme-palette">Color palette</label>
    <select id="theme-palette" aria-label="Color palette" value={theme} onChange={(event) => onChange(event.target.value)}>
      {themes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
    <span className="theme-mode-toggle" role="group" aria-label="Display mode">
      <button type="button" className={appearance === 'light' ? 'active' : ''} aria-label="Use light mode" aria-pressed={appearance === 'light'} onClick={() => onChangeAppearance('light')}><Sun size={14}/><span>Light</span></button>
      <button type="button" className={appearance === 'dark' ? 'active' : ''} aria-label="Use dark mode" aria-pressed={appearance === 'dark'} onClick={() => onChangeAppearance('dark')}><Moon size={14}/><span>Dark</span></button>
    </span>
  </div>
}
