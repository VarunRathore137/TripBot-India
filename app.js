/* app.js — Interactive frontend logic for NomadAI
 * Saves/loads data from localStorage, includes:
 * - Profile editor
 * - Organizer portal to post events
 * - Lightweight AI recommender (content-based similarity)
 * - Map markers (Leaflet + sample coords)
 * - RSVP / Bookmark / ICS export
 * - Notifications & analytics (Chart.js)
 *
 * NOTE: This is a client-side demo for hackathon; swap in real APIs/LLM later.
 */

(() => {
    // ---- Sample dataset and startup ----
    const sampleEvents = [
      {
        id: 'e1',
        title: 'Ranthambore Early Morning Wildlife Safari',
        tags: ['nature','adventure','wildlife'],
        date: addDaysISO(2),
        mode: 'offline',
        city: 'Ranthambore',
        coords: [26.0193,76.5026],
        capacity: 40,
        description: 'Guided wildlife safari focusing on tigers and birds. Sustainable travel partner included.',
        rsvps: 12
      },
      {
        id: 'e2',
        title: 'Jaipur Heritage Walk: Havelis & Food',
        tags: ['heritage','food'],
        date: addDaysISO(5),
        mode: 'offline',
        city: 'Jaipur',
        coords: [26.9124,75.7873],
        capacity: 25,
        description: 'Explore pink-city havelis and local Rajasthani street food with a local guide.',
        rsvps: 32
      },
      {
        id: 'e3',
        title: 'Virtual Yoga Retreat — Himalayan Morning Flow',
        tags: ['wellness','online','nature'],
        date: addDaysISO(1),
        mode: 'online',
        city: 'Online',
        coords: [28.6139,77.2090],
        capacity: 200,
        description: 'Online beginner-friendly yoga session with meditation + sunrise tips.',
        rsvps: 84
      },
      {
        id: 'e4',
        title: 'Kolkata Food Crawl — Hidden Gems',
        tags: ['food','heritage'],
        date: addDaysISO(7),
        mode: 'offline',
        city: 'Kolkata',
        coords: [22.5726,88.3639],
        capacity: 40,
        description: 'Taste local mishti and street snacks along historic routes.',
        rsvps: 18
      }
    ];
  
    // localStorage keys
    const LS = { profile: 'nomadai_profile', events: 'nomadai_events', bookmarks: 'nomadai_bookmarks' };
  
    // DOM refs
    const feedList = document.getElementById('feedList');
    const applyFilters = document.getElementById('applyFilters');
    const filterWhen = document.getElementById('filterWhen');
    const filterType = document.getElementById('filterType');
    const filterMode = document.getElementById('filterMode');
    const filterRadius = document.getElementById('filterRadius');
    const radiusValue = document.getElementById('radiusValue');
    const miniMapEl = document.getElementById('miniMap');
    const fullMapEl = document.getElementById('fullMap');
    const mapModal = document.getElementById('mapModal');
    const viewMapBtn = document.getElementById('viewMapBtn');
    const organizerModal = document.getElementById('organizerModal');
    const openOrganizerBtn = document.getElementById('openOrganizerBtn');
    const organizerForm = document.getElementById('organizerForm');
    const analyticsChartEl = document.getElementById('analyticsChart');
    const profileModal = document.getElementById('profileModal');
    const profileForm = document.getElementById('profileForm');
    const openProfileBtn = document.getElementById('openProfileBtn');
    const profileNameEl = document.getElementById('profileName');
    const profileInterestsEl = document.getElementById('profileInterests');
    const badgesContainer = document.getElementById('badgesContainer');
    const bookmarksList = document.getElementById('bookmarksList');
    const notifBell = document.getElementById('notifBell');
    const notifCount = document.getElementById('notifCount');
    const toast = document.getElementById('toast');
    const openChatBtn = document.getElementById('openChatBtn');
    const chatModal = document.getElementById('chatModal');
    const chatLog = document.getElementById('chatLog');
    const sendChatExp = document.getElementById('sendChatExp');
    const chatInputExp = document.getElementById('chatInputExp');
    const itineraryPreview = document.getElementById('itineraryPreview');
    const exportIcsBtn = document.getElementById('exportIcs');
  
    let events = loadEvents();
    let profile = loadProfile();
    let bookmarks = loadBookmarks();
    let mapMini, mapFull, markers = [];
  
    // initialize UI
    init();
  
    // ---------- helpers ----------
    function addDaysISO(days) {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString();
    }
  
    function uid(prefix='id') {
      return prefix + '_' + Math.random().toString(36).slice(2,9);
    }
  
    function saveLS(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
    function loadLS(key){ try { return JSON.parse(localStorage.getItem(key)) } catch(e){ return null } }
  
    function loadEvents(){
      let saved = loadLS(LS.events);
      if(!saved){ saveLS(LS.events, sampleEvents); return sampleEvents.slice(); }
      return saved;
    }
    function loadProfile(){
      let p = loadLS(LS.profile);
      if(!p){
        p = { name:'Guest Traveller', interests:['heritage','nature'], style:'Budget', langs:['English'] };
        saveLS(LS.profile, p);
      }
      return p;
    }
    function loadBookmarks(){
      return loadLS(LS.bookmarks) || [];
    }
    function updateNotifications(countDiff=1, text){
      let c = parseInt(notifCount.textContent||'0') + countDiff;
      notifCount.textContent = Math.max(0,c);
      if(text) showToast(text);
    }
  
    function showToast(text, dur=3500){
      toast.textContent = text;
      toast.classList.remove('hidden');
      setTimeout(()=> toast.classList.add('hidden'), dur);
    }
  
    // ---- UI init ----
    function init(){
      // profile UI
      renderProfile();
      renderBadges();
      renderBookmarks();
      // map init
      mapMini = L.map(miniMapEl, { attributionControl:false, zoomControl:false }).setView([20.5937,78.9629], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapMini);
      // full map (but create when modal shown)
      populateMarkers(mapMini);
  
      // render feed
      renderFeed(computeRecommendations());
  
      // event listeners
      radiusValue.textContent = `${filterRadius.value} km`;
      filterRadius.addEventListener('input', ()=> radiusValue.textContent = `${filterRadius.value} km`);
      applyFilters.addEventListener('click', applyFiltersFn);
      openOrganizerBtn.addEventListener('click', ()=> showModal(organizerModal));
      document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeModals));
      organizerForm.addEventListener('submit', handlePostEvent);
      openProfileBtn.addEventListener('click', ()=> showModal(profileModal));
      profileForm.addEventListener('submit', saveProfile);
      openChatBtn.addEventListener('click', ()=> showModal(chatModal));
      viewMapBtn.addEventListener('click', ()=> { showModal(mapModal); initFullMap(); });
  
      // simple search
      document.getElementById('globalSearch').addEventListener('keypress', (e)=>{
        if(e.key==='Enter'){ filterType.value='any'; filterMode.value='any'; applySearch(e.target.value); }
      });
  
      // chat expanded
      sendChatExp.addEventListener('click', handleChatAsk);
      exportIcsBtn.addEventListener('click', exportItineraryICS);
  
      // organizer analytics chart
      initAnalyticsChart();
  
      // simulate smart notification
      setTimeout(()=> {
        updateNotifications(1, 'New: "Kochi Backwater Eco Tour" recommended for you!');
      }, 2500);
    }
  
    // ---------- Feed rendering & recommender ----------
    function renderFeed(list){
      feedList.innerHTML = '';
      if(!list.length) feedList.innerHTML = `<p class="muted">No events match your filters. Try widening the radius or interests.</p>`;
      list.forEach(ev => {
        const card = document.createElement('div'); card.className = 'card';
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <h3>${ev.title}</h3>
            <small class="small">${new Date(ev.date).toLocaleDateString()}</small>
          </div>
          <p class="small">${ev.description}</p>
          <div class="meta">
            <div>${ev.city} • ${ev.mode}</div>
            <div>${ev.rsvps} RSVPs</div>
          </div>
          <div class="tags">${ev.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
          <div class="actions">
            <button class="btn" data-act="details" data-id="${ev.id}">Details</button>
            <button class="btn ghost" data-act="rsvp" data-id="${ev.id}">RSVP</button>
            <button class="btn ghost" data-act="bookmark" data-id="${ev.id}">★ Bookmark</button>
            <button class="btn ghost" data-act="ics" data-id="${ev.id}">Add to Calendar</button>
          </div>
        `;
        feedList.appendChild(card);
      });
  
      // attach event handlers
      feedList.querySelectorAll('button').forEach(btn=>{
        const act = btn.dataset.act, id = btn.dataset.id;
        if(act==='rsvp') btn.addEventListener('click', ()=> rsvpEvent(id));
        if(act==='bookmark') btn.addEventListener('click', ()=> toggleBookmark(id));
        if(act==='details') btn.addEventListener('click', ()=> openDetails(id));
        if(act==='ics') btn.addEventListener('click', ()=> exportEventICS(id));
      });
    }
  
    // simple content-based recommender: score = overlap(user interests, tags)
    function computeRecommendations(){
      const interests = profile.interests.map(i=>i.toLowerCase());
      // compute score for each event
      const scored = events.map(ev=>{
        const tags = ev.tags.map(t=>t.toLowerCase());
        const overlap = tags.filter(t=>interests.includes(t)).length;
        // recency boost: prefer sooner events
        const days = Math.max(1, Math.round((new Date(ev.date)-Date.now())/(1000*60*60*24)));
        const score = overlap*3 + 1/(days);
        return {...ev, score};
      });
      scored.sort((a,b)=>b.score - a.score);
      return scored;
    }
  
    // apply filters combining with recommender
    function applyFiltersFn(){
      const recs = computeRecommendations();
      const when = filterWhen.value, type = filterType.value, mode = filterMode.value;
      let filtered = recs.filter(ev=>{
        if(type!=='any' && !ev.tags.includes(type)) return false;
        if(mode!=='any' && ev.mode!==mode) return false;
        if(when==='weekend'){
          const d = new Date(ev.date);
          if(!(d.getDay()===6 || d.getDay()===0)) return false;
        } else if(when==='thisweek'){
          const now = new Date();
          const diff = (new Date(ev.date) - now)/(1000*60*60*24);
          if(diff>7) return false;
        }
        return true;
      });
      renderFeed(filtered);
      showToast(`${filtered.length} recommendations updated`);
    }
  
    function applySearch(q){
      const ql = q.toLowerCase();
      const res = events.filter(ev => (ev.title + ev.tags.join(' ') + ev.city).toLowerCase().includes(ql));
      renderFeed(res);
      showToast(`${res.length} results for "${q}"`);
    }
  
    // ---------- Basic map markers ----------
    function populateMarkers(map){
      markers.forEach(m=>map.removeLayer(m));
      markers = [];
      events.forEach(ev=>{
        const m = L.marker(ev.coords).addTo(map).bindPopup(`<strong>${ev.title}</strong><br>${ev.city}`).on('click', ()=> {
          // focus card - simple highlight
          showToast(`Preview: ${ev.title}`);
        });
        markers.push(m);
      });
    }
  
    function initFullMap(){
      if(!mapFull){
        mapFull = L.map(fullMapEl).setView([20.5937,78.9629],5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapFull);
      }
      populateMarkers(mapFull);
    }
  
    // ---------- Bookmarks & RSVP ----------
    function toggleBookmark(id){
      if(bookmarks.includes(id)){
        bookmarks = bookmarks.filter(b=>b!==id);
        showToast('Removed bookmark');
      } else {
        bookmarks.push(id);
        showToast('Bookmarked — saved to your list');
        // gamification: award badge on first bookmark
        if(bookmarks.length===1) awardBadge('Explorer');
      }
      saveLS(LS.bookmarks, bookmarks);
      renderBookmarks();
    }
  
    function rsvpEvent(id){
      const ev = events.find(e=>e.id===id);
      if(!ev) return;
      ev.rsvps = (ev.rsvps || 0) + 1;
      saveLS(LS.events, events);
      renderFeed(computeRecommendations());
      renderAnalytics();
      updateNotifications(1, `RSVP confirmed for ${ev.title}`);
      showToast(`You're RSVPed to "${ev.title}"`);
    }
  
    function renderBookmarks(){
      if(!bookmarks.length){
        bookmarksList.innerHTML = `<p class="muted">You haven't bookmarked anything yet.</p>`;
        return;
      }
      bookmarksList.innerHTML = '';
      bookmarks.forEach(id=> {
        const ev = events.find(e=>e.id===id);
        if(!ev) return;
        const div = document.createElement('div'); div.className = 'item';
        div.innerHTML = `<strong>${ev.title}</strong><div class="small-note">${ev.city} • ${new Date(ev.date).toLocaleDateString()}</div>
        <div style="margin-top:8px"><button class="btn ghost" data-id="${ev.id}">View</button></div>`;
        bookmarksList.appendChild(div);
        div.querySelector('button').addEventListener('click', ()=> openDetails(ev.id));
      });
    }
  
    function openDetails(id){
      const ev = events.find(e=>e.id===id);
      if(!ev) return;
      // quick details toast (demo)
      showModal(organizerModal); // reuse modal to show details quickly
      document.getElementById('evtTitle').value = ev.title;
      document.getElementById('evtTags').value = ev.tags.join(',');
      document.getElementById('evtDate').value = new Date(ev.date).toISOString().slice(0,16);
      document.getElementById('evtMode').value = ev.mode;
      document.getElementById('evtLocation').value = ev.city;
      document.getElementById('evtCapacity').value = ev.capacity;
      document.getElementById('evtDesc').value = ev.description;
    }
  
    // ---------- Organizer: post event & analytics ----------
    function handlePostEvent(ev){
      ev.preventDefault();
      const title = document.getElementById('evtTitle').value.trim();
      const tags = (document.getElementById('evtTags').value || '').split(',').map(s=>s.trim()).filter(Boolean);
      const date = document.getElementById('evtDate').value;
      const mode = document.getElementById('evtMode').value;
      const city = document.getElementById('evtLocation').value || 'Unknown';
      const cap = +document.getElementById('evtCapacity').value || 50;
      const desc = document.getElementById('evtDesc').value || '';
      const newEv = { id: uid('ev'), title, tags, date: new Date(date).toISOString(), mode, city, coords: geoGuess(city), capacity: cap, description: desc, rsvps: 0 };
      events.unshift(newEv);
      saveLS(LS.events, events);
      renderFeed(computeRecommendations());
      populateMarkers(mapMini);
      renderAnalytics();
      showToast('Event posted — visible in For You feed');
      closeModals();
    }
  
    // rough city -> coords mapping (demo)
    function geoGuess(city){
      const map = {
        'Jaipur':[26.9124,75.7873],
        'Ranthambore':[26.0193,76.5026],
        'Kolkata':[22.5726,88.3639],
        'Delhi':[28.6139,77.2090],
        'Mumbai':[19.0760,72.8777],
        'Kochi':[9.9312,76.2673]
      };
      return map[city] || [20.5937,78.9629];
    }
  
    // analytics (Chart.js)
    let chart;
    function initAnalyticsChart(){
      renderAnalytics();
    }
    function renderAnalytics(){
      // simple metrics: top tags popularity & RSVP counts
      const tagCounts = {};
      events.forEach(e=> e.tags.forEach(t=> tagCounts[t] = (tagCounts[t]||0)+1));
      const labels = Object.keys(tagCounts);
      const data = labels.map(l=>tagCounts[l]);
      if(chart) chart.destroy();
      chart = new Chart(analyticsChartEl.getContext('2d'), {
        type: 'bar',
        data: { labels, datasets: [{ label:'Event count by tag', data, borderRadius:6 }]},
        options: { responsive:true, plugins:{ legend:{display:false} } }
      });
    }
  
    // ---------- Profile editing ----------
    function renderProfile(){
      profileNameEl.textContent = profile.name;
      profileInterestsEl.textContent = (profile.interests || []).join(', ');
      document.getElementById('pName').value = profile.name;
      document.getElementById('pInterests').value = (profile.interests || []).join(',');
      document.getElementById('pStyle').value = profile.style;
      document.getElementById('pLangs').value = (profile.langs||[]).join(',');
    }
  
    function saveProfile(ev){
      ev.preventDefault();
      profile.name = document.getElementById('pName').value || 'Traveller';
      profile.interests = (document.getElementById('pInterests').value || '').split(',').map(s=>s.trim()).filter(Boolean);
      profile.style = document.getElementById('pStyle').value;
      profile.langs = (document.getElementById('pLangs').value || '').split(',').map(s=>s.trim()).filter(Boolean);
      saveLS(LS.profile, profile);
      renderProfile();
      renderFeed(computeRecommendations());
      closeModals();
      showToast('Profile saved — recommendations updated');
    }
  
    // gamification badges
    function renderBadges(){
      badgesContainer.innerHTML = '';
      const earned = loadLS('nomadai_badges') || [];
      earned.forEach(b => {
        const el = document.createElement('span'); el.className='tag'; el.textContent = b;
        badgesContainer.appendChild(el);
      });
    }
    function awardBadge(name){
      const cur = loadLS('nomadai_badges') || [];
      if(!cur.includes(name)){
        cur.push(name);
        saveLS('nomadai_badges', cur);
        renderBadges();
        showToast(`Badge earned: ${name}`);
      }
    }
  
    // ---------- Chat / Assistant (simulated) ----------
    function handleChatAsk(){
      const q = chatInputExp.value.trim();
      if(!q) return;
      appendChat('user', q);
      chatInputExp.value = '';
      // simple LLM-like response simulation
      setTimeout(()=> {
        const response = generateAssistantResponse(q);
        appendChat('bot', response);
        // create an itinerary preview when asked for plan
        if(/itinerary|plan|suggest/i.test(q)) {
          const plan = generateItinerary();
          renderItinerary(plan);
        }
      }, 700 + Math.random()*800);
    }
  
    function appendChat(who, text){
      const el = document.createElement('div'); el.className = `message ${who==='user'?'user':'bot'}`; el.textContent = text;
      chatLog.appendChild(el); chatLog.scrollTop = chatLog.scrollHeight;
    }
  
    function generateAssistantResponse(q){
      if(/where.*(weekend|this weekend)/i.test(q)) return "Try Jaipur heritage walk for this weekend or Ranthambore for wildlife. Want me to build a 2-day itinerary?";
      if(/food|eat|cuisine/i.test(q)) return "Local tip: try the street chaat in Old Delhi and mishti doi in Kolkata. I can add a food-crawl to your itinerary.";
      if(/near me|nearby/i.test(q)) return "Searching nearby hidden gems... (demo) — I found 'Kochi Backwater Eco Tour'. Shall I add it to your bookmarks?";
      return "I can plan itineraries, recommend sustainable stays, and add events to your calendar. Ask 'Plan a 3-day heritage trip to Jaipur'.";
    }
  
    function generateItinerary(){
      // pick top 2 recommended events and build a simple day plan
      const recs = computeRecommendations();
      const top = recs.slice(0,2);
      const plan = [
        { day:1, title: top[0]?.title || 'Explore Local Market', notes: top[0]?.description || 'Discover local culture.' },
        { day:2, title: top[1]?.title || 'Guided City Walk', notes: top[1]?.description || 'Local culinary & heritage experience.' }
      ];
      return plan;
    }
  
    function renderItinerary(plan){
      itineraryPreview.innerHTML = '';
      plan.forEach(p=>{
        const div = document.createElement('div'); div.className='it-day';
        div.innerHTML = `<strong>Day ${p.day}:</strong> ${p.title}<div class="small-note">${p.notes}</div>`;
        itineraryPreview.appendChild(div);
      });
    }
  
    // ICS export
    function exportEventICS(id){
      const ev = events.find(e=>e.id===id);
      if(!ev) return;
      const start = new Date(ev.date);
      const end = new Date(start.getTime() + 1000*60*60*2); // 2 hours
      const ics = makeICS(ev.title, ev.description, ev.city, start, end);
      downloadBlob(ics, `${ev.title.replace(/\s+/g,'_')}.ics`, 'text/calendar');
    }
  
    function exportItineraryICS(){
      // convert itinerary preview to single event file (demo)
      const ics = makeICS('Planned Trip — NomadAI', 'Your generated itinerary from NomadAI', 'Various', new Date(), addDays(new Date(),2));
      downloadBlob(ics, 'NomadAI_Itinerary.ics','text/calendar');
      showToast('Itinerary exported (.ics)');
    }
  
    function addDays(d, days){
      const nd = new Date(d); nd.setDate(nd.getDate()+days); return nd;
    }
  
    function makeICS(title, desc, loc, start, end){
      const fmt = (d) => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
      return `BEGIN:VCALENDAR
  VERSION:2.0
  PRODID:-//NomadAI//EN
  BEGIN:VEVENT
  UID:${uid('evt')}
  SUMMARY:${escapeICal(title)}
  DTSTAMP:${fmt(new Date())}
  DTSTART:${fmt(start)}
  DTEND:${fmt(end)}
  LOCATION:${escapeICal(loc)}
  DESCRIPTION:${escapeICal(desc)}
  END:VEVENT
  END:VCALENDAR`;
    }
    function escapeICal(s=''){ return s.replace(/\n/g,'\\n').replace(/,/g,'\\,'); }
    function downloadBlob(text, filename, mime){
      const blob = new Blob([text], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }
  
    // ---------- Small utilities & modal helpers ----------
    function showModal(el){ el.classList.remove('hidden'); document.body.style.overflow='hidden'; }
    function closeModals(){ document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden')); document.body.style.overflow='auto'; }
  
    // populate mini map markers initially
    function populateMarkers(map){ // redefined earlier - keep consistent
      if(!map) return;
      // clear
      if(markers && markers.length) markers.forEach(m=>map.removeLayer(m));
      markers = [];
      events.forEach(ev=>{
        const mark = L.circleMarker(ev.coords, {radius:8, color:'#ff6b6b'}).addTo(map)
          .bindPopup(`<b>${ev.title}</b><br>${ev.city}`);
        markers.push(mark);
      });
    }
  
    // simple export helpers
    function openDetailsFake(ev){ showToast(ev.title); }
  
    // simple search to simulate map integration
    function applySearch(val){
      if(!val) renderFeed(computeRecommendations());
      else renderFeed(events.filter(e=> (e.title+e.tags.join(' ')+e.city).toLowerCase().includes(val.toLowerCase())));
    }
  
    // ICS helper for event export above uses makeICS
  
    // ---- small UI behaviors ----
    document.addEventListener('click', (e)=>{
      if(e.target===notifBell) {
        notifCount.textContent = '0';
        showToast('Notifications viewed');
      }
    });
  
    // initial render of feed and map
    renderFeed(computeRecommendations());
    populateMarkers(mapMini);
  })();
  