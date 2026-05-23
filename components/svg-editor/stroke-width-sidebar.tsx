import {
  ActiveTool,
  Editor,
  STROKE_DASH_ARRAY,
  STROKE_WIDTH
} from "@/components/svg-editor/types";
import { ToolSidebarClose } from "@/components/svg-editor/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/svg-editor/tool-sidebar-header";

import { cn } from "@/components/svg-editor/lib/utils";
import { Label } from "@/components/svg-editor/ui/label";
import { Button } from "@/components/svg-editor/ui/button";
import { Slider } from "@/components/svg-editor/ui/slider";
import { ScrollArea } from "@/components/svg-editor/ui/scroll-area";

interface StrokeWidthSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const StrokeWidthSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokeWidthSidebarProps) => {
  const widthValue = editor?.getActiveStrokeWidth() ?? STROKE_WIDTH;
  const typeValue = editor?.getActiveStrokeDashArray() ?? STROKE_DASH_ARRAY;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChangeStrokeWidth = (value: number) => {
    editor?.changeStrokeWidth(value);
  };

  const onChangeStrokeType = (value: number[]) => {
    editor?.changeStrokeDashArray(value);
  }

  return (
    <aside
      className={cn(
        "bg-white relative border-r border-slate-100/80 z-[40] w-[360px] h-full flex flex-col shadow-[10px_0_30px_-15px_rgba(0,0,0,0.03)] transition-all duration-200",
        activeTool === "stroke-width" ? "visible block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Stroke options"
        description="Modify the stroke of your element"
      />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 border-b border-slate-100/80">
          <Label className="text-sm">
            Stroke width
          </Label>
          <Slider
            value={[widthValue]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) => onChangeStrokeWidth(values[0])}
          />
        </div>
        <div className="p-4 space-y-4 border-b border-slate-100/80">
          <Label className="text-sm">
            Stroke type
          </Label>
          <Button
            onClick={() => onChangeStrokeType([])}
            variant="secondary"
            size="lg"
            className={cn(
              "w-full h-16 justify-start text-left",
              JSON.stringify(typeValue) === `[]` && "border border-blue-500 bg-blue-50/50"
            )}
            style={{
              padding: "8px 16px"
            }}
          >
            <div className="w-full border-black rounded-full border-2" />
          </Button>
          <Button
            onClick={() => onChangeStrokeType([5, 5])}
            variant="secondary"
            size="lg"
            className={cn(
              "w-full h-16 justify-start text-left",
              (JSON.stringify(typeValue) === `[5,5]` || JSON.stringify(typeValue) === `[5, 5]`) && "border border-blue-500 bg-blue-50/50"
            )}
            style={{
              padding: "8px 16px"
            }}
          >
            <div className="w-full border-black rounded-full border-2 border-dashed" />
          </Button>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
