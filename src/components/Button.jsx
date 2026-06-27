import React from "react";

function Button(
    {
        children,
        type = "button",
        bgColor = "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400",
        textColor='text-white',
        className='',
        ...props
    }
){
  return (
    <button 
      type={type}
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full ${bgColor} ${textColor} shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
    </button>
  );


}

export default Button