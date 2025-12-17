import './Input.css'

export default function Input({ 
  label, 
  placeholder, 
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  ...props 
}) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-group__label">
          {label}
          {required && <span className="input-group__required">*</span>}
        </label>
      )}
      <input 
        className={`input ${error ? 'input--error' : ''}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {error && <span className="input-group__error">{error}</span>}
    </div>
  )
}
