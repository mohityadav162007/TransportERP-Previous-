import React from 'react';

const GlassInput = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    name,
    className,
    label,
    required = false
}) => {
    return (
        <div className={`flex flex-col gap-2 ${className || ''}`}>
            {label && (
                <label className="text-white/70 text-sm font-medium ml-1">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="glass-input"
                required={required}
            />
        </div>
    );
};

export default GlassInput;
