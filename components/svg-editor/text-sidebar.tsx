import { ActiveTool, Editor } from "@/components/svg-editor/types";
import { ToolSidebarClose } from "@/components/svg-editor/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/svg-editor/tool-sidebar-header";

import { cn } from "@/components/svg-editor/lib/utils";
import { Button } from "@/components/svg-editor/ui/button";

interface TextSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const TextSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleAddText = (value: string, size: number, weight: number) => {
    editor?.addText(value, { fontSize: size, fontWeight: weight });
    onClose();
  };

  const textStyles = [
    { label: "Heading 1", size: 48, weight: 700, previewClass: "text-xl font-extrabold text-slate-800" },
    { label: "Heading 2", size: 36, weight: 700, previewClass: "text-lg font-bold text-slate-800" },
    { label: "Heading 3", size: 28, weight: 700, previewClass: "text-base font-bold text-slate-800" },
    { label: "Heading 4", size: 24, weight: 600, previewClass: "text-sm font-semibold text-slate-800" },
    { label: "Heading 5", size: 18, weight: 600, previewClass: "text-xs font-semibold text-slate-800" },
    { label: "Heading 6", size: 14, weight: 600, previewClass: "text-[11px] font-semibold text-slate-800" },
    { label: "Paragraph", size: 16, weight: 400, previewClass: "text-xs font-normal text-slate-500" },
  ];

  return (
    <aside
      className={cn(
        "bg-white relative border-r border-slate-100/80 z-[40] w-[360px] h-full flex flex-col shadow-[10px_0_30px_-15px_rgba(0,0,0,0.03)] transition-all duration-200",
        activeTool === "text" ? "visible block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Texts & Headings"
        description="Click a heading or paragraph style to add to canvas"
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {textStyles.map((style) => (
          <Button
            key={style.label}
            onClick={() => handleAddText(style.label, style.size, style.weight)}
            variant="secondary"
            className="w-full h-12 justify-start bg-slate-50/50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 text-slate-800 rounded-lg px-4 font-sans text-left transition cursor-pointer"
          >
            <span className={style.previewClass}>{style.label}</span>
          </Button>
        ))}
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
