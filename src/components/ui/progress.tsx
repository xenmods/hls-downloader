import * as ProgressPrimitive from "@radix-ui/react-progress";

export const ProgressBar = ({ value }: { value: number }) => {
  return (
    <>
      <ProgressPrimitive.Root
        className={
          "relative h-4 mt-2 w-[300px] overflow-hidden rounded-full bg-muted"
        }
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      <p className="text-muted-foreground mt-2">{Math.round(value || 0)}%</p>
    </>
  );
};
