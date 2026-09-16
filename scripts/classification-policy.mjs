// Deterministic routing: model relevance is never publication permission.
export function enforceEvidence(input,result){
 if(result.decision!=='candidate')return result;
 const explicitAI=/\b(?:AI|artificial intelligence|machine learning|deep learning|ChatGPT|generative AI|large language models?|LLMs?|neural networks?)\b/i;
 if(!result.ai_quote?.trim()||!input.text.includes(result.ai_quote)||!explicitAI.test(result.ai_quote))
  return {...result,decision:'needs_review',reason:'Withheld: the quoted evidence does not explicitly establish AI relevance.'};
 return result;
}
export function routeCandidate(input, result, now) {
  const published = Date.parse(input.sourceDate ?? '');
  const ageDays = (now - published) / 86400000;
  const isEvent=input.sourceKind==='calendar';
  return { ...result, source_id: input.source_id, url: input.url,
    sourceDate: input.sourceDate,
    destination: result.decision === 'reject' ? 'excluded' : result.decision==='needs_review'?'evidence_review':
      !Number.isFinite(published) ? 'date_review' :
      isEvent&&ageDays>=-365&&ageDays<=30 ? 'current_review' :
      ageDays < 0 ? 'date_review' :
      ageDays > 90 ? 'archive_review' : 'current_review',
    publication_status: 'unpublished',
  };
}
