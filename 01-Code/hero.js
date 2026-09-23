(function(){
  var story=document.getElementById('story'), nav=document.getElementById('nav'), hint=document.getElementById('hint');
  var veil=document.getElementById('veil'), copyEl=document.querySelector('.copy');
  var cam=document.getElementById('cam'), scene=document.getElementById('scene');
  var copies=[].slice.call(document.querySelectorAll('.stage-copy'));
  var dots=[].slice.call(document.querySelectorAll('.progress i'));
  var chips=[].slice.call(document.querySelectorAll('.chip'));
  var beans=[].slice.call(document.querySelectorAll('.bean'));
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var ease=function(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2};
  var easeOut=function(t){return 1-Math.pow(1-t,3)};
  var $=function(id){return document.getElementById(id)};
  var focus=0, fgEls=[].slice.call(document.querySelectorAll('.fg')), vig=$('vig'), keyEl=$('key'), paused=false;
  var CAM_D=[[0,1,50,50,50,50],[.1,1.02,49,49,50,50],[.3,1.08,40,40,46,45],[.46,1.08,40,40,46,45],[.58,1.05,50,54,50,52],[.78,1.3,48,56,50,55],[1,1.3,48,56,50,55]];
  var CAM_M=[[0,1,50,50,50,50],[.1,1.02,49,49,50,50],[.3,1.08,47,44,49,46],[.46,1.08,47,44,49,46],[.58,1.05,50,54,50,52],[.78,1.13,54,56,50,56],[1,1.13,54,56,50,56]];
  var fillPath=$('fillPath'), lid=$('lid'), glasses=$('glasses'), cup=$('cup'), cupShadow=$('cupShadow');
  var liqG=$('liqG'), levelR=$('levelR'), tint=$('tint'), streamA=$('streamA'), streamB=$('streamB'), dropA=$('dropA');
  var sgEnd=$('sgEnd'), scrState=$('scrState'), scrTime=$('scrTime'), scrBar=$('scrBar'), scrG=$('scrG'), rip=$('ripples');
  var steamEls=[].slice.call(document.querySelectorAll('#steam path'));
  var ripEls=[]; for(var r=0;r<3;r++){var el=document.createElementNS('http://www.w3.org/2000/svg','ellipse'); rip.appendChild(el); ripEls.push(el);}
  // beans raining into the hopper
  // a real pour: beans stream in from above the frame, bounce once on the pile and stay there;
  // the pile rises underneath them and slowly covers the older ones
  var NS='http://www.w3.org/2000/svg', falling=$('falling'), restG=$('resting'), pool=[], rest=[], restFree=[], nextClump=0;
  for(var i=0;i<120;i++){
    var u=document.createElementNS(NS,'use'); u.setAttribute('href',i%3?'#beanA':'#beanB'); u.style.display='none'; falling.appendChild(u);
    pool.push({el:u,on:false});
  }
  function surfaceY(x,L){var lvl=298-L*118, cxn=clamp((x-305)/115,-1,1); return lvl+7-(1-cxn*cxn)*(7+6*L)-4;}
  function spawnPour(t,n){
    for(var i=0,k=0;i<pool.length&&k<n;i++){
      var b=pool[i]; if(b.on) continue; k++;
      b.on=true; b.rev=false; b.x=BAG_X+(Math.random()-.5)*10; b.y=BAG_Y-4+Math.random()*6-k*2.5; b.vx=14+(Math.random()-.5)*44; b.vy=40+Math.random()*90;
      if(Math.random()<.1) b.vx=Math.random()<.5?-18-Math.random()*22:48+Math.random()*24; // the odd bean that slips off the side of the lip
      b.r=Math.random()*360; b.spin=(Math.random()<.5?-1:1)*(120+Math.random()*480); b.s=.66+Math.random()*.32; b.bounce=0; b.t0=t;
    }
  }
  function spawnClump(t,rev,lvlY){ // reverse only: beans leave the pile and fly back out when scrolling up
    var n=5+Math.floor(Math.random()*4), cx=292+Math.random()*28, vx0=(Math.random()-.5)*30;
    for(var i=0,k=0;i<pool.length&&k<n;i++){
      var b=pool[i]; if(b.on) continue; k++;
      b.on=true; b.rev=true; b.t0=t+Math.random()*.06; b.x0=cx+(Math.random()-.5)*26; b.y0=70+(Math.random()-.5)*22;
      b.vx=vx0+(Math.random()-.5)*46; b.r0=Math.random()*360; b.spin=(Math.random()<.5?-1:1)*(240+Math.random()*420); b.s=.82+Math.random()*.3;
      b.ys=lvlY+2; b.xs=b.x0+(Math.random()-.5)*60; b.up=Math.sqrt(2*1500*Math.max(40,b.ys-b.y0)); b.dur=b.up/1500;
    }
  }
  function rise(t,x,y,href,s,r){ // the fall played backwards: leaves the pile fast, slows as it climbs, exits above the frame
    for(var i=0;i<pool.length;i++){var b=pool[i]; if(b.on) continue;
      b.on=true; b.rev=true; b.t0=t; b.xs=x; b.ys=y; b.x1=BAG_X+(Math.random()-.5)*12; b.yTop=BAG_Y+Math.random()*6;
      b.up=Math.sqrt(2*2200*(b.ys-b.yTop)); b.dur=b.up/2200;
      b.r0=r; b.spin=(Math.random()<.5?-1:1)*(260+Math.random()*420); b.s=s;
      if(href) b.el.setAttribute('href',href); return true;}
    return false;
  }
  function settle(b){
    var el=restFree.pop();
    if(!el){el=document.createElementNS(NS,'use'); restG.appendChild(el);}
    el.setAttribute('href',b.el.getAttribute('href')); el.style.display='';
    el.setAttribute('transform','translate('+b.x.toFixed(1)+' '+b.y.toFixed(1)+') rotate('+b.r.toFixed(1)+') scale('+b.s.toFixed(2)+')');
    rest.push({el:el,x:b.x,y:b.y});
    if(rest.length>90){var o=rest.shift(); o.el.style.display='none'; restFree.push(o.el);}
  }
  var bagEl=$('bag'), BAG_OX=406, BAG_OY=142, BAG_X=(BAG_OX-63.2)/1.124, BAG_Y=(BAG_OY-62.6)/.787, shakeA=0;
  var cupA=0, cupDrawn=-1;
  var st={cupWant:0,bagIn:0,bagOut:0,p:0,L:0,cupIn:0,rainOn:0,prevL:0,fillT:-9,emptyT:-9};
  var pour={F:0,L:0,T:0,drainT:-9,fullAt:-1,Pprev:0}, pourDraw=0;
  var targetP=0,P=0,first=true,lastT=null,cur=-1,movedAt=0;
  var BUMPS=[5,8,4,7,9,5,8,6,4,9,7,5,8,6,9,4,7,8,5,6,9,7,5];
  var SX=661, SY0=610;
  // four stages on one scroll: beans in (0-.40), grind (.40-.62), pour (.62-1). The original timeline runs on p.
  var G={g:0,a:0,w:0,stg:0,prevA:0,fwdT:-9,revT:-9,jit:0};
  var GCAM_D=[1.18,58,44,53,48], GCAM_M=[1.2,56,44,50,52];
  var doseBlurF=$('doseBlurF'), doseEl=$('dose'), doseCup=$('doseCup'), doseSh=$('doseSh'), doseFull=$('doseFull'), moundE=$('moundE'), groundsG=$('grounds'), dustG=$('dust');
  function apply(P0){
    var p, g;
    // no grind stage on this machine: beans in, then the cup comes straight down and the shot pours
    if(P0<=.38){p=P0*(0.5/.38);} else {var u=(P0-.38)/.62; p=u<.12?.5+(u/.12)*.168:.668+(u-.12)/.88*.332;} g=0;
    G.g=g; G.a=clamp((g-.24)/.5,0,1);
    G.w=ease(clamp(g/.14,0,1))*(1-ease(clamp((g-.8)/.2,0,1)));
    G.stg=P0<.06?0:P0<.39?1:2;
    G.boil=ease(clamp((P0-.425)/.07,0,1));
    applyBase(p); applyGrind();
  }
  function applyGrind(){
    var g=G.g, on=g>0&&g<1;
    doseEl.style.display=on?'':'none'; if(!on) return;
    // lowered straight down from above like the cup, then lifted straight back up once it is full
    var sm=function(t){return t*t*t*(t*(t*6-15)+10)};
    var e=clamp(g/.26,0,1), ee=sm(e);
    var x=clamp((g-.74)/.14,0,1), up=sm(x);
    var dy=-560*(1-ee) - 620*up*up;
    doseCup.setAttribute('transform','translate(0 '+dy.toFixed(2)+')');
    doseCup.setAttribute('opacity',(Math.min(1,e*4)*(1-clamp((x-.4)/.6,0,1))).toFixed(3));
    doseCup.setAttribute('filter',''); doseBlurF.setAttribute('stdDeviation','0');
    doseSh.setAttribute('opacity',(Math.pow(sm(clamp((ee-.7)/.3,0,1)),2)*(1-clamp(x/.35,0,1))).toFixed(3));
    var a=G.a; doseFull.style.display=a>0?'':'none';
    moundE.setAttribute('rx',(4+33*Math.sqrt(a)).toFixed(2)); moundE.setAttribute('ry',(2+17.5*a).toFixed(2)); moundE.setAttribute('cy',(592-2.5*a).toFixed(2));
  }
  function applyBase(p){
    // hopper: lid lifts, beans pour in, lid closes
    var lidOpen=ease(clamp((p-.05)/.07,0,1))*(1-ease(clamp((p-.43)/.06,0,1)));
    lid.setAttribute('transform','translate(0,'+(-240*lidOpen).toFixed(1)+')'); lid.setAttribute('opacity',(1-clamp((lidOpen-.1)/.35,0,1)).toFixed(3));
    // Dalla bag: drops in while the lid lifts, pours for exactly the fill, rises away while the lid closes
    st.bagIn=ease(clamp((p-.06)/.06,0,1)); st.bagOut=ease(clamp((p-.425)/.06,0,1));
    var L=clamp((p-.12)/.3,0,1); st.L=L; st.Lv=L*(1-.25*pourDraw);
    
    var Lv=st.Lv, lvl=298-Lv*118, a=lvl+7, b=lvl-7-6*Lv;
    var dP='M190 320 L190 '+(lvl+7).toFixed(1);
    for(var q=0;q<BUMPS.length;q++){ // an uneven top made of bean-sized humps, heaped in the middle
      var x0=190+q*10, xm=x0+5, x1=x0+10, cxn=(xm-305)/115, mound=(1-cxn*cxn)*(7+6*Lv);
      var yb=lvl+7-mound, yt=yb-BUMPS[q];
      dP+=' L'+x0+' '+yb.toFixed(1)+' Q'+xm+' '+yt.toFixed(1)+' '+x1+' '+yb.toFixed(1);
    }
    fillPath.setAttribute('d',dP+' L420 320 Z');
    // the two glasses lift away
    var g=ease(clamp((p-.52)/.1,0,1));
    
    glasses.setAttribute('opacity',(1-g).toFixed(3));
    // camera: gentle push-in while filling, then a dolly down to the group head
    var z=ease(clamp((p-.52)/.22,0,1)), mob=innerWidth<900;
    var K=mob?CAM_M:CAM_D, i=0; while(i<K.length-2&&p>K[i+1][0]) i++;
    var a0=K[i], a1=K[i+1], u=ease(clamp((p-a0[0])/(a1[0]-a0[0]),0,1)), L2=function(j){return a0[j]+(a1[j]-a0[j])*u};
    var s=L2(1), fx=L2(2), fy=L2(3), gx=L2(4), gy=L2(5);
    if(G.w>0){var GC=mob?GCAM_M:GCAM_D, w=G.w; s+=(GC[0]-s)*w; fx+=(GC[1]-fx)*w; fy+=(GC[2]-fy)*w; gx+=(GC[3]-gx)*w; gy+=(GC[4]-gy)*w;}
    if(G.jit>0&&!reduce){gx+=(Math.random()-.5)*.09*G.jit; gy+=(Math.random()-.5)*.09*G.jit;}
    var ox=gx-(50+(fx-50)*s), oy=gy-(50+(fy-50)*s);
    var ze=1+(mob?.04:.12)*focus*clamp((p-.7)/.08,0,1);
    if(ze>1.0001){var Ax=50+ox+(60-50)*s, Ay=50+oy+(63-50)*s; ox=Ax*(1-ze)+ze*(50+ox)-50; oy=Ay*(1-ze)+ze*(50+oy)-50; s=s*ze;}
    cam.style.transformOrigin='50% 50%';
    cam.style.transform='translate(calc(-50% + '+ox.toFixed(3)+'%),calc(-50% + '+oy.toFixed(3)+'%)) scale('+s.toFixed(4)+')';
    var cw=cam.offsetWidth/100, fgIn=clamp((p-.04)/.1,0,1)*(reduce?0:1);
    fgEls.forEach(function(el,j){var k=[2.1,1.6,2.4][j]; el.style.opacity=(.92*fgIn).toFixed(3);
      el.style.transform='translate3d('+(ox*cw*k*.55).toFixed(1)+'px,'+(oy*cw*k*.55).toFixed(1)+'px,0) scale('+(1+(s-1)*1.6).toFixed(3)+') rotate('+(p*40*(j%2?-1:1)).toFixed(1)+'deg)';});
    vig.style.opacity=(.35+.55*clamp((p-.5)/.25,0,1)).toFixed(3);
    veil.style.opacity=0;
    // espresso cup rises into place
    // the cup lands in one motion on its own clock once its point in the scroll is reached (see loop)
    st.cupWant=p>=.668?1:0;
    beans.forEach(function(bn){
      var k=parseFloat(bn.dataset.depth);
      bn.style.transform='translate3d(0,'+(-p*140*k)+'px,0) rotate('+(p*90*k)+'deg)';
      bn.style.opacity=(1-z).toFixed(3);
    });
    st.p=p;
    var stg=G.stg;
    if(stg!==cur){
      cur=stg;
      copies.forEach(function(el,i){el.classList.toggle('on',i===stg)});
      dots.forEach(function(d,i){d.classList.toggle('on',i===stg)});
      chips.forEach(function(el,i){el.classList.toggle('on',stg===1&&i<=1)});
    }
  }
  function stream(el,x,yt,yb,w,t,ph){
    if(yb-yt<.5){el.setAttribute('d','');return;}
    var n=12,Lp=[],Rp=[];
    for(var i=0;i<=n;i++){
      var y=yt+(yb-yt)*i/n, d=y-SY0;
      var wid=w*(1.55-.7*Math.min(1,d/16))*(.92+.08*Math.sin(y*.5+t*11+ph));
      var cx=x+.55*Math.sin(y*.13+t*6+ph)*Math.min(1,d/10);
      Lp.push((cx-wid).toFixed(2)+' '+y.toFixed(2)); Rp.unshift((cx+wid).toFixed(2)+' '+y.toFixed(2));
    }
    el.setAttribute('d','M'+Lp.join(' L')+' L'+Rp.join(' L')+' Z');
  }
  function loop(ts){
    var t=ts/1000, dt=lastT===null?.016:Math.min(t-lastT,.05); lastT=t;
    var k=reduce?1:1-Math.exp(-dt*9);
    if(Math.abs(targetP-P)>.0003||first){P+=(targetP-P)*k; if(Math.abs(targetP-P)<.0003)P=targetP; apply(P); first=false; movedAt=t; if(cam.style.willChange!=='transform') cam.style.willChange='transform';}
    else if(t-movedAt>.2&&cam.style.willChange!=='auto') cam.style.willChange='auto';
    // beans: spawn clumps while the hopper is filling, let gravity do the rest
    var lvlY=298-st.L*118;
    if(st.L>st.prevL+1e-5) st.fillT=t; else if(st.L<st.prevL-1e-5) st.emptyT=t;
    st.prevL=st.L;
    var filling=t-st.fillT<.35&&st.L<1, emptying=t-st.emptyT<.35&&st.L>0;
    // cup: comes down and sits in ~0.4 s in one go (no half-way stop tied to the scroll), its shadow lands with it
    if(reduce) cupA=st.cupWant; else cupA=clamp(cupA+(st.cupWant?1:-1)*dt/.42,0,1);
    if(cupA!==cupDrawn){cupDrawn=cupA; var ce=easeOut(cupA);
      cup.setAttribute('transform','translate(0,'+(-60*(1-ce)).toFixed(1)+')');
      cup.setAttribute('opacity',clamp(cupA*2.2,0,1).toFixed(3));
      cupShadow.setAttribute('opacity',ce.toFixed(3));}
    st.cupIn=cupA;
    var bi=st.bagIn, bo=st.bagOut, bvis=bi>0&&bo<1;
    bagEl.style.display=bvis?'':'none';
    if(bvis){
      shakeA+=(((filling||emptying)&&!reduce?1:0)-shakeA)*Math.min(1,dt*8);
      var bx=BAG_OX-70*(1-bi)-50*bo, by=BAG_OY-400*(1-bi)-420*bo;
      var br=-8-14*(1-bi)-10*bo+(reduce?0:.5*Math.sin(t*1.4))+shakeA*(.8*Math.sin(t*21)+.45*Math.sin(t*34));
      bagEl.setAttribute('transform','translate('+bx.toFixed(2)+' '+by.toFixed(2)+') rotate('+br.toFixed(2)+')');
      bagEl.setAttribute('opacity',(clamp(bi*2.5,0,1)*clamp((1-bo)*2.5,0,1)).toFixed(3));
    }
    if(!reduce&&t>=nextClump){
      if(filling){var rate=.3+.7*Math.min(1,st.L/.1)*Math.min(1,(1-st.L)/.1), surge=.8+.2*Math.sin(t*5.3)+.12*Math.sin(t*11.7); spawnPour(t,1+Math.floor(Math.random()*3*rate*surge)); nextClump=t+(.04+Math.random()*.05)/rate;}
      else if(emptying){var nn=2+Math.floor(Math.random()*3); for(var q=0;q<nn;q++){var rx=292+Math.random()*28; rise(t,rx,surfaceY(rx,st.Lv)+2,null,.72+Math.random()*.22,Math.random()*360);} nextClump=t+.06+Math.random()*.06;}
    }
    // resting beans: covered as the pile rises, cleared when it drops
    for(var ri=rest.length-1;ri>=0;ri--){var rb=rest[ri], sy=surfaceY(rb.x,st.Lv);
      if(sy<rb.y-7){rb.el.style.display='none'; restFree.push(rb.el); rest.splice(ri,1);}
      else if(sy>rb.y+5&&G.a>0){rb.el.style.display='none'; restFree.push(rb.el); rest.splice(ri,1);}
      else if(sy>rb.y+5){var tr=(rb.el.getAttribute('transform')||'').match(/rotate\(([-\d.]+)\) scale\(([\d.]+)\)/);
        rise(t,rb.x,rb.y,rb.el.getAttribute('href'),tr?+tr[2]:.8,tr?+tr[1]:0); rb.el.style.display='none'; restFree.push(rb.el); rest.splice(ri,1);} }
    pool.forEach(function(b){
      if(!b.on) return;
      if(b.rev){
        var tt=t-b.t0; if(tt>b.dur){b.on=false;b.el.style.display='none';return;}
        var k=tt/b.dur, x=b.xs+(b.x1-b.xs)*(1-Math.pow(1-k,2)), y=b.ys-b.up*tt+.5*2200*tt*tt;
        b.el.style.opacity=1; b.el.style.display='';
        b.el.setAttribute('transform','translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+(b.r0+b.spin*tt).toFixed(1)+') scale('+b.s.toFixed(2)+')');
        return;
      }
      b.vy+=2200*dt; b.x+=b.vx*dt; b.y+=b.vy*dt; b.r+=b.spin*dt;
      var gx=b.y>172?clamp(b.x,212,398):b.x; if(gx!==b.x){b.x=gx; b.vx*=-.3;}
      var sy=surfaceY(b.x,st.Lv);
      if(b.y>=sy){
        b.y=sy;
        if(b.bounce<1&&b.vy>300){b.vy*=-(.18+Math.random()*.14); b.vx=b.vx*.4+(Math.random()-.5)*110; b.spin*=.4; b.bounce++;}
        else if(b.bounce<2&&b.vy>200){b.vy*=-.12; b.vx*=.5; b.spin*=.5; b.bounce++;}
        else {settle(b); b.on=false; b.el.style.display='none'; return;}
      }
      if(t-b.t0>3){b.on=false;b.el.style.display='none';return;}
      b.el.style.opacity=1; b.el.style.display='';
      b.el.setAttribute('transform','translate('+b.x.toFixed(1)+' '+b.y.toFixed(1)+') rotate('+b.r.toFixed(1)+') scale('+b.s.toFixed(2)+')');
    });
    // pour: fills on its own clock going forward; scrolling back up drains it back into the spout
    var goingUp=P<pour.Pprev-.00004; pour.Pprev=P;
    var seated=st.cupIn>=1;
    if(st.p<.72){pour.F=0;pour.L=0;pour.T=0;pour.fullAt=-1;}
    if(goingUp&&st.p<.8){
      var cap=clamp((st.p-.72)/.075,0,1);
      if(pour.F>cap+1e-4){pour.F=cap;pour.drainT=t;pour.T=0;pour.fullAt=-1;}
    }
    var draining=t-pour.drainT<.25;
    if(reduce){pour.F=seated?1:0;pour.L=0;}
    else if(seated&&!draining&&pour.F<1){
      pour.L=Math.min(1,pour.L+dt/.3);
      if(pour.L>=1) pour.F=Math.min(1,pour.F+dt/1.8);
      pour.T=0;
    } else if(draining&&pour.F>0){ pour.L=1; }
    else if(pour.F<=0){ pour.L=Math.max(0,pour.L-dt/.3); }
    if(pour.F>=1&&!reduce){ if(pour.fullAt<0) pour.fullAt=t; pour.T=Math.min(1,pour.T+dt/.35); }
    if(Math.abs(pour.F-pourDraw)>.01){pourDraw=pour.F; apply(P);}
    var f=pour.F<.5?2*pour.F*pour.F:1-Math.pow(-2*pour.F+2,2)/2;
    var sinceFull=pour.fullAt<0?-1:t-pour.fullAt;
    keyEl.style.opacity=(seated?(.25+.75*f):0).toFixed(3);
    var ft=(!reduce&&seated&&(pour.L>0||pour.F>0)&&(sinceFull<0||sinceFull<1.6)&&!draining)?1:0; var nf=focus+(ft-focus)*Math.min(1,dt*(ft?0.9:0.7)); if(Math.abs(nf-focus)>.0004){focus=nf; apply(P);}
    // the espresso rises inside the photographed cup
    // the real crema rises inside the photographed cup: the surface starts deep and small, climbs to the rim
    var gS=645.7+(1-f)*14, cS=.8+.2*f;
    $('crem').setAttribute('transform','translate(612 '+gS.toFixed(2)+') scale('+cS.toFixed(4)+') translate(-612 -645.7)');
    liqG.style.opacity=f>.005?1:0;
    tint.setAttribute('opacity',(.75*(1-clamp(f/.8,0,1))).toFixed(3));
    tint.setAttribute('cy',(gS+2).toFixed(2));
    var surf=Math.min(660,(727.75+(gS-727.75)*0.86-229.42)/.66), Lr=pour.L, tail=pour.T, flowing=Lr>0&&tail<1;
    sgEnd.setAttribute('stop-color',f<.6?'#8a4d1c':'#b67a3e');
    if(!flowing){streamA.setAttribute('d','');streamB.setAttribute('d','');}
    else{
      var yb=SY0+(surf-SY0)*Lr, yt=SY0+(surf-SY0)*tail, w=1.6*(1-tail*.35)*(draining?.85:1);
      stream(streamA,SX-33,yt,yb,w,t,0); stream(streamB,SX+33,yt,yb,w,t,1.7);
    }
    var dOn=0,dy=0;
    if(sinceFull>.6&&sinceFull<1.1){var kk=(sinceFull-.6)/.5;dOn=1;dy=SY0+2+(surf-SY0)*kk*kk;}
    dropA.setAttribute('cx',SX-33);dropA.setAttribute('cy',dy);dropA.setAttribute('opacity',dOn);
    var rpl=(Lr>=1&&tail<1&&f>.05)?1:0;
    ripEls.forEach(function(el,i){
      var u=((t*1.2)+(draining?-i/3:i/3)+3)%1, uu=draining?1-u:u, rr=1.5+uu*14;
      el.setAttribute('cx',614);el.setAttribute('cy',(gS-1).toFixed(2));el.setAttribute('rx',(rr*.62).toFixed(2));el.setAttribute('ry',(rr*.62*.2).toFixed(2));
      el.setAttribute('opacity',((1-uu)*.55*rpl).toFixed(3));
    });
    // the machine's touch screen: timer, progress and yield follow the cup both ways
    var secs=pour.F*27;
    scrTime.textContent='0:'+(secs<10?'0':'')+Math.floor(secs);
    scrBar.setAttribute('width',(114*pour.F).toFixed(1));
    scrG.textContent=Math.round(pour.F*36)+' g';
    scrState.textContent=pour.F>=1?'Done':(pour.F>0||(seated&&pour.L>0)?'Brewing':'Ready');
    var sOn=reduce?0:(sinceFull<0?0:clamp((sinceFull-1)/1.5,0,1));
    steamEls.forEach(function(el,i){
      var u=((t*.26)+i/3)%1, x0=643+i*15, sw=Math.sin(t*1.3+i*2.1), y0=658-u*26;
      el.setAttribute('d','M'+x0+' '+y0+' C'+(x0+8*sw)+' '+(y0-28)+' '+(x0-10*sw)+' '+(y0-58)+' '+(x0+6*Math.sin(t*.9+i))+' '+(y0-92));
      el.setAttribute('opacity',(Math.sin(Math.PI*u)*.55*sOn).toFixed(3));
    });
    grind(t,dt);
    // gauges: needles glide with a little inertia and tremble while under pressure
    var pT=(seated&&pour.L>0&&pour.F<1&&!draining)?1:(draining&&pour.F>0?.6:0);
    gz.p+=(pT-gz.p)*Math.min(1,dt*(pT>gz.p?3.2:2.2)); gz.b+=((G.boil||0)-gz.b)*Math.min(1,dt*2.6);
    var trP=reduce?0:gz.p*(Math.sin(t*27)*.9+Math.sin(t*41)*.5), trB=reduce?0:(G.jit?Math.sin(t*33)*.8:0);
    needleB.setAttribute('transform','rotate('+(225+118*gz.b+trB).toFixed(2)+' 729.6 377)');
    needleP.setAttribute('transform','rotate('+(225+152*gz.p+trP).toFixed(2)+' 778.5 541.2)');
    requestAnimationFrame(loop);
  }
  // fresh grounds: a fluffy, clumpy column from the burr chute into the dosing cup (played backwards on the way up)
  var GP=[], DP=[], GCOL=['#2b170b','#3a2212','#4a2c17','#24130a','#57351d'];
  for(var gi=0;gi<170;gi++){var ce=document.createElementNS(NS,'circle'); ce.style.display='none'; groundsG.appendChild(ce); GP.push({el:ce,on:false});}
  for(var di=0;di<26;di++){var de=document.createElementNS(NS,'circle'); de.style.display='none'; de.setAttribute('fill','#8d6c50'); dustG.appendChild(de); DP.push({el:de,on:false});}
  function landY(x){return 592.5-15.5*G.a+Math.abs(x-340)*.42;}
  function spawnG(rev){for(var i=0;i<GP.length;i++){var q=GP[i]; if(q.on) continue; q.on=true; q.rev=rev;
      var clump=Math.random()<.1; q.r=clump?1+Math.random()*.55:.32+Math.random()*.5;
      if(rev){q.x=340+(Math.random()-.5)*9; q.y=landY(q.x)-1; q.vy=-(55+Math.random()*40); q.vx=(340-q.x)*1.5;}
      else {q.x=340+(Math.random()-.5)*5.5; q.y=571.5+Math.random()*1.5; q.vy=16+Math.random()*26; q.vx=(Math.random()-.5)*7;}
      q.el.setAttribute('r',q.r.toFixed(2)); q.el.setAttribute('fill',GCOL[(Math.random()*GCOL.length)|0]); q.el.style.display=''; return;}}
  function spawnD(){for(var i=0;i<DP.length;i++){var q=DP[i]; if(q.on) continue; q.on=true; q.t=0; q.life=.5+Math.random()*.5;
      q.x=340+(Math.random()-.5)*10; q.y=574+Math.random()*10; q.vx=(Math.random()-.5)*14; q.vy=-3+Math.random()*8; q.r=.9+Math.random()*1.3;
      q.el.setAttribute('r',q.r.toFixed(2)); q.el.style.display=''; return;}}
  var gz={b:0,p:0}, needleB=$('needleB'), needleP=$('needleP');
  function grind(t,dt){
    var a=G.a; if(a>G.prevA+1e-5) G.fwdT=t; else if(a<G.prevA-1e-5) G.revT=t; G.prevA=a;
    var fwd=t-G.fwdT<.22&&a<1&&G.g<.84, rev=t-G.revT<.22&&a>0;
    G.jit=(fwd||rev)?1:0;
    if(!reduce){
      var n=0; for(var k=0;k<n;k++) spawnG(rev&&!fwd);
      
    }
    GP.forEach(function(q){ if(!q.on) return;
      if(q.rev){q.vy+=140*dt; q.y+=q.vy*dt; q.x+=q.vx*dt; if(q.y<572||q.vy>0){q.on=false;q.el.style.display='none';return;}}
      else {q.vy+=420*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; if(q.y>=landY(q.x)){q.on=false;q.el.style.display='none';return;}}
      q.el.setAttribute('cx',q.x.toFixed(2)); q.el.setAttribute('cy',q.y.toFixed(2));
    });
    DP.forEach(function(q){ if(!q.on) return; q.t+=dt; if(q.t>q.life){q.on=false;q.el.style.display='none';return;}
      q.x+=q.vx*dt; q.y+=q.vy*dt; q.vx*=.97;
      q.el.setAttribute('cx',q.x.toFixed(2)); q.el.setAttribute('cy',q.y.toFixed(2)); q.el.setAttribute('opacity',(.2*Math.sin(Math.PI*q.t/q.life)).toFixed(3));
    });
    if(G.g>0&&G.g<1&&pour.F<=0&&pour.L<=0){
      scrState.textContent=a>=1?'Ground':(a>0?'Grinding':'Ready');
      scrG.textContent=(18*a).toFixed(1).replace('.0','')+' g'; scrBar.setAttribute('width',(114*a).toFixed(1)); scrTime.textContent='0:00';
    }
  }
  // autoplay: glide from stage to stage with a short pause; the pour stage waits for the cup to fill
  var END=.86, STOPS=[0,.38,END], MOVE=[0,3000,3400], PAUSES=[0,1700,600];
  var auto={on:false,armed:false,touched:false,done:false,timer:null,anim:null,idle:null};
  function resume(){ if(auto.done) return; auto.on=true; queue();}
  function storyY(p){var r=story.getBoundingClientRect();return scrollY+r.top+(p/END)*(story.offsetHeight-innerHeight);}
  function nextStop(){for(var i=0;i<STOPS.length;i++){if(STOPS[i]>targetP+.008)return i;}return -1;}
  function markNext(i,ms){dots.forEach(function(d,j){d.classList.remove('next');d.style.removeProperty('--wait');});
    if(i>0&&dots[i]){dots[i].style.setProperty('--wait',ms+'ms'); void dots[i].offsetWidth; dots[i].classList.add('next');}}
  function glide(i){
    var y0=scrollY, y1=storyY(STOPS[i]), dur=MOVE[i], t0=null;
    markNext(-1);
    function step(ts){
      if(!auto.on) return;
      if(t0===null) t0=ts;
      var k=clamp((ts-t0)/dur,0,1), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      window.scrollTo(0,y0+(y1-y0)*e);
      if(k<1) auto.anim=requestAnimationFrame(step); else {auto.anim=null; queue();}
    }
    auto.anim=requestAnimationFrame(step);
  }
  function queue(){
    clearTimeout(auto.timer);
    if(!auto.on) return;
    var r=story.getBoundingClientRect(); if(r.bottom<innerHeight*.5) return;
    var i=nextStop(); if(i<0) return;
    markNext(i,PAUSES[i]);
    auto.timer=setTimeout(function(){glide(i);},PAUSES[i]);
  }
  function userTook(){
    if(reduce) return;
    auto.touched=true;
    auto.on=false; clearTimeout(auto.timer); cancelAnimationFrame(auto.anim); auto.anim=null; markNext(-1);
    clearTimeout(auto.idle);
    if(auto.armed) auto.idle=setTimeout(function(){if(!paused) resume();},4000);
  }
  ['wheel','touchstart','pointerdown','keydown'].forEach(function(ev){addEventListener(ev,userTook,{passive:true});});
  var ticking=false;
  function frame(){
    ticking=false;
    var r=story.getBoundingClientRect(), total=story.offsetHeight-innerHeight;
    targetP=clamp(-r.top/total,0,1)*END;
    if(!reduce&&!auto.done&&!auto.armed&&auto.touched&&targetP>.004){auto.armed=true; clearTimeout(auto.idle); auto.idle=setTimeout(resume,900);}
    nav.classList.toggle('solid', scrollY>20); nav.classList.toggle('over-hero', r.bottom>80 && document.querySelector('main[data-page="home"]') && !document.querySelector('main[data-page="home"]').hidden);
    hint.style.opacity=targetP>0.03?0:1;
  }
  function placeVeil(){
    var pr=veil.getBoundingClientRect(), c=copyEl.getBoundingClientRect(), d=scene.getBoundingClientRect();
    veil.style.setProperty('--vx',Math.round(Math.min(c.right+16,d.left+20)-pr.left)+'px');
    veil.style.setProperty('--vy',Math.round(c.bottom-8-pr.top)+'px');
  }
  function req(){ if(!ticking){ticking=true;requestAnimationFrame(frame);} }
  addEventListener('scroll',req,{passive:true}); addEventListener('resize',function(){first=true;placeVeil();req();}); placeVeil();
  frame(); P=targetP; apply(P); requestAnimationFrame(loop);


  // anatomy
  var items=[].slice.call(document.querySelectorAll('.parts li')), pts=[].slice.call(document.querySelectorAll('.pt'));
  function pick(n){
    items.forEach(function(li,i){li.classList.toggle('on',i===n); li.querySelector('button').setAttribute('aria-expanded',i===n)});
    pts.forEach(function(b,i){b.classList.toggle('on',i===n)});
  }
  document.querySelectorAll('[data-part]').forEach(function(b){b.addEventListener('click',function(){pick(+b.dataset.part)})});

  // one-time reveals
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
  } else document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')});
})();
