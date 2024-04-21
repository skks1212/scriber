import { twMerge } from "tailwind-merge";

export type InputProps = {
    label?: React.ReactNode,
    errors?: string[],
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: InputProps) {

    const {
        label,
        errors,
        className,
        required,
        ...rest
    } = props;

    return (
        <div className="inline-flex flex-col text-left gap-2">
            {label && <label className="text-gray-500 text-sm">{label} {required && <sup className="text-red-500">*</sup>}</label>}
            <input
                {...rest}
                required={required}
                className={twMerge(`bg-gray-900 border-2 border-gray-800 rounded px-4 py-2 focus:outline-none ring-0 ring-offset-0 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ring-offset-black ring-transparent transition-all w-full outline-none`, className)}
            />
            {errors && (
                <div className="text-xs">
                    {errors.map((error, index) => (
                        <p
                            key={index}
                            className="text-red-500"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            )}
        </div>
    )
}