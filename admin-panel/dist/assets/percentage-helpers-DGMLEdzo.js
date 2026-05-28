const a=new Intl.NumberFormat([],{style:"percent",minimumFractionDigits:2,maximumFractionDigits:4}),m=(e,r=!1)=>{let t=e||0;return r||(t=t/100),a.format(t)};export{m as f};
