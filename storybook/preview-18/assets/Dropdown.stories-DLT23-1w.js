import{j as c}from"./jsx-runtime-CmIOflP4.js";import{r as s}from"./index-KqYmeiyw.js";import{a as y}from"./cn-Dj5kSLHa.js";const O="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20fill='none'%20viewBox='0%200%2024%2024'%20stroke='currentColor'%20%3e%3cpath%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='2'%20d='M19%209l-7%207-7-7'%20/%3e%3c/svg%3e",C={DROPDOWN_TOTAL_ROUNDS:{key:"1",alternativeKeys:["1","!"],description:"라운드 수 설정"},DROPDOWN_MAX_PLAYERS:{key:"2",alternativeKeys:["2","@"],description:"플레이어 수 설정"},DROPDOWN_DRAW_TIME:{key:"3",alternativeKeys:["3","#"],description:"제한시간 설정"},CHAT:{key:"Enter",alternativeKeys:null,description:"채팅"},GAME_START:{key:"s",alternativeKeys:["s","S","ㄴ"],description:"게임 시작"},GAME_INVITE:{key:"i",alternativeKeys:["i","I","ㅑ"],description:"초대하기"}},T=n=>{const i=s.useCallback(e=>{e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement||n.forEach(({key:l,action:a,disabled:o})=>{var u;if(!l||o)return;const r=C[l],d=e.key.toLowerCase(),p=d===r.key.toLowerCase(),m=(u=r.alternativeKeys)==null?void 0:u.some(f=>f.toLowerCase()===d);(p||m)&&(e.preventDefault(),a())})},[n]);s.useEffect(()=>(window.addEventListener("keydown",i),()=>window.removeEventListener("keydown",i)),[i])},K=({shortcutKey:n,handleChange:i,options:e})=>{const[l,a]=s.useState(!1),[o,r]=s.useState(-1),d=s.useRef(null),p=s.useRef([]),m=s.useCallback(()=>{a(t=>!t),r(-1)},[]),u=s.useCallback(t=>{a(!1),r(-1),i(t)},[i]);T([{key:n||null,action:m}]);const f=s.useCallback(t=>{l&&(t.key==="ArrowDown"?r(h=>(h+1)%e.length):t.key==="ArrowUp"?r(h=>(h-1+e.length)%e.length):t.key==="Escape"&&(a(!1),r(-1)))},[l,e.length]),g=s.useCallback(t=>{t.key==="Enter"&&o>=0&&(t.stopPropagation(),u(e[o]))},[o,u,e]),w=s.useCallback(t=>{d.current&&!d.current.contains(t.target)&&(a(!1),r(-1))},[]);return s.useEffect(()=>{var t;o>=0&&p.current[o]&&((t=p.current[o])==null||t.focus())},[o]),s.useEffect(()=>(document.addEventListener("keydown",f),document.addEventListener("mousedown",w),()=>{document.removeEventListener("keydown",f),document.removeEventListener("mousedown",w)}),[f,w]),{isOpen:l,focusedIndex:o,toggleDropdown:m,handleOptionClick:u,dropdownRef:d,optionRefs:p,handleOptionKeyDown:g}},x=({options:n,handleChange:i,selectedValue:e,shortcutKey:l,className:a,...o})=>{const{isOpen:r,toggleDropdown:d,handleOptionClick:p,dropdownRef:m,optionRefs:u,handleOptionKeyDown:f}=K({handleChange:i,shortcutKey:l,options:n});return c.jsxs("div",{className:y("relative rounded-lg bg-eastbay-50 text-2xl",a),ref:m,...o,children:[c.jsxs("button",{onClick:d,className:"flex h-full w-full items-center justify-between rounded-lg border-2 border-violet-950 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",children:[c.jsx("span",{className:"w-full text-center",children:e}),c.jsx("img",{src:O,alt:"드롭다운 메뉴 토글버튼",className:y("h-5 w-5 transition-transform duration-200",r&&"rotate-180")})]}),c.jsx("div",{className:y("absolute left-0 z-10 w-full rounded-lg bg-eastbay-50 shadow-lg","origin-top transform transition-all duration-200",!r&&"invisible scale-y-0"),children:c.jsx("div",{className:"overflow-hidden rounded-lg",children:n.map((g,w)=>c.jsx("button",{ref:t=>u.current[w]=t,onClick:()=>p(g),onKeyDown:f,className:y("w-full p-2 text-center transition-colors duration-200 ease-in-out hover:bg-violet-100 focus:bg-violet-200"),children:g},w))})})]})};x.__docgenInfo={description:"",methods:[],displayName:"Dropdown",props:{options:{required:!0,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:""},handleChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},selectedValue:{required:!0,tsType:{name:"string"},description:""},shortcutKey:{required:!1,tsType:{name:"unknown"},description:""}},composes:["HTMLAttributes"]};const k=["옵션 1","옵션 2","옵션 3"],N={title:"components/ui/Dropdown",component:x,argTypes:{options:{control:"object",description:"드롭다운에 표시될 옵션 목록"},selectedValue:{control:"select",options:k,description:"현재 선택된 값"},handleChange:{description:"값이 변경될 때 호출되는 함수",action:"changed"},className:{control:"text",description:"추가 스타일링"}},parameters:{docs:{description:{component:"사용자가 여러 옵션 중 하나를 선택할 수 있는 드롭다운 컴포넌트입니다.<br/><br/>드롭다운을 클릭하고 옵션을 선택해보세요."}}},tags:["autodocs"]},A=n=>{const[i,e]=s.useState(n.selectedValue);s.useEffect(()=>{e(n.selectedValue)},[n.selectedValue]);const l=a=>{e(a),n.handleChange(a)};return c.jsx(x,{...n,selectedValue:i,handleChange:l})},v={args:{selectedValue:k[0],options:k},render:n=>c.jsx(A,{...n})};var E,b,D;v.parameters={...v.parameters,docs:{...(E=v.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    selectedValue: sampleOptions[0],
    options: sampleOptions
  },
  render: args => <DefaultExample {...args} />
}`,...(D=(b=v.parameters)==null?void 0:b.docs)==null?void 0:D.source}}};const _=["Default"];export{v as Default,_ as __namedExportsOrder,N as default};
