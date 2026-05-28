const a=new Intl.NumberFormat([],{style:"percent",minimumFractionDigits:2}),n=(e,r=!1)=>{let t=e||0;return r||(t=t/100),a.format(t)};export{n as f};
