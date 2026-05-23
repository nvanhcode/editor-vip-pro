"use client";

import { fabric } from "fabric";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import debounce from "lodash.debounce";
import { UploadCloud } from "lucide-react";

import { ActiveTool, Editor, selectionDependentTools } from "@/components/svg-editor/types";
import { useEditor } from "@/components/svg-editor/hooks/use-editor";
import { Toolbar } from "@/components/svg-editor/toolbar";

import { FillColorSidebar } from "@/components/svg-editor/fill-color-sidebar";
import { StrokeColorSidebar } from "@/components/svg-editor/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/components/svg-editor/stroke-width-sidebar";
import { OpacitySidebar } from "@/components/svg-editor/opacity-sidebar";
import { FontSidebar } from "@/components/svg-editor/font-sidebar";
import { FilterSidebar } from "@/components/svg-editor/filter-sidebar";
import { SettingsSidebar } from "@/components/svg-editor/settings-sidebar";
import { TextSidebar } from "@/components/svg-editor/text-sidebar";
import { ShapeSidebar } from "@/components/svg-editor/shape-sidebar";

export const SvgEditorContainer = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  const [pendingSvg, setPendingSvg] = useState<string | null>(null);
  const [hasParentSvg, setHasParentSvg] = useState(false);
  const hasSentReady = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const editorRef = useRef<Editor | undefined>(undefined);

  const debouncedContentChange = useMemo(() => {
    return debounce((editorInstance: any, height?: number, width?: number) => {
      if (!editorInstance) return;

      const canvasObj = editorInstance.canvas;
      const workspace = editorInstance.getWorkspace();
      if (!workspace) return;

      const wHeight = height || workspace.height || 0;
      const wWidth = width || workspace.width || 0;

      // Preserve transform
      const originalTransform = canvasObj.viewportTransform ? [...canvasObj.viewportTransform] : null;
      canvasObj.setViewportTransform([1, 0, 0, 1, 0, 0]);

      const svgString = canvasObj.toSVG({
        width: wWidth,
        height: wHeight,
        viewBox: {
          x: workspace.left || 0,
          y: workspace.top || 0,
          width: wWidth,
          height: wHeight,
        }
      });

      if (originalTransform) {
        canvasObj.setViewportTransform(originalTransform);
      }

      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: "EDITOR_CONTENT_CHANGED",
          svg: svgString,
          content: svgString,
          width: wWidth,
          height: wHeight
        }, "*");

        window.parent.postMessage({
          type: "HEIGHT_CHANGED",
          height: wHeight,
          width: wWidth
        }, "*");
      }
    }, 200);
  }, []);

  const handleSaveCallback = useCallback(({ height, width }: { height: number; width: number }) => {
    if (editorRef.current) {
      debouncedContentChange(editorRef.current, height, width);
    }
  }, [debouncedContentChange]);

  useEffect(() => {
    return () => {
      debouncedContentChange.cancel();
    };
  }, [debouncedContentChange]);

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  // Default canvas is 900x600
  const { init, editor } = useEditor({
    defaultWidth: 900,
    defaultHeight: 600,
    clearSelectionCallback: onClearSelection,
    saveCallback: handleSaveCallback,
  });

  // Keep ref up-to-date
  editorRef.current = editor;

  // Load SVG from raw string
  const importSvg = useCallback((svgString: string) => {
    if (!editor) return;

    const canvasObj = editor.canvas;
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    
    let width = 900;
    let height = 600;

    if (svgEl) {
      const attrWidth = svgEl.getAttribute("width");
      const attrHeight = svgEl.getAttribute("height");
      
      if (attrWidth && attrHeight) {
        width = parseFloat(attrWidth);
        height = parseFloat(attrHeight);
      } else {
        const viewBox = svgEl.getAttribute("viewBox");
        if (viewBox) {
          const parts = viewBox.trim().split(/\s+/);
          if (parts.length === 4) {
            width = parseFloat(parts[2]);
            height = parseFloat(parts[3]);
          }
        }
      }
    }

    // 1. Resize canvas workspace
    editor.changeSize({ width, height });

    // Get workspace coordinates for alignment
    const workspace = editor.getWorkspace();
    const workspaceLeft = workspace?.left || 0;
    const workspaceTop = workspace?.top || 0;

    // 2. Load SVG elements
    fabric.loadSVGFromString(svgString, (objects, options) => {
      // Clear previous custom objects, keeping workspace clip path
      canvasObj.getObjects().forEach((obj) => {
        if (obj.name !== "clip") {
          canvasObj.remove(obj);
        }
      });

      // Add each individual SVG path/rect/circle offset by workspace coordinates
      objects.forEach((obj) => {
        if (obj) {
          obj.set({
            left: (obj.left || 0) + workspaceLeft,
            top: (obj.top || 0) + workspaceTop,
            hasControls: true,
            selectable: true,
          });
          canvasObj.add(obj);
        }
      });

      canvasObj.renderAll();
      editor.autoZoom();
      setHasContent(true);
    });
  }, [editor]);

  // Send IFRAME_READY on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!hasSentReady.current) {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: "IFRAME_READY"
        }, "*");
      }
      hasSentReady.current = true;
    }
  }, []);

  // Setup message listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === "SET_INITIAL_CONTENT" || event.data.type === "SET_SVG") {
        const svgContent = event.data.content || event.data.svg;
        if (svgContent) {
          setPendingSvg(svgContent);
          setHasParentSvg(true);
        }

        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: "SET_INITIAL_CONTENT_DONE"
          }, "*");
        }
      } else if (event.data.type === "REQUEST_HEIGHT") {
        if (editor) {
          const workspace = editor.getWorkspace();
          const height = workspace?.height || 0;
          const width = workspace?.width || 0;
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: "HEIGHT_RESPONSE",
              height,
              width
            }, "*");
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [editor]);

  // Load pending SVG once editor is ready
  useEffect(() => {
    if (editor && pendingSvg) {
      importSvg(pendingSvg);
      setPendingSvg(null);
    }
  }, [editor, pendingSvg, importSvg]);

  const onChangeActiveTool = useCallback((tool: ActiveTool) => {
    if (tool === activeTool) {
      return setActiveTool("select");
    }
    
    setActiveTool(tool);
  }, [activeTool]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  // Drag and drop event handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = () => {
          if (reader.result) {
            importSvg(reader.result as string);
          }
        };
      }
    }
  }, [importSvg]);

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden font-sans select-none">
      {/* Editor Workspace Panel */}
      <div className="flex-1 w-full flex relative overflow-hidden bg-slate-50/50">
        
        {/* Properties Sidebars */}
        <FillColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeWidthSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FontSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FilterSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <SettingsSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TextSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />

        {/* Main Canvas Workspace area with Drag and Drop listeners */}
        <main 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex-1 h-full overflow-hidden relative flex flex-col transition-all duration-300"
        >
          {/* Active object toolbar controls */}
          <Toolbar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            hideExport={hasParentSvg}
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          />

          {/* Canvas Wrapper */}
          <div 
            className="flex-1 relative flex items-center justify-center p-8 overflow-hidden bg-slate-50/50" 
            style={{
              backgroundImage: "radial-gradient(#e2e8f0 1.5px, transparent 1.5px)",
              backgroundSize: "20px 20px",
            }}
            ref={containerRef}
          >
            {/* Visual Drag Over Indicator Overlay */}
            {isDragOver && (
              <div className="absolute inset-0 bg-blue-500/5 border-2 border-dashed border-blue-500/40 z-[999] flex flex-col items-center justify-center gap-y-4 backdrop-blur-xs transition pointer-events-none rounded-xl m-4">
                <UploadCloud className="size-12 text-blue-500 animate-bounce" />
                <p className="text-lg font-semibold text-blue-600">Drop SVG file here to edit</p>
              </div>
            )}

            {/* Empty state overlay helper (hidden once an SVG is dropped) */}
            {!hasContent && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-[1] select-none flex flex-col items-center bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-sm">
                <UploadCloud className="size-10 text-slate-400 mb-3" />
                <h3 className="font-semibold text-slate-800 text-sm mb-1">Import an SVG</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Drag and drop any SVG vector file here to begin editing, or open one via the File menu.
                </p>
              </div>
            )}

            <canvas ref={canvasRef} />
          </div>
        </main>
      </div>
    </div>
  );
};
