import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/svg-editor/ui/button";

interface FontSizeInputProps {
  value: number;
  onChange: (value: number) => void;
};

export const FontSizeInput = ({
  value,
  onChange,
}: FontSizeInputProps) => {
  const increment = () => onChange(value + 1);
  const decrement = () => onChange(value - 1);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  return (
    <div className="flex items-center">
      <Button
        onClick={decrement}
        variant="outline"
        className="p-2 rounded-r-none border-r-0 h-8 w-8"
        size="icon"
      >
        <Minus className="size-4" />
      </Button>
      <input
        type="text"
        onChange={handleChange}
        value={value}
        className="w-[50px] h-8 text-center border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
      />
      <Button
        onClick={increment}
        variant="outline"
        className="p-2 rounded-l-none border-l-0 h-8 w-8"
        size="icon"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
};
