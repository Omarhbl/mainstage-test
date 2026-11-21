"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sanitizeArticleBodyHtml } from "@/lib/article-rich-text";
import { DRAFT_FIELDS, DRAFT_FILE_FIELDS, DRAFT_PREFIX, DRAFT_RESTORE_EVENT, draftFiles, draftSignature, parseArticleDraft, validDraftToken, type ArticleDraft, type DraftFields, type DraftFiles } from "@/lib/article-drafts";

export default function ArticleDraftForm({action,scope,baseVersion,children}:{action:(data:FormData)=>void|Promise<void>;scope:string;baseVersion:string;children:React.ReactNode}) {
  const router=useRouter();
  const dialogRef=useRef<HTMLDialogElement>(null);
  const leaving=useRef(false);
  const [pendingHref,setPendingHref]=useState<string|null>(null);
  const formRef=useRef<HTMLFormElement>(null);
  const contentRef=useRef<HTMLDivElement>(null);
  const token=useRef("");
  const dirty=useRef(false);
  const submitting=useRef(false);
  const ready=useRef(false);
  const saveRef=useRef<()=>void>(()=>{});
  const [loaded,setLoaded]=useState(false);
  const [isSubmitting,setSubmitting]=useState(false);
  const [recovery,setRecovery]=useState<{key:string;draft:ArticleDraft}|null>(null);
  const [message,setMessage]=useState("Preparing draft recovery…");
  const prefix=`${DRAFT_PREFIX}${scope}:`;

  useEffect(()=>{
    const form=formRef.current,content=contentRef.current;
    if(!form || !content)return;
    token.current=crypto.randomUUID();
    dirty.current=false;
    ready.current=false;
    const key=prefix+token.current;
    let active=true;
    let last="";
    let lastFiles=JSON.stringify(DRAFT_FILE_FIELDS.map(name=>[name,[]]));
    let fileQueue=Promise.resolve();
    let fileError=false;
    let pendingFiles=0;
    function read() {
      const data=new FormData(form!);
      const fields=Object.fromEntries(DRAFT_FIELDS.map(name=>[name,data.getAll(name).filter((value):value is string=>typeof value==="string")]));
      const body=form!.querySelector<HTMLElement>('[contenteditable="true"]');
      if(body){
        const clone=body.cloneNode(true) as HTMLElement;
        clone.querySelectorAll(".is-selected").forEach(node=>node.classList.remove("is-selected"));
        fields.body=[clone.innerHTML];
      }
      const files:DraftFiles=Object.fromEntries(DRAFT_FILE_FIELDS.map(name=>[name,data.getAll(name).filter((value):value is File=>value instanceof File && value.size>0)]));
      return {fields,files,signature:draftSignature(fields,files)};
    }
    const baseline=read().signature;
    function save() {
      if(!ready.current || !active)return;
      const current=read();
      dirty.current=current.signature!==baseline;
      if(current.signature===last)return;
      if(!dirty.current){try{localStorage.removeItem(key);last=current.signature;}catch{}setMessage("No unsaved changes.");return;}
      const draft:ArticleDraft={version:1,token:token.current,savedAt:Date.now(),baseVersion,fields:current.fields,files:DRAFT_FILE_FIELDS.filter(name=>current.files[name]?.length)};
      try {
        localStorage.setItem(key,JSON.stringify(draft));
        last=current.signature;
        const fileSignature=JSON.stringify(Object.entries(current.files).map(([name,files])=>[name,files.map(file=>[file.name,file.size,file.lastModified])]));
        if(fileSignature!==lastFiles || (fileError && pendingFiles===0)){
          lastFiles=fileSignature;
          pendingFiles+=1;
          setMessage("Saving recovery copy…");
          fileQueue=fileQueue.catch(()=>{}).then(async()=>{
            await draftFiles(key,"put",current.files);
            fileError=false;
          }).catch(()=>{fileError=true;}).finally(()=>{
            pendingFiles-=1;
            if(active)setMessage(pendingFiles ? "Text saved; backing up image files…" : fileError ? "Text saved. Image files could not be backed up—keep the originals and save the article." : "Recovery copy saved on this browser.");
          });
        }else if(!fileError && !pendingFiles)setMessage("Recovery copy saved on this browser.");
      }catch{setMessage("Recovery storage is unavailable or full. Save the article now to protect your work.");}
    }
    saveRef.current=save;
    async function initialise() {
      try {
        const savedToken=new URL(location.href).searchParams.get("savedDraft");
        // Only a confirmed successful server save supplies this token. Other tabs' copies survive.
        if(validDraftToken(savedToken)) {
          const accountPrefix=prefix.slice(0,prefix.lastIndexOf(":" ,prefix.length-2)+1);
          const keys=Object.keys(localStorage).filter(name=>name.startsWith(accountPrefix));
          for(const savedKey of keys)if(parseArticleDraft(localStorage.getItem(savedKey)||"")?.token===savedToken){localStorage.removeItem(savedKey);void draftFiles(savedKey,"delete").catch(()=>{});}
        }
        const candidates=Object.keys(localStorage).filter(name=>name.startsWith(prefix)).map(name=>({key:name,draft:parseArticleDraft(localStorage.getItem(name)||"")})).filter((entry):entry is {key:string;draft:ArticleDraft}=>!!entry.draft).sort((a,b)=>b.draft.savedAt-a.draft.savedAt);
        if(!active)return;
        if(candidates[0])setRecovery(candidates[0]);
        else {ready.current=true;setMessage("Automatic recovery is on for this browser.");}
      }catch{ready.current=true;if(active)setMessage("Recovery storage is unavailable. Keep this tab open and save the article regularly.");}
      if(active)setLoaded(true);
    }
    void initialise();
    const beforeUnload=(event:BeforeUnloadEvent)=>{save();if(dirty.current&&!submitting.current&&!leaving.current){event.preventDefault();event.returnValue="";}};
    const leave=(event:MouseEvent)=>{
      const link=(event.target as Element)?.closest?.("a[href]");
      if(!(link instanceof HTMLAnchorElement) || link.target==="_blank" || link.hasAttribute("download") || link.closest('[contenteditable="true"]') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button!==0)return;
      const url=new URL(link.href);
      if(url.href===location.href || (url.pathname===location.pathname && url.search===location.search && url.hash))return;
      save();
      if(dirty.current&&!submitting.current){event.preventDefault();event.stopPropagation();setPendingHref(url.href);}
    };
    const flush=()=>save();
    const observer=new MutationObserver(save);
    observer.observe(content,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["value"]});
    form.addEventListener("input",save);form.addEventListener("change",save);
    window.addEventListener("beforeunload",beforeUnload);window.addEventListener("pagehide",flush);document.addEventListener("visibilitychange",flush);document.addEventListener("click",leave,true);
    return ()=>{active=false;ready.current=false;observer.disconnect();form.removeEventListener("input",save);form.removeEventListener("change",save);window.removeEventListener("beforeunload",beforeUnload);window.removeEventListener("pagehide",flush);document.removeEventListener("visibilitychange",flush);document.removeEventListener("click",leave,true);};
  },[prefix,baseVersion]);

  useEffect(()=>{
    const dialog=dialogRef.current;
    if(pendingHref && dialog && !dialog.open)dialog.showModal();
    return ()=>{if(dialog?.open)dialog.close();};
  },[pendingHref]);

  async function restore() {
    const form=formRef.current;
    if(!form||!recovery)return;
    const fields:DraftFields={...recovery.draft.fields,body:[sanitizeArticleBodyHtml(recovery.draft.fields.body?.[0]||"")]};
    for(const name of DRAFT_FIELDS){
      const values=fields[name]||[];
      for(const element of Array.from(form.elements)){
        if(!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)||element.name!==name)continue;
        if(element instanceof HTMLInputElement && (element.type==="checkbox"||element.type==="radio"))element.checked=values.includes(element.value);
        else element.value=values[0]||"";
      }
    }
    let missingFiles=false;
    let filesCopied=recovery.draft.files.length===0;
    try {
      const files=recovery.draft.files.length?await draftFiles(recovery.key,"get"):{};
      for(const name of recovery.draft.files){
        const input=form.elements.namedItem(name);
        if(!(input instanceof HTMLInputElement)||!files[name]?.length){missingFiles=true;continue;}
        const transfer=new DataTransfer();for(const file of files[name])transfer.items.add(file);input.files=transfer.files;
      }
      if(recovery.draft.files.length && !missingFiles){await draftFiles(prefix+token.current,"put",files);filesCopied=true;}
    }catch{missingFiles=recovery.draft.files.length>0;}
    form.dispatchEvent(new CustomEvent(DRAFT_RESTORE_EVENT,{detail:fields}));
    form.dispatchEvent(new Event("input",{bubbles:true}));
    form.dispatchEvent(new Event("change",{bubbles:true}));
    ready.current=true;setRecovery(null);
    // React-controlled rich text and framing settle before the new recovery copy is read.
    setTimeout(()=>{saveRef.current();if(filesCopied){try{if(localStorage.getItem(prefix+token.current)||!dirty.current){localStorage.removeItem(recovery.key);void draftFiles(recovery.key,"delete").catch(()=>{});}}catch{}}if(missingFiles)setMessage("Article text restored. Please reselect the image files that could not be recovered.");},0);
  }
  function discard() {
    if(!recovery)return;
    try{localStorage.removeItem(recovery.key);void draftFiles(recovery.key,"delete").catch(()=>{});}catch{}
    ready.current=true;setRecovery(null);setMessage("Automatic recovery is on for this browser.");
  }
  return <form ref={formRef} action={async data=>{
    saveRef.current();submitting.current=true;setSubmitting(true);
    data.set("recovery_token",token.current);
    try{await action(data);}catch(error){
      if(error && typeof error==="object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT"))throw error;
      setMessage("The article could not be saved. Your recovery copy is kept in this browser; please try saving again.");
    }finally{submitting.current=false;setSubmitting(false);}
  }} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px]">
    <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm xl:col-span-2">
      {recovery?<><p>A recovery copy from {new Date(recovery.draft.savedAt).toLocaleString()} is available.{recovery.draft.baseVersion!==baseVersion?" The saved article has changed since this copy—review it before restoring.":""}</p><div className="mt-2 flex gap-4"><button type="button" onClick={()=>void restore()} className="font-semibold text-[#a51b20] underline">Restore my work</button><button type="button" onClick={discard} className="underline">Discard recovery copy</button></div></>:<p role="status" className="text-black/65">{message}</p>}
    </div>
    {pendingHref && <dialog ref={dialogRef} aria-labelledby="leave-article-heading" onCancel={event=>{event.preventDefault();setPendingHref(null);}} className="fixed inset-0 m-auto max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl backdrop:bg-black/40">
      <h2 id="leave-article-heading" className="text-lg font-bold">Leave this article?</h2>
      <p className="mt-3 text-sm leading-relaxed text-black/70">You have unsaved changes. A recovery copy is kept in this browser when storage is available, but the article itself has not been saved.</p>
      <div className="mt-5 flex gap-3"><button autoFocus type="button" onClick={()=>setPendingHref(null)} className="rounded-lg bg-[#CE2127] px-4 py-2 text-sm font-semibold text-white">Stay in editor</button><button type="button" onClick={()=>{leaving.current=true;const url=new URL(pendingHref);setPendingHref(null);if(url.origin===location.origin)router.push(url.pathname+url.search+url.hash);else location.assign(url.href);}} className="rounded-lg border border-black/15 px-4 py-2 text-sm">Leave editor</button></div>
    </dialog>}
    <div ref={contentRef} className="contents" inert={!loaded||!!recovery||isSubmitting}>{children}</div>
  </form>;
}
