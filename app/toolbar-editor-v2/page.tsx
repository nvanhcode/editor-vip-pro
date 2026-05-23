"use client";

import dynamic from "next/dynamic";

const SvgEditorContainer = dynamic(
  () => import("@/components/svg-editor/SvgEditorContainer").then((mod) => mod.SvgEditorContainer),
  { ssr: false }
);

export default function Page() {
  return <SvgEditorContainer />;
}
