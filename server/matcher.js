const norm = s => String(s || '').toLowerCase().trim();
const words = s => new Set(norm(s).split(/[^a-z0-9]+/).filter(w => w.length > 2));
function textSimilarity(a,b) { const A=words(a), B=words(b); if(!A.size&&!B.size)return 0; let n=0; A.forEach(w=>{if(B.has(w))n++}); return n/(A.size+B.size-n || 1); }
function similarity(lost, found) {
  const category = norm(lost.category) === norm(found.category) ? 1 : 0;
  const color = norm(lost.color) && norm(found.color) ? (norm(lost.color)===norm(found.color)?1: textSimilarity(lost.color,found.color)*.5) : .25;
  const description = textSimilarity(`${lost.name} ${lost.description}`, `${found.name} ${found.description}`);
  const name = textSimilarity(lost.name, found.name);
  const location = textSimilarity(lost.location, found.location);
  const days = Math.abs((new Date(lost.item_date)-new Date(found.item_date))/(1000*60*60*24));
  const date = Number.isFinite(days) ? Math.max(0,1-days/45) : .3;
  // Image is a prototype proxy: presence and matching category/color stand in for visual similarity.
  // Replace this factor with an embedding/cosine score from a computer-vision model in production.
  const image = lost.image_path && found.image_path ? (category*.45 + color*.35 + description*.2) : .35;
  const score = (image*.15 + description*.25 + name*.15 + category*.20 + color*.10 + location*.10 + date*.05)*100;
  return { score: Math.round(Math.max(0, Math.min(99, score))), factors: {image:Math.round(image*100),text:Math.round(description*100),category:Math.round(category*100),color:Math.round(color*100),location:Math.round(location*100),date:Math.round(date*100)} };
}
module.exports = { similarity };
