import { Palette } from 'lucide-react'

const themes = [
  ['light', 'Meadow'],
  ['ocean', 'Ocean'],
  ['lavender', 'Lavender'],
  ['sunset', 'Sunset'],
  ['dark', 'Midnight'],
]

export default function ThemePicker({ theme, onChange, className = '' }) {
  return <label className={`theme-picker ${className}`} title="Choose a color palette">
    <Palette size={16}/>
    <span className="sr-only">Color palette</span>
    <select aria-label="Color palette" value={theme} onChange={(event) => onChange(event.target.value)}>
      {themes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
  </label>
}
