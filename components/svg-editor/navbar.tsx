"use client";

import { CiFileOn } from "react-icons/ci";
import { useFilePicker } from "use-file-picker";
import { 
  ChevronDown, 
  Download, 
  MousePointerClick, 
  Redo2, 
  Undo2,
  FolderOpen
} from "lucide-react";

import { ActiveTool, Editor } from "@/components/svg-editor/types";
import { cn } from "@/components/svg-editor/lib/utils";
import { Hint } from "@/components/svg-editor/hint";
import { Button } from "@/components/svg-editor/ui/button";
import { Separator } from "@/components/svg-editor/ui/separator";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/svg-editor/ui/dropdown-menu";

interface NavbarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  onSvgDropped?: (svgString: string) => void;
};

export const Navbar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  onSvgDropped,
}: NavbarProps) => {
  const { openFilePicker } = useFilePicker({
    accept: ".json",
    onFilesSuccessfullySelected: ({ plainFiles }: any) => {
      if (plainFiles && plainFiles.length > 0) {
        const file = plainFiles[0];
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = () => {
          editor?.loadJson(reader.result as string);
        };
      }
    },
  });

  const { openFilePicker: openSvgPicker } = useFilePicker({
    accept: ".svg",
    onFilesSuccessfullySelected: ({ plainFiles }: any) => {
      if (plainFiles && plainFiles.length > 0) {
        const file = plainFiles[0];
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = () => {
          if (reader.result && onSvgDropped) {
            onSvgDropped(reader.result as string);
          }
        };
      }
    },
  });

  return (
    <nav className="w-full flex items-center px-6 h-[68px] gap-x-8 border-b bg-white select-none">
      <div className="flex items-center gap-x-2">
        <div className="flex items-center justify-center rounded-md bg-blue-500 p-1.5 text-white">
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <span className="font-bold text-slate-800 text-base">SVG Editor V2</span>
      </div>

      <div className="flex-1 flex items-center gap-x-1 h-full">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-9 px-3 gap-x-1">
              File
              <ChevronDown className="size-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => openFilePicker()}
              className="flex items-center gap-x-3 cursor-pointer"
            >
              <CiFileOn className="size-6 text-slate-500" />
              <div>
                <p className="font-medium text-sm">Open JSON</p>
                <p className="text-xs text-slate-500">
                  Open a previously exported JSON file
                </p>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => openSvgPicker()}
              className="flex items-center gap-x-3 cursor-pointer"
            >
              <FolderOpen className="size-6 text-slate-500" />
              <div>
                <p className="font-medium text-sm">Open SVG</p>
                <p className="text-xs text-slate-500">
                  Open and edit an SVG vector file
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Hint label="Select cursor tool" side="bottom" sideOffset={10}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeActiveTool("select")}
            className={cn("h-9 w-9", activeTool === "select" && "bg-slate-100")}
          >
            <MousePointerClick className="size-4" />
          </Button>
        </Hint>

        <Hint label="Undo" side="bottom" sideOffset={10}>
          <Button
            disabled={!editor?.canUndo()}
            variant="ghost"
            size="icon"
            onClick={() => editor?.onUndo()}
            className="h-9 w-9"
          >
            <Undo2 className="size-4" />
          </Button>
        </Hint>

        <Hint label="Redo" side="bottom" sideOffset={10}>
          <Button
            disabled={!editor?.canRedo()}
            variant="ghost"
            size="icon"
            onClick={() => editor?.onRedo()}
            className="h-9 w-9"
          >
            <Redo2 className="size-4" />
          </Button>
        </Hint>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <div className="ml-auto flex items-center gap-x-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-9 px-4 gap-x-2 border-slate-200 text-slate-800 hover:bg-slate-50 font-medium">
                Export
                <Download className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="flex items-center gap-x-3 cursor-pointer"
                onClick={() => editor?.saveJson()}
              >
                <CiFileOn className="size-6 text-slate-500" />
                <div>
                  <p className="font-medium text-sm">JSON</p>
                  <p className="text-xs text-slate-500">
                    Save raw state for later editing
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-3 cursor-pointer"
                onClick={() => editor?.savePng()}
              >
                <CiFileOn className="size-6 text-slate-500" />
                <div>
                  <p className="font-medium text-sm">PNG</p>
                  <p className="text-xs text-slate-500">
                    Best for sharing on the web
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-3 cursor-pointer"
                onClick={() => editor?.saveJpg()}
              >
                <CiFileOn className="size-6 text-slate-500" />
                <div>
                  <p className="font-medium text-sm">JPG</p>
                  <p className="text-xs text-slate-500">
                    Best for printing
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-3 cursor-pointer"
                onClick={() => editor?.saveSvg()}
              >
                <CiFileOn className="size-6 text-slate-500" />
                <div>
                  <p className="font-medium text-sm">SVG</p>
                  <p className="text-xs text-slate-500">
                    Best for editing in vector software
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
