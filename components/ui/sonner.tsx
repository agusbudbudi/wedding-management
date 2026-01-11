"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg rounded-xl font-sans",
          description: "group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white font-medium",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500 font-medium",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
