import{c as O}from"./cn-Dj5kSLHa.js";const o=d=>typeof d=="boolean"?`${d}`:d===0?"0":d,y=O,j=(d,u)=>n=>{var s;if((u==null?void 0:u.variants)==null)return y(d,n==null?void 0:n.class,n==null?void 0:n.className);const{variants:f,defaultVariants:a}=u,V=Object.keys(f).map(e=>{const t=n==null?void 0:n[e],i=a==null?void 0:a[e];if(t===null)return null;const l=o(t)||o(i);return f[e][l]}),c=n&&Object.entries(n).reduce((e,t)=>{let[i,l]=t;return l===void 0||(e[i]=l),e},{}),v=u==null||(s=u.compoundVariants)===null||s===void 0?void 0:s.reduce((e,t)=>{let{class:i,className:l,...N}=t;return Object.entries(N).every(C=>{let[m,r]=C;return Array.isArray(r)?r.includes({...a,...c}[m]):{...a,...c}[m]===r})?[...e,i,l]:e},[]);return y(d,V,v,n==null?void 0:n.class,n==null?void 0:n.className)};export{j as c};
