import React,{useId}  from "react";

const Input = React.forwardRef(function Input({
    label,
    type = "text",
    className = "",
    ...props
}, ref) {
    const id = useId();
    return (
        <div className="w-full">
            {label && (
                <label 
                    className="inline-block mb-2 text-sm font-medium text-[var(--text-secondary)]"
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`w-full px-4 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] ${className}`}
                ref={ref}
                {...props}
                id={id}
            />
        </div>
    );
});

export default Input