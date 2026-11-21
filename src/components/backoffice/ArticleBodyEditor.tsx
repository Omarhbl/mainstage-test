"use client";

import { useEffect, useRef, useState } from "react";
import { DRAFT_RESTORE_EVENT, type DraftFields } from "@/lib/article-drafts";

type ArticleBodyEditorProps = {
  initialValue?: string;
};

type ToolbarButton = {
  label: string;
  command?: string;
  value?: string;
  action?: "link" | "image";
  requireSelection?: boolean;
};

type FigureAlignment = "left" | "center" | "right";

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function textToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function buildInlineImageMarkup(
  src: string,
  alt: string,
  width = 680,
  alignment: FigureAlignment = "center"
) {
  const safeAlt = alt.replace(/"/g, "&quot;");
  return `<figure class="article-inline-image align-${alignment}" contenteditable="false" style="width:${width}px; max-width:100%;"><img src="${src}" alt="${safeAlt}" title="${safeAlt}" /></figure><p><br></p>`;
}

function getFigureAlignment(figure: HTMLElement): FigureAlignment {
  if (figure.classList.contains("align-left")) {
    return "left";
  }

  if (figure.classList.contains("align-right")) {
    return "right";
  }

  return "center";
}

function hasNonEmptySelectionInsideEditor(editor: HTMLDivElement | null) {
  if (!editor) {
    return false;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return false;
  }

  const range = selection.getRangeAt(0);
  const commonAncestor = range.commonAncestorContainer;

  return editor.contains(commonAncestor);
}

export default function ArticleBodyEditor({
  initialValue = "",
}: ArticleBodyEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resizeStateRef = useRef<{
    figure: HTMLElement;
    startX: number;
    startWidth: number;
  } | null>(null);
  const selectedFigureRef = useRef<HTMLElement | null>(null);
  const initialHtml = looksLikeHtml(initialValue)
    ? initialValue
    : textToHtml(initialValue);
  const [bodyHtml, setBodyHtml] = useState(initialHtml);
  const [uploading, setUploading] = useState(false);
  const [hasSelectedFigure, setHasSelectedFigure] = useState(false);
  const [selectedAlignment, setSelectedAlignment] =
    useState<FigureAlignment>("center");

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.innerHTML = initialHtml;
    setBodyHtml(initialHtml);
    selectedFigureRef.current = null;
    setHasSelectedFigure(false);
    setSelectedAlignment("center");
  }, [initialHtml]);

  useEffect(() => {
    const form = editorRef.current?.closest("form");
    if (!form) return;
    const restore = (event: Event) => {
      const fields = (event as CustomEvent<DraftFields>).detail;
      const html = fields.body?.[0] ?? "";
      if (editorRef.current) editorRef.current.innerHTML = html;
      setBodyHtml(html);
      selectedFigureRef.current = null;
    setHasSelectedFigure(false);
    };
    form.addEventListener(DRAFT_RESTORE_EVENT, restore);
    return () => form.removeEventListener(DRAFT_RESTORE_EVENT, restore);
  }, []);

  const syncHtml = () => {
    setBodyHtml(editorRef.current?.innerHTML ?? "");
  };

  const clearSelectedFigure = () => {
    if (selectedFigureRef.current) {
      selectedFigureRef.current.classList.remove("is-selected");
    }

    selectedFigureRef.current = null;
    setHasSelectedFigure(false);
    setSelectedAlignment("center");
  };

  const selectFigure = (figure: HTMLElement) => {
    if (selectedFigureRef.current && selectedFigureRef.current !== figure) {
      selectedFigureRef.current.classList.remove("is-selected");
    }

    selectedFigureRef.current = figure;
    setHasSelectedFigure(true);
    figure.classList.add("is-selected");
    setSelectedAlignment(getFigureAlignment(figure));
  };

  const applyCommand = (
    command: string,
    value?: string,
    options?: { requireSelection?: boolean }
  ) => {
    if (
      options?.requireSelection &&
      !hasNonEmptySelectionInsideEditor(editorRef.current)
    ) {
      return;
    }

    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncHtml();
  };

  const insertLink = () => {
    const href = window.prompt("Paste the link URL");
    if (!href) return;
    applyCommand("createLink", href);
  };

  const insertImageByUrl = () => {
    const src = window.prompt("Paste the image URL");
    if (!src) return;
    const alt = window.prompt("Optional image caption / alt text") ?? "";
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      buildInlineImageMarkup(src, alt)
    );
    syncHtml();
  };

  const uploadInlineImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/backoffice/article-inline-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("We couldn’t upload that inline image yet.");
    }

    const data = (await response.json()) as { url?: string };
    if (!data.url) {
      throw new Error("Inline image upload did not return a URL.");
    }

    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      buildInlineImageMarkup(data.url, file.name)
    );
    syncHtml();
  };

  const applyFigureAlignment = (alignment: FigureAlignment) => {
    const figure = selectedFigureRef.current;
    if (!figure) {
      window.alert("Select an image in the article body first.");
      return;
    }

    figure.classList.remove("align-left", "align-center", "align-right");
    figure.classList.add(`align-${alignment}`);
    figure.classList.add("is-selected");
    setSelectedAlignment(alignment);
    syncHtml();
  };

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as HTMLElement | null;
    const figure = target?.closest("figure.article-inline-image") as HTMLElement | null;

    if (!figure) {
      clearSelectedFigure();
      return;
    }

    selectFigure(figure);

    const rect = figure.getBoundingClientRect();
    const nearRightEdge = rect.right - event.clientX < 20;
    const nearBottomEdge = rect.bottom - event.clientY < 20;

    if (!nearRightEdge && !nearBottomEdge) {
      return;
    }

    event.preventDefault();
    resizeStateRef.current = {
      figure,
      startX: event.clientX,
      startWidth: rect.width,
    };
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const state = resizeStateRef.current;
    if (!state) {
      return;
    }

    event.preventDefault();
    const nextWidth = Math.max(220, state.startWidth + (event.clientX - state.startX));
    state.figure.style.width = `${Math.round(nextWidth)}px`;
    state.figure.style.maxWidth = "100%";
  };

  const stopResize = () => {
    if (!resizeStateRef.current) {
      return;
    }

    resizeStateRef.current = null;
    syncHtml();
  };

  const toolbarButtons: ToolbarButton[] = [
    { label: "Bold", command: "bold", requireSelection: true },
    { label: "Italic", command: "italic", requireSelection: true },
    { label: "Underline", command: "underline", requireSelection: true },
    { label: "H3", command: "formatBlock", value: "h3" },
    { label: "Quote", command: "formatBlock", value: "blockquote" },
    { label: "Bullets", command: "insertUnorderedList" },
    { label: "Numbers", command: "insertOrderedList" },
    { label: "Link", action: "link" },
    { label: "Image URL", action: "image" },
  ];

  return (
    <div className="mt-2 rounded-[16px] border border-black/10 bg-[#faf8f6] p-4">
      <div className="flex flex-wrap gap-2">
        {toolbarButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              button.action === "link" ? insertLink() : button.action === "image" ? insertImageByUrl()
                : applyCommand(button.command!, button.value, {
                    requireSelection: button.requireSelection,
                  })
            }
            className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-black/10 bg-white px-3 text-[13px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
          >
            {button.label}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-black/10 bg-white px-3 text-[13px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
        >
          {uploading ? "Uploading..." : "Upload image"}
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyCommand("removeFormat")}
          className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-black/10 bg-white px-3 text-[13px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
        >
          Clear
        </button>
        <div className="ml-2 flex items-center gap-2 rounded-[10px] border border-black/10 bg-white px-2 py-1">
          <span className="px-2 text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-black/40">
            Image align
          </span>
          {(["left", "center", "right"] as FigureAlignment[]).map((alignment) => (
            <button
              key={alignment}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyFigureAlignment(alignment)}
              className={`inline-flex h-[32px] items-center justify-center rounded-[8px] px-3 text-[12px] font-body font-semibold transition-colors ${
                hasSelectedFigure && selectedAlignment === alignment
                  ? "bg-[#CE2127] text-white"
                  : "text-[#181818] hover:text-[#CE2127]"
              }`}
            >
              {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[13px] font-body leading-[1.7] text-black/55">
        Use the toolbar to style the article body, add links, and insert images inside the article.
      </p>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onClickCapture={(event) => event.stopPropagation()}
        onDoubleClickCapture={(event) => event.stopPropagation()}
        onInput={syncHtml}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopResize}
        onMouseLeave={stopResize}
        className="article-editor mt-4 min-h-[320px] rounded-[12px] border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#CE2127]"
      />

      <input type="hidden" name="body" value={bodyHtml} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;

          try {
            setUploading(true);
            await uploadInlineImage(file);
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Inline image upload failed.");
          } finally {
            setUploading(false);
            event.target.value = "";
          }
        }}
      />
    </div>
  );
}
