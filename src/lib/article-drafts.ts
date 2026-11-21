export const DRAFT_PREFIX = "mainstage:article-recovery:v1:";
export const DRAFT_RESTORE_EVENT = "mainstage:restore-article-draft";
export const DRAFT_FIELDS = ["title","slug","primary_category","secondary_categories","date_label","tags","summary","intro","body","status","seo_title","seo_description","image","image_caption","hero_media_type","hero_media_src","bottom_media_type","bottom_media_src","image_position_x","image_position_y","homepage_image_position_x","homepage_image_position_y","hero_image_position_x","hero_image_position_y","bottom_image_position_x","bottom_image_position_y"] as const;
export const DRAFT_FILE_FIELDS = ["image_file","hero_media_file","bottom_media_file"] as const;
export type DraftFields = Record<string,string[]>;
export type DraftFiles = Record<string,File[]>;
export type ArticleDraft = { version:1; token:string; savedAt:number; baseVersion:string; fields:DraftFields; files:string[] };
export const validDraftToken = (value:unknown): value is string => typeof value === "string" && /^[a-f0-9-]{36}$/i.test(value);
export function parseArticleDraft(value:string):ArticleDraft|null {
  try {
    const draft=JSON.parse(value);
    if(draft.version!==1 || !validDraftToken(draft.token) || !Number.isFinite(draft.savedAt) || typeof draft.baseVersion!=="string" || !draft.fields || typeof draft.fields!=="object")return null;
    const fields:DraftFields={};
    for(const key of DRAFT_FIELDS) {
      const values=draft.fields[key];
      if(!Array.isArray(values) || values.length>10 || values.some(v=>typeof v!=="string" || v.length>2000000))return null;
      fields[key]=values;
    }
    return {...draft,fields,files:Array.isArray(draft.files)?draft.files.filter((name:unknown)=>DRAFT_FILE_FIELDS.includes(name as typeof DRAFT_FILE_FIELDS[number])):[]};
  }catch{return null;}
}
export function draftSignature(fields:DraftFields,files:DraftFiles) {
  return JSON.stringify([fields,Object.entries(files).map(([key,items])=>[key,items.map(file=>[file.name,file.size,file.lastModified])])]);
}
let database:Promise<IDBDatabase>|undefined;
function openDatabase() {
  if(!database)database=new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open("mainstage-article-recovery",1);
    request.onupgradeneeded=()=>request.result.createObjectStore("files");
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>{database=undefined;reject(request.error);};
  });
  return database;
}
export async function draftFiles(key:string,operation:"get"|"put"|"delete",value?:DraftFiles):Promise<DraftFiles> {
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const transaction=db.transaction("files",operation==="get"?"readonly":"readwrite");
    const store=transaction.objectStore("files");
    const request=operation==="get"?store.get(key):operation==="put"?store.put(value,key):store.delete(key);
    transaction.oncomplete=()=>resolve(operation==="get"?(request.result??{}):{});
    transaction.onerror=()=>reject(transaction.error);
    transaction.onabort=()=>reject(transaction.error);
  });
}
