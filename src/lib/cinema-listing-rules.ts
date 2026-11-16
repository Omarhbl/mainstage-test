function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Recognise fixtures without hiding films merely because their story involves
// football, or because their title contains “vs” (e.g. Godzilla vs Kong).
const teams = /(?:^|[^\p{L}])(?:maroc|morocco|المغرب|niger|نيجر|senegal|السنغال|mali|مالي|france|فرنسا|algerie|algeria|الجزائر|tunisie|tunisia|تونس|egypte|egypt|مصر|cameroun|cameroon|nigeria|ghana|benin|gabon|congo|zambie|zambia|tanzanie|tanzania|uganda|ouganda|mozambique|comores|comoros|madagascar|botswana|burkina faso|cote d['’ ]?ivoire|ivory coast|south africa|afrique du sud|cap vert|cape verde|guinee|guinea|mauritanie|mauritania|bresil|brazil|argentine|argentina|portugal|espagne|spain|allemagne|germany|angleterre|england|italie|italy|belgique|belgium|pays bas|netherlands|croatie|croatia|suisse|switzerland|turquie|turkey|japon|japan|coree du sud|south korea|arabie saoudite|saudi arabia|qatar|wydad|wac|raja|rca|as far|far rabat|rs berkane|barcelone|barcelona|real madrid|atletico madrid|psg|paris saint germain|marseille|liverpool|arsenal|chelsea|manchester city|manchester united|bayern|dortmund|juventus|inter milan|ac milan)(?:$|[^\p{L}])/u;

export function isFootballScreening(title: string, genres: string[] = []) {
  const text = normalize(title);
  const categories = genres.map(normalize);
  if (categories.some(value => /^(football|soccer|كرة القدم)$/.test(value))) return true;
  const sides = text.split(/\s+(?:vs?\.?|versus|contre|ضد)\s+|\s*[-–—/]\s*/u);
  if (sides.length > 1 && sides.filter(side => teams.test(side)).length >= 2) return true;
  // Cinema feeds also classify live fixtures as Sport. Feature films with a
  // sports theme and no fixture title remain eligible.
  if (categories.includes("sport") && /\s(?:vs\.?|versus|contre|ضد)\s/u.test(text)) return true;
  const football = /\b(?:football|soccer|foot|champions league|ligue des champions|europa league|conference league|coupe du monde|world cup|coupe d['’]afrique|africa cup of nations|can 20\d{2})\b|كرة القدم|دوري أبطال|كاس العالم|كأس العالم/u.test(text);
  const broadcast = /\b(?:match|live|direct|retransmission|diffusion|finale?|qualifications?)\b|مباراة|مباشر/u.test(text);
  return football && broadcast;
}
