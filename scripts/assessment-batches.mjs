// Bound both input and output per paid request. No retries are scheduled here.
export const assessmentItemSchema={type:'object',additionalProperties:false,
 required:['id','decision','ai_quote','local_basis','reason'],properties:{
  id:{type:'string',maxLength:80},decision:{type:'string',enum:['candidate','reject','needs_review']},
  ai_quote:{type:'string',maxLength:240},local_basis:{type:'string',maxLength:320},reason:{type:'string',maxLength:320}}};
export const ASSESSMENT_MAX_OUTPUT_TOKENS=2600;
export function assessmentBatches(items,textFor){
 const batches=[];let batch=[],characters=0;
 for(const item of items){
  const size=textFor(item).length;
  if(batch.length&&(batch.length>=4||characters+size>18000)){batches.push(batch);batch=[];characters=0;}
  batch.push(item);characters+=size;
 }
 if(batch.length)batches.push(batch);
 return batches;
}
