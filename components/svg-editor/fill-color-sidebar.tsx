import { ActiveTool, Editor, FILL_COLOR } from "@/components/svg-editor/types";
import { ToolSidebarClose } from "@/components/svg-editor/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/svg-editor/tool-sidebar-header";
import { ColorPicker } from "@/components/svg-editor/color-picker";

import { cn } from "@/components/svg-editor/lib/utils";
import { ScrollArea } from "@/components/svg-editor/ui/scroll-area";

interface FillColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const FillColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FillColorSidebarProps) => {
  const value = editor?.getActiveFillColor() || FILL_COLOR;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChange = (value: string) => {
    editor?.changeFillColor(value);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r border-slate-100/80 z-[40] w-[360px] h-full flex flex-col shadow-[10px_0_30px_-15px_rgba(0,0,0,0.03)] transition-all duration-200",
        activeTool === "fill" ? "visible block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Fill color"
        description="Add fill color to your element"
      />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <ColorPicker
            value={value}
            onChange={onChange}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
