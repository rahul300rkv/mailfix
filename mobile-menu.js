/* MailFix shared mobile drawer. Keep menu content here so every page stays identical. */
(function(){
  function init(){
    var nav=document.querySelector('nav[aria-label="Primary"], nav');
    if(!nav)return;
    var navInner=nav.querySelector('.nav-inner')||nav;
    var toggle=document.getElementById('mobileMenuBtn')||document.querySelector('.mobile-toggle');
    if(!toggle){
      toggle=document.createElement('button');toggle.type='button';toggle.id='mobileMenuBtn';toggle.className='mobile-menu-toggle';
      toggle.setAttribute('aria-label','Open menu');toggle.setAttribute('aria-controls','mobilePanel');toggle.setAttribute('aria-expanded','false');
      toggle.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
      navInner.appendChild(toggle);
    }else{toggle.classList.add('mobile-menu-toggle');toggle.setAttribute('aria-label','Open menu');toggle.setAttribute('aria-controls','mobilePanel');}
    var old=document.getElementById('mobilePanel');if(old)old.remove();
    var panel=document.createElement('aside');panel.id='mobilePanel';panel.className='mobile-menu-panel';panel.setAttribute('aria-label','Site navigation');panel.setAttribute('aria-hidden','true');panel.inert=true;
    panel.innerHTML=`
      <div class="mobile-menu-head"><a href="/" class="mobile-menu-brand">MailFix</a>
        <button type="button" class="mobile-menu-close" id="closeMobileBtn" aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <div class="mobile-menu-body">
        <a href="/#main-tool" class="mobile-menu-cta">Fix Email Free →</a>
        <p class="mobile-menu-section">AI Tools</p>
        <a href="/" class="mobile-menu-link">📧 Email Fixer</a><a href="/hr-email-generator" class="mobile-menu-link">✉️ HR Email Generator</a><a href="/job-application" class="mobile-menu-link">🎓 Job Application</a><a href="/sarkari-letter" class="mobile-menu-link">🏛️ Sarkari Letter</a><a href="/resignation" class="mobile-menu-link">🚪 Resignation Kit</a><a href="/whatsapp-dhanda" class="mobile-menu-link">📱 WhatsApp Dhanda</a><a href="/paraphrase" class="mobile-menu-link">✍️ Paraphrase Tool</a>
        <p class="mobile-menu-section">Calculators & Guides</p>
        <a href="/notice-period-calculator" class="mobile-menu-link">💼 Notice Period Buyout</a><a href="/sip-calculator" class="mobile-menu-link">📈 SIP & Step-Up Calculator</a><a href="/emi-calculator" class="mobile-menu-link">💳 EMI Calculator</a><a href="/8th-pay-commission-tools" class="mobile-menu-link">📘 8th CPC Tools & Guides</a><a href="/rent-vs-buy-calculator" class="mobile-menu-link">🏠 Rent vs Buy Calculator</a><a href="/crs-calculator" class="mobile-menu-link">🇨🇦 CRS Calculator</a><a href="/edd-calculator" class="mobile-menu-link">🍼 EDD Calculator</a><a href="/nps-calculator" class="mobile-menu-link">🛡️ NPS Pension Calculator</a><a href="/salary-breakup-calculator" class="mobile-menu-link">🧩 Salary Breakup</a><a href="/pf-calculator" class="mobile-menu-link">🏦 EPF Calculator</a><a href="/salary-slip-calculator" class="mobile-menu-link">📄 Salary Slip Generator</a><a href="/job-offer-comparison" class="mobile-menu-link">⚖️ Job Offer Comparison</a><a href="/minimum-wages-india" class="mobile-menu-link">📘 Minimum Wages Guide</a><a href="/ctc-calculator" class="mobile-menu-link">💰 CTC to In-Hand</a><a href="/city-compare" class="mobile-menu-link">🏙️ City Salary Compare</a><a href="/hra-calculator" class="mobile-menu-link">🏠 HRA Exemption</a><a href="/itr-calculator" class="mobile-menu-link">📊 ITR / Tax</a><a href="/increment-calculator" class="mobile-menu-link">📈 Govt Increment</a><a href="/leave-encashment" class="mobile-menu-link">🏖️ Leave Encashment</a><a href="/retirement-calculator" class="mobile-menu-link">🎯 Retirement</a><a href="/home-loan-tax-benefit-calculator" class="mobile-menu-link">🏠 Home Loan Tax</a>
        <p class="mobile-menu-section">Utilities</p>
        <a href="/photo-resizer" class="mobile-menu-link">🖼️ Photo Resizer</a><a href="/pdf-to-image" class="mobile-menu-link">📄 PDF to Images</a><a href="/image-to-pdf" class="mobile-menu-link">🗂️ Images to PDF</a><a href="/exam-photo-signature-guide" class="mobile-menu-link">🎓 Exam Photo Guide</a><a href="/qr-generator" class="mobile-menu-link">📷 QR Generator</a><a href="/json-tools" class="mobile-menu-link">🔧 JSON Tools</a><a href="/date-calculator" class="mobile-menu-link">📅 Date & Age</a><a href="/health-calculator" class="mobile-menu-link">💪 Health Calculators</a><a href="/vehicle-scrappage" class="mobile-menu-link">🚗 Vehicle Scrappage</a><a href="/form-12bb" class="mobile-menu-link">📑 Form 12BB Generator</a><a href="/rent-receipt" class="mobile-menu-link">📄 Rent Receipt</a><a href="/pf-transfer-guide" class="mobile-menu-link">🏦 PF Transfer Guide</a><a href="/gst-invoice" class="mobile-menu-link">🧾 GST Invoice</a><a href="/gst-invoice-guide" class="mobile-menu-link">📖 GST Invoice Guide</a>
      </div>`;
    document.body.appendChild(panel);
    var close=panel.querySelector('#closeMobileBtn');
    function open(){panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');panel.inert=false;toggle.setAttribute('aria-expanded','true');document.body.classList.add('mobile-menu-open');document.body.style.overflow='hidden';close.focus();}
    function shut(){panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');panel.inert=true;toggle.setAttribute('aria-expanded','false');document.body.classList.remove('mobile-menu-open');document.body.style.overflow='';}
    toggle.addEventListener('click',open);close.addEventListener('click',shut);
    panel.addEventListener('click',function(e){if(e.target.closest('a'))shut();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&panel.classList.contains('is-open')){shut();toggle.focus();}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();