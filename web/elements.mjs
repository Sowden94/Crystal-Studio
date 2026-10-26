// Atomic radius facts: Cordero et al. (2008), Z=1–96; Pyykkö single-bond
// values, Z=97–118. Transcribed from Paul Kienzle's public-domain Periodictable
// data, source blob d4f02e58cb570537b86d069c33468f5572a8beaa.
// See docs/guide/elements-and-metals.md for sources and predictive limitations.
export const symbols=Object.freeze('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' '));
const values=[0.31,0.28,1.28,0.96,0.84,0.76,0.71,0.66,0.57,0.58,1.66,1.41,1.21,1.11,1.07,1.05,1.02,1.06,2.03,1.76,1.7,1.6,1.53,1.39,1.39,1.32,1.26,1.24,1.32,1.22,1.22,1.2,1.19,1.2,1.2,1.16,2.2,1.95,1.9,1.75,1.64,1.54,1.47,1.46,1.42,1.39,1.45,1.44,1.42,1.39,1.39,1.38,1.39,1.4,2.44,2.15,2.07,2.04,2.03,2.01,1.99,1.98,1.98,1.96,1.94,1.92,1.92,1.89,1.9,1.87,1.87,1.75,1.7,1.62,1.51,1.44,1.41,1.36,1.36,1.32,1.45,1.46,1.48,1.4,1.5,1.5,2.6,2.21,2.15,2.06,2,1.96,1.9,1.87,1.8,1.69,1.66,1.68,1.65,1.67,1.73,1.76,1.61,1.57,1.49,1.43,1.41,1.34,1.29,1.28,1.21,1.22,1.36,1.43,1.62,1.75,1.65,1.57];
const nonmetals=new Set('H He B C N O F Ne Si P S Cl Ar Ge As Se Br Kr Sb Te I Xe At Rn Ts Og'.split(' '));
export const atomicNumber=Object.freeze(Object.fromEntries(symbols.map((s,i)=>[s,i+1])));
export const covalentRadii=Object.freeze(Object.fromEntries(symbols.map((s,i)=>[s,values[i]])));
export const isMetal=s=>!!atomicNumber[s]&&!nonmetals.has(s);
export const radiusSource=s=>atomicNumber[s]<=96?'Cordero 2008':'Pyykkö single-bond (predicted/compiled)';
export function elementSymbol(value,{label=false}={}){
  const text=String(value??'').trim();
  if(/^(D|T)(?:\d|$)/.test(text))return 'H';
  const m=label?text.match(/^([A-Z][a-z]?)/):text.match(/^(?:\d+)?([A-Za-z]{1,2})(?:\d*(?:[+-]\d*)?)?$/);
  if(!m)throw Error('Unrecognised element: '+text.slice(0,80));
  const symbol=m[1][0].toUpperCase()+m[1].slice(1).toLowerCase();
  if(!atomicNumber[symbol])throw Error('Unrecognised element: '+text.slice(0,80));
  return symbol;
}
const familiar={H:'#f6f6ef',C:'#737f85',O:'#db564c',N:'#557bd1',S:'#e6be48',P:'#e3983e',F:'#86c78c',Cl:'#71b96f',Br:'#a15c39',I:'#8a65b0',B:'#ce9e89',Si:'#c7b39d',Fe:'#bc7456',Cu:'#bc825e',Zn:'#9192a8'};
export const elementColours=Object.freeze(Object.fromEntries(symbols.map((s,i)=>[s,familiar[s]||'hsl('+Math.round((i*137.508)%360)+', 46%, 58%)'])));

