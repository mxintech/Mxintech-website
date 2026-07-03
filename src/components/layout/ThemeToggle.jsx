import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeToggle = ({ theme, onToggle }) => (
  <div className="theme-toggle-wrap">
    <input
      type="checkbox"
      className="theme-checkbox"
      id="theme-checkbox"
      checked={theme === 'dark'}
      onChange={onToggle}
      aria-label="Cambiar tema"
    />
    <label htmlFor="theme-checkbox" className="theme-checkbox-label">
      <FaMoon className="theme-icon theme-icon-moon" aria-hidden />
      <FaSun className="theme-icon theme-icon-sun" aria-hidden />
      <span className="theme-ball" />
    </label>
  </div>
);

export default ThemeToggle;
