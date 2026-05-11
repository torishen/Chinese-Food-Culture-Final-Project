"use strict";
// ═══════════════════════════════════════
// 吃 · Eating Alone Together — Scripts
// ═══════════════════════════════════════
// ── CURSOR ──
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animC() {
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animC);
})();
// ── AUDIO POPUP — shows every page load, on first scroll past 60px ──
function showModal() {
    const modal = document.getElementById('audio-modal');
    if (modal.dataset.shown === '1' || modal.dataset.dismissed === '1')
        return;
    modal.dataset.shown = '1';
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { modal.classList.add('show'); });
    });
}
function modalPlay() {
    const aud = document.getElementById('main-audio');
    const status = document.getElementById('modal-status');
    const promise = aud.play();
    if (promise !== undefined) {
        promise.then(() => {
            setPlaying(true);
            dismissModal();
        }).catch((err) => {
            if (status) {
                status.textContent = 'Could not play: ' + err.message;
                status.style.display = 'block';
            }
            console.error('Audio play failed:', err);
        });
    }
    else {
        setPlaying(true);
        dismissModal();
    }
}
function dismissModal() {
    const modal = document.getElementById('audio-modal');
    modal.classList.remove('show');
    modal.dataset.dismissed = '1';
    setTimeout(() => { if (!modal.classList.contains('show'))
        modal.style.display = 'none'; }, 600);
}
function _modalScrollCheck() {
    if (window.scrollY > 60) {
        window.removeEventListener('scroll', _modalScrollCheck);
        showModal();
    }
}
window.addEventListener('scroll', _modalScrollCheck, { passive: true });
// Fallback: trigger after 4 seconds if user hasn't scrolled
setTimeout(() => {
    const modal = document.getElementById('audio-modal');
    if (modal.dataset.shown !== '1')
        showModal();
}, 4000);
// ── AUDIO PLAYER ──
const audio = document.getElementById('main-audio');
const progFill = document.getElementById('prog-fill');
const timeEl = document.getElementById('audio-time');
let playing = false;
const PLAY = '<polygon points="5,3 19,12 5,21"/>';
const PAUSE = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
function setPlaying(state) {
    playing = state;
    document.getElementById('bar-icon').innerHTML = state ? PAUSE : PLAY;
    document.getElementById('audio-bar').classList.toggle('playing', state);
    document.getElementById('audio-modal').classList.toggle('playing', state);
}
function togglePlay() {
    const hasSource = audio.querySelector('source') || audio.src;
    if (!hasSource) {
        document.getElementById('audio-modal').style.display = 'flex';
        requestAnimationFrame(() => requestAnimationFrame(() => {
            document.getElementById('audio-modal').classList.add('show');
        }));
        return;
    }
    if (playing) {
        audio.pause();
        setPlaying(false);
    }
    else {
        const p = audio.play();
        if (p !== undefined) {
            p.then(() => setPlaying(true))
                .catch((err) => {
                console.error('Play failed:', err);
                showAudioError(err.message);
            });
        }
        else {
            setPlaying(true);
        }
    }
}
function showAudioError(msg) {
    let toast = document.getElementById('audio-error-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'audio-error-toast';
        toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#8b1010;color:#fff;font-family:Space Mono,monospace;font-size:10px;letter-spacing:0.1em;padding:10px 20px;z-index:99999;max-width:80vw;text-align:center;';
        document.body.appendChild(toast);
    }
    toast.textContent = 'Audio error: ' + msg + ' — check that audio/composite.mp3 exists and the path is correct.';
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 7000);
}
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
        const m = Math.floor(audio.currentTime / 60), s = Math.floor(audio.currentTime % 60);
        const dm = Math.floor(audio.duration / 60), ds = Math.floor(audio.duration % 60);
        timeEl.textContent = m + ':' + String(s).padStart(2, '0') + ' / ' + dm + ':' + String(ds).padStart(2, '0');
    }
});
audio.addEventListener('ended', () => setPlaying(false));
function seekAudio(e) {
    if (!audio.duration)
        return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
}
// ── CHAPTER PIPS ──
const sections = document.querySelectorAll('section[data-chapter]');
const navEl = document.getElementById('chapter-nav');
sections.forEach((sec, i) => {
    const pip = document.createElement('div');
    pip.className = 'cpip';
    pip.style.top = (8 + i * (82 / (sections.length - 1))) + '%';
    const lbl = document.createElement('span');
    lbl.className = 'cpip-lbl';
    lbl.textContent = sec.getAttribute('data-chapter');
    pip.appendChild(lbl);
    pip.addEventListener('click', () => sec.scrollIntoView({ behavior: 'smooth' }));
    navEl.appendChild(pip);
});
const pips = navEl.querySelectorAll('.cpip');
const chInd = document.getElementById('chapter-ind');
function updatePips() {
    const mid = window.scrollY + window.innerHeight / 2;
    sections.forEach((sec, i) => {
        if (mid >= sec.offsetTop && mid < sec.offsetTop + sec.offsetHeight) {
            pips.forEach(p => p.classList.remove('active'));
            if (pips[i])
                pips[i].classList.add('active');
            chInd.textContent = sec.getAttribute('data-chapter');
        }
    });
}
window.addEventListener('scroll', updatePips, { passive: true });
updatePips();
// ── SCROLL REVEAL ──
const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting)
        e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));
