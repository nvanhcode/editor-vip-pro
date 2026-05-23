import { useState } from "react";

import { 
  ActiveTool, 
  Editor,
  fonts, 
} from "@/components/svg-editor/types";
import { ToolSidebarClose } from "@/components/svg-editor/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/svg-editor/tool-sidebar-header";

import { cn } from "@/components/svg-editor/lib/utils";
import { Button } from "@/components/svg-editor/ui/button";

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const FontSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) => {
  const [search, setSearch] = useState("");
  const value = editor?.getActiveFontFamily();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const filteredFonts = fonts.filter((font) =>
    font.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className={cn(
        "bg-white relative border-r border-slate-100/80 z-[40] w-[360px] h-full flex flex-col shadow-[10px_0_30px_-15px_rgba(0,0,0,0.03)] transition-all duration-200",
        activeTool === "font" ? "visible block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Font"
        description="Change the text font family"
      />
      
      {/* Search Input Box */}
      <div className="p-4 border-b border-slate-100/80 bg-slate-50/20">
        <input
          placeholder="Search fonts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-8 px-3 border border-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-slate-50/50"
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredFonts.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No fonts found</p>
        ) : (
          filteredFonts.map((font) => (
            <Button
              key={font}
              variant="secondary"
              className={cn(
                "w-full h-10 justify-start text-left bg-slate-50/50 border border-slate-100 hover:bg-slate-100 text-slate-800 rounded-lg px-4 transition font-normal",
                value === font && "border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-medium",
              )}
              style={{
                fontFamily: font,
                fontSize: "13px",
              }}
              onClick={() => editor?.changeFontFamily(font)}
            >
              {font}
            </Button>
          ))
        )}
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
