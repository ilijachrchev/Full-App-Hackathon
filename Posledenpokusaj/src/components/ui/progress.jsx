import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={cn(
            "relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-400",
            className
        )}
        aria-valuenow={value} // Accessibility: current value
        aria-valuemin={0} // Accessibility: minimum value
        aria-valuemax={100} // Accessibility: maximum value
        role="progressbar"
        {...props}
    >
        <ProgressPrimitive.Indicator
            className="h-full bg-blue-800 transition-all"
            style={{
                width: `${value}%`, // Dynamically set width based on value
            }}
        />
    </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
