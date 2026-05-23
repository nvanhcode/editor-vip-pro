import { ActiveTool, Editor } from "@/components/svg-editor/types";
import { ToolSidebarClose } from "@/components/svg-editor/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/svg-editor/tool-sidebar-header";

import { cn } from "@/components/svg-editor/lib/utils";

interface ShapeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const ShapeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShapeSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const shapesList = [
    { label: "Rectangle", action: () => editor?.addRectangle(), icon: (
      <div className="size-8 border-2 border-slate-700 rounded-[2px]" />
    )},
    { label: "Rounded Rect", action: () => editor?.addSoftRectangle(), icon: (
      <div className="size-8 border-2 border-slate-700 rounded-lg" />
    )},
    { label: "Circle", action: () => editor?.addCircle(), icon: (
      <div className="size-8 border-2 border-slate-700 rounded-full" />
    )},
    { label: "Triangle", action: () => editor?.addTriangle(), icon: (
      <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[32px] border-b-slate-700" />
    )},
    { label: "Inverse Triangle", action: () => editor?.addInverseTriangle(), icon: (
      <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-slate-700" />
    )},
    { label: "Diamond", action: () => editor?.addDiamond(), icon: (
      <div className="size-6 border-2 border-slate-700 rotate-45 transform" />
    )},
  ];

  return (
    <aside
      className={cn(
        "bg-white relative border-r border-slate-100/80 z-[40] w-[360px] h-full flex flex-col shadow-[10px_0_30px_-15px_rgba(0,0,0,0.03)] transition-all duration-200",
        activeTool === "shapes" ? "visible block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Shapes"
        description="Click a shape to insert into your design workspace"
      />
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
        {shapesList.map((shape) => (
          <button
            key={shape.label}
            onClick={() => {
              shape.action();
              onClose();
            }}
            className="flex flex-col items-center justify-center p-4 border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl cursor-pointer transition gap-y-3 h-24 shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center justify-center h-10">
              {shape.icon}
            </div>
            <span className="text-[11px] font-semibold text-slate-700">{shape.label}</span>
          </button>
        ))}
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