// ── BAR ANIMATION ──
const barsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            document.querySelectorAll('#bars-wrap .bar-row').forEach((r, i) => {
                const f = r.querySelector('.bar-fill');
                const pct = r.getAttribute('data-pct');
                if (f)
                    setTimeout(() => { f.style.width = pct + '%'; }, i * 100);
            });
            setTimeout(() => { document.querySelectorAll('.bar-note').forEach(n => n.classList.add('show')); }, 1400);
        }
    });
}, { threshold: 0.3 });
const bw = document.getElementById('bars-wrap');
if (bw)
    barsObs.observe(bw);
// ── TENSION ACCORDION ──
function toggleT(row) {
    const open = row.classList.contains('open');
    document.querySelectorAll('.tension-row.open').forEach(r => r.classList.remove('open'));
    if (!open)
        row.classList.add('open');
}
const PORTRAITS = {
    la: {
        city: 'Los Angeles', years: '5 years', dish: '肥肠豆腐鱼', dishEn: 'Intestine & Tofu Fish',
        stats: [{ n: '21', l: 'meals/week' }, { n: '75%', l: 'Chinese food' }, { n: '5yr', l: 'in the US' }],
        cn: '我们做的到底是不是中餐，因为条件有限。大家一起吃饭一起做饭，已经是最开心的体验了。',
        body: `<p>From Sichuan. Describes the food they miss most not by dish name but by texture and origin — the freshwater fish, the intestines, the things the American grocery store simply cannot substitute. Eats 21 meals a week, skips none, cooks most of them. In LA, abundance makes delivery services feel unnecessary.</p><p>The most important story: the first time they saw someone cook bacon in the hot pot. Stunned — a Sichuan person, confronting something they'd never seen. Then gradually accepted it. Then it became a source of joy. That arc is their entire adaptation in one anecdote.</p>`,
        dishDesc: '"The fish here — tilapia, sea bass — tastes completely different. The river fish back home, the fat, the way it holds together — I can\'t find that here. The ingredient itself doesn\'t exist."',
        photos: ['la-01.jpg', 'la-02.jpg'],
        tags: ['Sichuan origin', 'communal cooking', 'hybridity', 'LA abundance']
    },
    boston: {
        city: 'Boston', years: '5 years', dish: '糖醋排骨', dishEn: 'Sweet & Sour Pork Ribs',
        stats: [{ n: '~20', l: 'meals/week' }, { n: '48%', l: 'Chinese food' }, { n: '5yr', l: 'in the US' }],
        cn: '人在不是很想吃东西的时候，想吃的仍然是中餐。',
        body: `<p>Describes food as the highest-priority thing in their life — phrased with such conviction it sounds like a philosophical position, not an appetite. When sick, the body cuts through all the negotiation and just wants Chinese food. It's the one moment where identity reasserts itself without consent.</p><p>Used campus delivery at a previous address. Stopped when they moved. "It wasn't that good anyway" — a small, honest deflation that says more than a complaint would.</p>`,
        dishDesc: '"You\'ve been mocking it for years. It\'s still the best. Some dishes earn their cliché."',
        photos: ['bos-01.jpg', 'bos-02.jpg'],
        tags: ['Hangzhou cuisine', 'embodied identity', 'illness as truth-teller']
    },
    'atlanta-e': {
        city: 'Atlanta', years: '9 years', dish: '兰州拉面', dishEn: 'Lanzhou Pulled Noodles',
        stats: [{ n: '15', l: 'meals/week' }, { n: '33%', l: 'Chinese food' }, { n: '9yr', l: 'in the US' }],
        cn: '口味即使来到美国之后，也并没有因为中餐的稀缺改变。',
        body: `<p>In America the longest — 9 years — and their account is the most economical of all eight. Has spent more of their adulthood here than anywhere else, yet maintains: the palate has not changed. Not because they refuse to adapt, but because the preference is structural. Northwest Chinese cuisine is not a nostalgic preference. It is a considered aesthetic position.</p><p>33% Chinese meals is not abandonment. It is the honest result of a long negotiation — a proportion that has normalized without the underlying preference ever shifting.</p>`,
        dishDesc: '"Rich flavor, simple ingredients, balanced nutrition. A perfect dish. I don\'t need it to be complicated."',
        photos: ['atl-01.jpg'],
        tags: ['9 years — longest duration', 'Northwest Chinese cuisine', 'stable identity']
    },
    'atlanta-gt1': {
        city: 'Atlanta', years: '1 year', dish: '潮汕牛肉煲', dishEn: 'Chaoshan Beef Hot Pot',
        stats: [{ n: '14', l: 'meals/week' }, { n: '100%', l: 'Chinese food' }, { n: '1yr', l: 'in the US' }],
        cn: '每次吃中餐都觉得自己有一点想家，然后也是回到了家的口味。',
        body: `<p>In America the shortest time and has the highest proportion of Chinese food: 100%. Cooks every single meal. Descriptions of cooking are the most methodical — vegetables cut first, garlic and chili down first, the beef in last for tenderness. This is not improvisation. It is execution of a known system, precisely because the known system is one of the few structures that is fully theirs.</p>`,
        dishDesc: 'The dish they cannot find in the US. "Chaoshan beef — the freshness of the meat, the way it\'s sliced, the broth. Nothing here comes close."',
        recipe: ['Cut peppers into pieces. Slice the beef thin.', 'Stir-fry chili and garlic until fragrant.', 'Add cilantro. Then the beef goes in fast — speed keeps it tender.', 'Slightly spicy. Simple. Every single day.'],
        photos: ['atl-02.jpg', 'atl-03.jpg'],
        tags: ['1 year — newest arrival', '100% Chinese meals', 'Sichuan spice', 'cooking as discipline']
    },
    ithaca: {
        city: 'Ithaca', years: '6 years', dish: '夫妻肺片', dishEn: 'Husband & Wife Sliced Beef',
        stats: [{ n: '14', l: 'meals/week' }, { n: '85%', l: 'Chinese food' }, { n: '6yr', l: 'in the US' }],
        cn: '能有一次吃中餐的机会，对我来讲是一件幸福的事情。',
        body: `<p>The most socially focused account. The richest food memory is not a dish but a gathering: weekly communal cooking in undergrad, everyone making one dish. Finds campus delivery too expensive — $23 a box plus delivery fee, insufficient portion.</p><p>The story about the wrong 麻酱 in the 夫妻肺片 is small but precise. Not angry — simply accurate. The dish is wrong, and they know why, and that knowing is a form of inheritance.</p>`,
        dishDesc: '"Sichuan 夫妻肺片 should not have sesame paste. I have nothing against sesame paste — I love it with lamb hot pot. But not here. This dish has been misread. And that misreading is what accumulates into a quiet sense of loss."',
        photos: ['ith-01.jpg', 'ith-02.jpg'],
        tags: ['Yunnan + Sichuan', 'communal cooking', 'inauthenticity as grief', 'Ithaca scarcity']
    },
    cville: {
        city: 'Charlottesville', years: '5 years (formerly Minnesota)', dish: '凉皮', dishEn: "Xi'an Cold Skin Noodles",
        stats: [{ n: '~10', l: 'meals/week' }, { n: '50%', l: 'Chinese food' }, { n: '5yr', l: 'in the US' }],
        cn: '去适应这样比较贫瘠的生活，当然后来习惯了一点，其实就改善了很多。',
        body: `<p>The account traces the full arc: food-poverty in Minnesota, suffering (痛苦), gradual adaptation, and then — once there was access to an Asian supermarket and a kitchen — a kind of liberation. Now cooks dishes once thought to require a restaurant.</p><p>The structural observation about ordering alone — one dish is not enough variety, two is too much — is one of the most precise articulations in any interview of how eating alone creates real, daily friction.</p>`,
        dishDesc: '"I\'ve had it here. It\'s good. But it\'s not the 凉皮 from the street in Xi\'an. I can\'t explain exactly why. Something in the texture, or the vinegar, or the hour of day. It just isn\'t."',
        photos: ['cvl-01.jpg', 'cvl-02.jpg'],
        tags: ['Hunan + Sichuan + Xinjiang', 'Minnesota as rupture', 'cooking as liberation', 'geography as access']
    },
    'atlanta-gt2': {
        city: 'Atlanta', years: '2 years', dish: '辣子鸡', dishEn: 'Dry-Fried Chili Chicken',
        stats: [{ n: '14', l: 'meals/week' }, { n: '47%', l: 'Chinese food' }, { n: '2yr', l: 'in the US' }],
        cn: '有的时候自己可以复刻出来以前在家里面吃过的味道，就会比较有成就感。',
        body: `<p>Introduces one of the most resonant phrases in the collection: 白人饭 — "white people food" — used not with hostility but as a practical category. When there's been too much of it, a recalibration is needed. The stove is where that recalibration happens.</p><p>The satisfaction described — recreating a flavor from childhood — is a form of mastery that feels particularly important when so much else is unfamiliar. The kitchen as the one room where this person is the expert.</p>`,
        dishDesc: '"The 辣子鸡 here — you can tell the chili peppers have no heat. And they\'re not fresh. The flavor isn\'t heavy enough. Compared to what you\'d eat in Sichuan or Chongqing, it\'s completely different."',
        recipe: ['Blanch ribs with ginger and Shaoxing wine. Bring to boil, skim foam.', 'Wash ribs clean. Start fresh — new ginger, new water.', 'Simmer 30 minutes. Add corn, radish, or bamboo — whatever you feel like.', 'Simmer another 30 minutes. Simple enough to leave alone. Complex enough to feel like home.'],
        photos: ['atl-04.jpg'],
        tags: ['Sichuan origin', '白人饭 as category', 'recalibration', 'mastery in recreation']
    },
    'atlanta-gt3': {
        city: 'Atlanta', years: '5 years', dish: '臭桂鱼', dishEn: 'Fermented Mandarin Fish',
        stats: [{ n: '14', l: 'meals/week' }, { n: '82%', l: 'Chinese food' }, { n: '5yr', l: 'in the US' }],
        cn: '吃饭的时候如果吃不到自己常吃的或者自己喜欢吃的家乡菜的话，我会感觉这一天，一直像在外面做客的感觉。',
        body: `<p>Articulates the condition of dislocation with the most precision: not homesick, not depressed — just a guest. Everywhere. All day. The word is 做客 — being a guest in someone else's home. The antidote is not a grand meal. It is the simple presence of familiar food on a plate.</p><p>Won't order from the private kitchen at Georgia Tech — concerns about hygiene. But in California, ordered all the time. The difference is not the service. It's the access to alternatives.</p>`,
        dishDesc: '"I know it probably exists here. But the fish is different, and the way it\'s cured is different, and something about it just isn\'t the same."',
        recipe: ['Heat oil. Add Sichuan peppercorns — wait until fragrant.', 'Remove peppercorns before they blacken. Leave their flavor in the oil.', 'Add sliced king oyster mushrooms. Stir constantly — don\'t let them go fully soft.', 'When half-tender, half-firm: a splash of soy sauce. Done.'],
        photos: ['atl-05.jpg'],
        tags: ['Sichuan cuisine', '做客 — perpetual guest', 'food as homecoming', 'precise technique']
    }
};
function openDrawer(id) {
    const d = PORTRAITS[id];
    if (!d)
        return;
    let galleryHtml = '';
    if (d.photos && d.photos.length) {
        galleryHtml = `<div class="dr-sec"><div class="dr-sec-label">Kitchen</div><div class="gallery-strip">`;
        d.photos.forEach(ph => {
            galleryHtml += `<div class="gallery-thumb" onclick="openLightboxSrc('photos/${ph}','${d.city} · kitchen')">
        <img src="photos/${ph}" alt="${d.city} kitchen" onerror="this.parentElement.innerHTML='<div class=\\'gallery-thumb-ph\\'>[ photos/${ph} ]</div>'">
      </div>`;
        });
        galleryHtml += `</div></div>`;
    }
    let recipeHtml = '';
    if (d.recipe) {
        recipeHtml = `<div class="recipe-list">`;
        d.recipe.forEach(s => recipeHtml += `<div class="recipe-step">${s}</div>`);
        recipeHtml += `</div>`;
    }
    let tagsHtml = '';
    if (d.tags) {
        tagsHtml = `<div class="dr-tags">`;
        d.tags.forEach(t => tagsHtml += `<span class="dr-tag">${t}</span>`);
        tagsHtml += `</div>`;
    }
    document.getElementById('drawer-body').innerHTML = `
    <div class="dr-eyebrow">Portrait</div>
    <div class="dr-city">${d.city} · ${d.years}</div>
    <div class="dr-dish">${d.dish}</div>
    <div class="dr-dish-en">${d.dishEn} — the dish they cannot stop missing</div>
    <div class="dr-stats">${d.stats.map(s => `<div class="dr-stat"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`).join('')}</div>
    <div class="dr-cn">${d.cn}</div>
    <div class="dr-body">${d.body}</div>
    ${galleryHtml}
    <div class="dr-sec">
      <div class="dr-sec-label">The Dish</div>
      <div class="dr-dish-desc">${d.dishDesc}</div>
      ${recipeHtml}
    </div>
    ${tagsHtml}
  `;
    document.getElementById('drawer').classList.add('open');
}
function closeDrawer() { document.getElementById('drawer').classList.remove('open'); }
document.addEventListener('click', e => {
    const dr = document.getElementById('drawer');
    const target = e.target;
    if (dr.classList.contains('open') && !dr.contains(target) && !target.closest('.portrait-card'))
        closeDrawer();
});
// ── LIGHTBOX ──
function openLightbox(item) {
    const img = item.querySelector('img');
    if (!img)
        return;
    openLightboxSrc(img.src, item.getAttribute('data-caption') || '');
}
function openLightboxSrc(src, caption) {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-caption').textContent = caption || '';
    lb.classList.add('show');
}
function closeLightbox() { document.getElementById('lightbox').classList.remove('show'); }
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeDrawer();
        closeLightbox();
        dismissModal();
    }
});
// ── FULL DOCUMENTARY PLAYER ──
// REPLACE src below with your full documentary file when ready:
// a.src = 'audio/full-documentary.mp3';
const fullAudio = (() => {
    var _a;
    const a = document.createElement('audio');
    const src = document.querySelector('#main-audio source');
    if (src)
        a.src = (_a = src.getAttribute('src')) !== null && _a !== void 0 ? _a : '';
    return a;
})();
let fullPlaying = false;
const FULL_PLAY = '<polygon points="5,3 19,12 5,21"/>';
const FULL_PAUSE = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
function toggleFull() {
    const btn = document.getElementById('full-play-btn');
    const icon = document.getElementById('full-icon');
    const label = document.getElementById('full-play-label');
    const waveform = document.getElementById('full-waveform');
    if (!fullAudio.src) {
        label.textContent = '파일 없음';
        return;
    }
    if (fullPlaying) {
        fullAudio.pause();
        fullPlaying = false;
        icon.innerHTML = FULL_PLAY;
        label.textContent = '播放';
        btn.classList.remove('playing');
        waveform.classList.remove('playing');
    }
    else {
        if (playing) {
            audio.pause();
            setPlaying(false);
        }
        fullAudio.play().catch(() => { label.textContent = '需要音频文件'; });
        fullPlaying = true;
        icon.innerHTML = FULL_PAUSE;
        label.textContent = '暂停';
        btn.classList.add('playing');
        waveform.classList.add('playing');
    }
}
fullAudio.addEventListener('timeupdate', () => {
    if (!fullAudio.duration)
        return;
    const fill = document.getElementById('full-prog-fill');
    const fullTimeEl = document.getElementById('full-time');
    if (fill)
        fill.style.width = (fullAudio.currentTime / fullAudio.duration * 100) + '%';
    if (fullTimeEl) {
        const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
        fullTimeEl.textContent = fmt(fullAudio.currentTime) + ' / ' + fmt(fullAudio.duration);
    }
});
fullAudio.addEventListener('ended', () => {
    fullPlaying = false;
    const icon = document.getElementById('full-icon');
    const label = document.getElementById('full-play-label');
    const btn = document.getElementById('full-play-btn');
    const waveform = document.getElementById('full-waveform');
    if (icon)
        icon.innerHTML = FULL_PLAY;
    if (label)
        label.textContent = '播放';
    if (btn)
        btn.classList.remove('playing');
    if (waveform)
        waveform.classList.remove('playing');
    const fill = document.getElementById('full-prog-fill');
    if (fill)
        fill.style.width = '0%';
});
function fullSeek(e) {
    if (!fullAudio.duration)
        return;
    const r = e.currentTarget.getBoundingClientRect();
    fullAudio.currentTime = ((e.clientX - r.left) / r.width) * fullAudio.duration;
}
// ── GALLERY DRAG-TO-SCROLL ──
(function () {
    const grid = document.getElementById('gallery-grid');
    if (!grid)
        return;
    let isDown = false, startX = 0, scrollLeft = 0;
    grid.addEventListener('mousedown', (e) => {
        isDown = true;
        grid.classList.add('active');
        startX = e.pageX - grid.offsetLeft;
        scrollLeft = grid.scrollLeft;
    });
    grid.addEventListener('mouseleave', () => { isDown = false; grid.classList.remove('active'); });
    grid.addEventListener('mouseup', () => { isDown = false; grid.classList.remove('active'); });
    grid.addEventListener('mousemove', (e) => {
        if (!isDown)
            return;
        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        grid.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
    let tStart = 0, tScroll = 0;
    grid.addEventListener('touchstart', (e) => { tStart = e.touches[0].pageX; tScroll = grid.scrollLeft; }, { passive: true });
    grid.addEventListener('touchmove', (e) => {
        grid.scrollLeft = tScroll - (e.touches[0].pageX - tStart);
    }, { passive: true });
})();
function galleryScroll(dir) {
    const grid = document.getElementById('gallery-grid');
    if (!grid)
        return;
    grid.scrollBy({ left: dir * 380, behavior: 'smooth' });
}
