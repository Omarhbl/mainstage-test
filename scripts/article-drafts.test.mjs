import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
const exports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/article-drafts.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,indexedDB:{open(){throw Error('Storage blocked');}}});
const {DRAFT_FIELDS,parseArticleDraft,validDraftToken,draftSignature,draftFiles}=exports;
const fields=Object.fromEntries(DRAFT_FIELDS.map(name=>[name,[]]));
fields.title=['Recovered story'];fields.body=['<p><strong>Formatted</strong> body</p>'];fields.secondary_categories=['Music','Culture'];fields.seo_title=['SEO title'];fields.hero_image_position_x=['27'];
const draft={version:1,token:'681a5af2-a9d0-4a1c-bb3c-98bf175f9963',savedAt:Date.now(),baseVersion:'2026-11-20T12:00:00Z',fields,files:['image_file']};
test('retains rich text, repeated categories, SEO, crop coordinates and attachment references',()=>{
 const result=parseArticleDraft(JSON.stringify(draft));
 assert.equal(result.fields.body[0],fields.body[0]);assert.equal(result.fields.secondary_categories.length,2);assert.equal(result.fields.seo_title[0],'SEO title');assert.equal(result.fields.hero_image_position_x[0],'27');assert.equal(result.files[0],'image_file');
});
test('rejects malformed copies and strips unknown form fields / attachment names',()=>{
 for(const value of ['not json','null',JSON.stringify({...draft,token:'wrong'}),JSON.stringify({...draft,savedAt:'yesterday'}),JSON.stringify({...draft,fields:{...fields,title:[{}]}})])assert.equal(parseArticleDraft(value),null);
 const filtered=parseArticleDraft(JSON.stringify({...draft,fields:{...fields,id:['other-article'],password:['private']},files:['password','image_file']}));
 assert.equal(filtered.fields.id,undefined);assert.equal(filtered.fields.password,undefined);assert.equal(filtered.files.length,1);
 assert.equal(validDraftToken('x&redirect=https://bad.example'),false);
});
test('detects replaced files and text changes rather than treating equal filenames as equal',()=>{
 const first=draftSignature(fields,{image_file:[{name:'cover.png',size:100,lastModified:1}]});
 assert.notEqual(first,draftSignature(fields,{image_file:[{name:'cover.png',size:200,lastModified:2}]}));
 assert.notEqual(first,draftSignature({...fields,title:['Changed']},{image_file:[{name:'cover.png',size:100,lastModified:1}]}));
});
test('reports unavailable attachment storage instead of pretending the file was saved',async()=>{
 await assert.rejects(draftFiles('test','put',{}),/Storage blocked/);
});
