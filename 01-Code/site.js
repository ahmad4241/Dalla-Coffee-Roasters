(function(){
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var IMG={}; $$('#assets img').forEach(function(i){IMG[i.dataset.k]=i.getAttribute('src');});
  var money=function(n){return 'IQD '+n.toLocaleString('en-US');};
  function label(p){return p.lbl?'<span class="lbl" style="--lc:'+p.lbl.c+'"><b>Dalla</b><hr><em>'+p.lbl.n+'</em><small>'+p.lbl.s+'</small></span>':'';}
  var PRODUCTS=[
    {id:'house-blend',cat:'Coffee',name:'House Blend',price:18000,img:'bag-terracotta',lbl:{n:'House Blend',s:'250 G · MEDIUM',c:'#5b2f1c'},
     short:'Chocolate, caramel and toasted nuts. Made for milk drinks.',desc:'Our everyday blend of Brazilian and Colombian beans, roasted medium so it stays sweet in a latte and smooth on its own. The coffee we pour at the bar.',
     specs:[['Origin','Brazil, Colombia'],['Roast','Medium'],['Notes','Milk chocolate, caramel, hazelnut'],['Weight','250 g, whole bean or ground'],['Best for','Latte, cappuccino, Spanish latte']]},
    {id:'dark-roast',cat:'Coffee',name:'Dark Roast',price:18000,img:'bag-brown',lbl:{n:'Dark Roast',s:'250 G · DARK',c:'#3b1f12'},
     short:'Bold and heavy, with cocoa and a long finish.',desc:'For people who like their coffee strong. Roasted a little longer for body and low acidity: dark cocoa, molasses and a finish that stays.',
     specs:[['Origin','Brazil, India'],['Roast','Dark'],['Notes','Dark cocoa, molasses, roasted almond'],['Weight','250 g, whole bean or ground'],['Best for','Espresso, Turkish coffee, moka pot']]},
    {id:'ethiopia',cat:'Coffee',name:'Ethiopia Guji',price:24000,img:'bag-green',lbl:{n:'Ethiopia Guji',s:'250 G · LIGHT',c:'#2f3a22'},
     short:'Single origin. Bright, floral and fruity.',desc:'A washed coffee from smallholders in the Guji zone, roasted light to keep the fruit. Blueberry, jasmine and a clean, tea-like finish. Best as a straight shot or a V60.',
     specs:[['Origin','Guji, Ethiopia'],['Process','Washed'],['Roast','Light'],['Notes','Blueberry, jasmine, black tea'],['Weight','250 g, whole bean or ground']]},
    {id:'cold-brew',cat:'Drinks to go',name:'Cold Brew Bottle',price:6000,img:'cold-brew',
     short:'Steeped for 18 hours. 250 ml, ready to pour over ice.',desc:'House Blend steeped cold for 18 hours, then filtered twice. Smooth, low in acidity and naturally sweet. Keep it in the fridge and drink it within five days.',
     specs:[['Size','250 ml glass bottle'],['Coffee','House Blend'],['Steep','18 hours, cold'],['Keeps','5 days in the fridge']]}
  ];
  var CLUB={id:'roast-club',cat:'Subscription',name:'Roast Club',price:32000,img:'bag-terracotta',lbl:{n:'Roast Club',s:'EVERY 2 WEEKS',c:'#5b2f1c'},short:'Two bags of fresh coffee every two weeks.',desc:'Two 250 g bags from that week\'s roast, delivered every two weeks. We rotate between House Blend, Dark Roast and a single origin, or you can fix your favourite. Skip, pause or cancel any time.',specs:[['In each delivery','2 × 250 g bags'],['Frequency','Every week, 2 weeks or month'],['Coffee','Rotating or your choice'],['Delivery','Free in Karbala'],['Commitment','None, cancel any time']]};
  var byId={}; PRODUCTS.concat([CLUB]).forEach(function(p){byId[p.id]=p;});
  function art(p){return '<img src="'+IMG[p.img]+'" alt="'+p.name+'" loading="lazy">'+label(p);}
  function card(p){
    return '<article class="card" data-cat="'+p.cat+'"><a class="art photo" href="#/product/'+p.id+'" aria-label="'+p.name+'">'+art(p)+'</a><div class="body"><p class="cat">'+p.cat+'</p><h3><a href="#/product/'+p.id+'">'+p.name+'</a></h3><p>'+p.short+'</p><div class="row"><span class="price">'+money(p.price)+'</span><button class="btn btn-dark" data-add="'+p.id+'">Add to cart</button></div></div></article>';
  }
  $('#grid').innerHTML=PRODUCTS.concat([CLUB]).map(card).join('');
  $('#homeCoffees').innerHTML=PRODUCTS.slice(0,3).map(card).join('');
  $$('.filters button').forEach(function(b){b.addEventListener('click',function(){
    $$('.filters button').forEach(function(x){x.setAttribute('aria-pressed',x===b);});
    var c=b.dataset.f; $$('#grid .card').forEach(function(el){el.hidden=!(c==='All'||el.dataset.cat===c);});
  });});

  // ---------- menu ----------
  var DRINKS=[
    {k:'espresso',n:'Espresso',p:3000,d:'A double shot of House Blend, thick crema.'},
    {k:'cappuccino',n:'Cappuccino',p:5000,d:'Espresso, steamed milk and deep foam, a little cocoa on top.'},
    {k:'latte',n:'Latte',p:5000,d:'A double shot with silky steamed milk.'},
    {k:'latte-macchiato',n:'Latte Macchiato',p:5500,d:'Warm milk first, espresso poured through it.'},
    {k:'iced-latte',n:'Iced Latte',p:5500,d:'Espresso over cold milk and ice.'},
    {k:'cold-brew',n:'Cold Brew',p:6000,d:'Steeped for 18 hours, served over one big ice cube.'}
  ];
  $('#menuGrid').innerHTML=DRINKS.map(function(x){return '<article class="drink"><div class="ph"><img src="'+IMG[x.k]+'" alt="'+x.n+'" loading="lazy"></div><div class="body"><div class="top"><h3>'+x.n+'</h3><span class="price">'+money(x.p)+'</span></div><p>'+x.d+'</p></div></article>';}).join('');
  $('#homeMenu').innerHTML=DRINKS.filter(function(x){return ['cappuccino','iced-latte','cold-brew'].indexOf(x.k)>-1;}).map(function(x){return '<article class="drink"><div class="ph"><img src="'+IMG[x.k]+'" alt="'+x.n+'" loading="lazy"></div><div class="body"><div class="top"><h3>'+x.n+'</h3><span class="price">'+money(x.p)+'</span></div><p>'+x.d+'</p></div></article>';}).join('');

  // ---------- Roast Club ----------
  var plan=14;
  $$('.plans button').forEach(function(b){b.addEventListener('click',function(){
    $$('.plans button').forEach(function(x){x.setAttribute('aria-pressed',x===b);}); plan=+b.dataset.d;
    CLUB.price=plan===14?32000:plan===7?60000:17000; CLUB.lbl.s=plan===14?'EVERY 2 WEEKS':plan===7?'EVERY WEEK':'EVERY MONTH';
    CLUB.short=plan===7?'Two bags of fresh coffee every week.':plan===14?'Two bags of fresh coffee every two weeks.':'One bag of fresh coffee every month.';
    $('#clubPrice').innerHTML=money(CLUB.price)+' <small>per delivery, free delivery in Karbala</small>';
  });});
  $$('#club .trio > div').forEach(function(el,i){var p=PRODUCTS[i]; el.innerHTML='<div class="sq"><img src="'+IMG[p.img]+'" alt="" loading="lazy">'+label(p)+'</div>';});

  // ---------- product page ----------
  var qty=1, ICON={
    truck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
    leaf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/></svg>',
    grind:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/></svg>'};
  function renderProduct(id){
    var p=byId[id]||PRODUCTS[0]; qty=1;
    var rel=PRODUCTS.filter(function(x){return x.id!==p.id;}).slice(0,3);
    var grind=p.cat==='Coffee'?'<div class="field" style="margin-bottom:18px;max-width:320px"><label for="grindSel">Grind</label><select id="grindSel"><option>Whole bean</option><option>Espresso</option><option>Turkish / Arabic</option><option>V60 and filter</option><option>French press</option></select></div>':'';
    $('#pview').innerHTML='<p class="crumb"><a href="#/shop">Shop</a> / '+p.cat+'</p><div class="product"><div class="p-art photo">'+art(p)+'</div><div class="p-info"><p class="kicker">'+p.cat+'</p><h1>'+p.name+'</h1><p class="p-price">'+money(p.price)+'</p><p class="p-desc">'+p.desc+'</p>'+grind+
      '<div class="buy"><div class="qty"><button type="button" data-q="-1" aria-label="Fewer">−</button><output id="q">1</output><button type="button" data-q="1" aria-label="More">+</button></div><button class="btn btn-dark" data-add="'+p.id+'" data-useqty>Add to cart</button><span class="added" id="added">Added to your cart</span></div>'+
      '<ul class="perks"><li>'+ICON.leaf+'Roasted every Tuesday, shipped within 48 hours</li><li>'+ICON.grind+'Whole bean or ground to order, free</li><li>'+ICON.truck+'Free delivery in Karbala on orders over IQD 40,000</li></ul>'+
      '<h2 class="p-sub">Details</h2><dl class="specs">'+p.specs.map(function(s){return '<div><dt>'+s[0]+'</dt><dd>'+s[1]+'</dd></div>';}).join('')+'</dl></div></div>'+
      '<section class="related"><h2>You might also like</h2><div class="grid">'+rel.map(card).join('')+'</div></section>';
    $$('#pview [data-q]').forEach(function(b){b.addEventListener('click',function(){qty=Math.max(1,Math.min(9,qty+ +b.dataset.q)); $('#q').textContent=qty;});});
    document.title=p.name+' — Dalla Coffee Roasters';
  }

  // ---------- cart ----------
  var cart={};
  try{cart=JSON.parse(localStorage.getItem('dalla-cart')||'{}')||{};}catch(e){cart={};}
  function save(){try{localStorage.setItem('dalla-cart',JSON.stringify(cart));}catch(e){}}
  function count(){var n=0;for(var k in cart)n+=cart[k];return n;}
  function renderCart(){
    var n=count(), c=$('#cartCount'); c.textContent=n; c.dataset.empty=n?0:1;
    $('#cartBtn').setAttribute('aria-label','Open cart, '+n+' item'+(n===1?'':'s'));
    var ids=Object.keys(cart).filter(function(k){return byId[k]&&cart[k]>0;}), sum=0;
    $('#lines').innerHTML=ids.length?ids.map(function(k){var p=byId[k]; sum+=p.price*cart[k];
      return '<div class="line"><div class="thumb"><img src="'+IMG[p.img]+'" alt=""></div><div><strong>'+p.name+'</strong><small>'+money(p.price)+'</small><br><button class="rm" data-rm="'+k+'">Remove</button></div><div class="qty"><button data-dq="-1" data-id="'+k+'" aria-label="Fewer">−</button><output>'+cart[k]+'</output><button data-dq="1" data-id="'+k+'" aria-label="More">+</button></div></div>';}).join(''):'<p class="empty">Your cart is empty. Start with a bag of House Blend.</p>';
    $('#sum').textContent=money(sum); $('#checkout').disabled=!ids.length;
  }
  function add(id,n){cart[id]=(cart[id]||0)+n; save(); renderCart();}
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-add]');
    if(a){ var n=a.hasAttribute('data-useqty')?qty:1; add(a.dataset.add,n);
      var ok=$('#added'); if(a.hasAttribute('data-useqty')&&ok){ok.classList.add('on');clearTimeout(ok._t);ok._t=setTimeout(function(){ok.classList.remove('on');},2200);} else openCart(); return; }
    var d=e.target.closest('[data-dq]'); if(d){var id=d.dataset.id; cart[id]=Math.max(0,(cart[id]||0)+ +d.dataset.dq); if(!cart[id])delete cart[id]; save(); renderCart(); return;}
    var r=e.target.closest('[data-rm]'); if(r){delete cart[r.dataset.rm]; save(); renderCart();}
  });
  var lastFocus=null;
  function openCart(){lastFocus=document.activeElement; $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); $('#drawer').setAttribute('aria-hidden','false'); $('#closeCart').focus();}
  function closeCart(){$('#drawer').classList.remove('on'); $('#scrim').classList.remove('on'); $('#drawer').setAttribute('aria-hidden','true'); $('#demoMsg').classList.remove('on'); if(lastFocus)lastFocus.focus();}
  $('#cartBtn').addEventListener('click',openCart); $('#closeCart').addEventListener('click',closeCart); $('#scrim').addEventListener('click',closeCart);
  addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#drawer').classList.contains('on'))closeCart();});
  $('#checkout').addEventListener('click',function(){$('#demoMsg').classList.add('on');});
  renderCart();

  // ---------- mobile menu ----------
  var burger=$('#burger'), mnav=$('#mnav');
  function menu(open){burger.setAttribute('aria-expanded',open); mnav.hidden=!open;}
  burger.addEventListener('click',function(){menu(burger.getAttribute('aria-expanded')!=='true');});

  // ---------- router ----------
  var pages=$$('main[data-page]'), current='home';
  var TITLES={home:'Dalla Coffee Roasters',shop:'Shop coffee — Dalla',menu:'Menu — Dalla',about:'Our story — Dalla',contact:'Visit us — Dalla'};
  function show(name){
    pages.forEach(function(m){m.hidden=m.dataset.page!==name;});
    $$('[data-route]').forEach(function(a){ if(a.dataset.route===(name==='product'?'shop':name)) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');});
    current=name; if(TITLES[name]) document.title=TITLES[name];
  }
  function route(){
    var h=location.hash||'#/'; menu(false);
    if(h.indexOf('#/')!==0){ if(current!=='home'){show('home'); var t=document.getElementById(h.slice(1)); if(t) setTimeout(function(){t.scrollIntoView();},30);} return; }
    var parts=h.slice(2).split('/'), name=parts[0]||'home';
    if(name==='product'){ renderProduct(parts[1]); show('product'); }
    else if(TITLES[name]) show(name); else show('home');
    window.scrollTo(0,0);
    var m=$('main[data-page="'+current+'"]'); if(m&&name!=='home'){var h1=m.querySelector('h1'); if(h1){h1.setAttribute('tabindex','-1'); h1.focus({preventScroll:true});}}
  }
  addEventListener('hashchange',route); route();

  // ---------- forms (preview: nothing is sent) ----------
  var form=$('#contactForm');
  form.addEventListener('submit',function(e){
    e.preventDefault(); var ok=true;
    $$('.field',form).forEach(function(f){var i=f.querySelector('input,textarea'); if(!i||!i.required)return;
      var bad=!i.value.trim()||(i.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value));
      f.classList.toggle('bad',bad); var er=f.querySelector('.err'); if(er) er.textContent=bad?(i.type==='email'?'Enter an email address like name@example.com.':'This field is required.'):'';
      if(bad&&ok){ok=false;i.focus();}});
    if(!ok) return; $('#sent').classList.add('on'); form.reset();
  });
  $('#newsForm').addEventListener('submit',function(e){e.preventDefault(); var i=$('#newsEmail');
    $('#newsOk').textContent=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value)?'Thanks. Your first email arrives on Tuesday, roast day.':'Enter an email address like name@example.com.';});
  $('#year').textContent=new Date().getFullYear();
})();
