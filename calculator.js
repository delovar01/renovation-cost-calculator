(function () {
  'use strict';

  const PRICING = {
    propertyType: {
      apartment:  { multiplier: 1.00, label: 'Квартира' },
      house:      { multiplier: 1.15, label: 'Частный дом' },
      office:     { multiplier: 0.95, label: 'Офис' },
      commercial: { multiplier: 1.10, label: 'Коммерческое помещение' },
    },
    renovationType: {
      cosmetic: { base: 4500,  spread: 0.35, label: 'Косметический', daysPerSqm: 0.5, workShare: 0.50, materialShare: 0.45 },
      standard: { base: 8500,  spread: 0.30, label: 'Стандартный',   daysPerSqm: 0.8, workShare: 0.45, materialShare: 0.50 },
      euro:     { base: 16000, spread: 0.28, label: 'Евроремонт',    daysPerSqm: 1.2, workShare: 0.40, materialShare: 0.55 },
      premium:  { base: 35000, spread: 0.30, label: 'Дизайнерский',  daysPerSqm: 1.8, workShare: 0.35, materialShare: 0.55 },
    },
    rooms: {
      kitchen:    { coef: 0.15, label: 'Кухня' },
      bathroom:   { coef: 0.20, label: 'Ванная' },
      toilet:     { coef: 0.10, label: 'Туалет' },
      bedroom:    { coef: 0.05, label: 'Спальня' },
      livingroom: { coef: 0.07, label: 'Гостиная' },
      hallway:    { coef: 0.03, label: 'Коридор' },
      balcony:    { coef: 0.08, label: 'Балкон' },
    },
    extras: {
      design:     { coef: 0.08, label: 'Дизайн-проект' },
      demolition: { coef: 0.05, label: 'Снос стен / перепланировка' },
      warmfloor:  { coef: 0.07, label: 'Тёплый пол' },
      smarthome:  { coef: 0.15, label: 'Умный дом' },
    },
  };

  const TOTAL_STEPS = 5;
  let currentStep = 1;

  const form = document.getElementById('calcForm');
  const progressFill = document.getElementById('progressFill');
  const progressSteps = document.querySelectorAll('.progress__step');
  const areaSlider = document.getElementById('area');
  const areaValue = document.getElementById('areaValue');

  function goToStep(step) {
    if (step < 1 || step > TOTAL_STEPS) return;
    currentStep = step;

    document.querySelectorAll('.step').forEach((el) => {
      el.classList.toggle('is-active', Number(el.dataset.step) === step);
    });

    progressFill.style.width = (step / TOTAL_STEPS) * 100 + '%';
    progressSteps.forEach((el) => {
      const n = Number(el.dataset.step);
      el.classList.toggle('is-active', n === step);
      el.classList.toggle('is-done', n < step);
    });

    if (step === TOTAL_STEPS) renderResult();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  form.addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('[data-next]')) goToStep(currentStep + 1);
    if (target.matches('[data-prev]')) goToStep(currentStep - 1);
  });

  areaSlider.addEventListener('input', () => {
    areaValue.textContent = areaSlider.value;
  });

  function getCheckedValue(name) {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
  }

  function getCheckedValues(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
  }

  function formatPrice(n) {
    return Math.round(n).toLocaleString('ru-RU') + ' ₽';
  }

  function formatDays(days) {
    const d = Math.round(days);
    if (d < 30) return d + ' ' + pluralize(d, 'день', 'дня', 'дней');
    const weeks = Math.round(d / 7);
    if (d < 60) return weeks + ' ' + pluralize(weeks, 'неделя', 'недели', 'недель');
    const months = Math.round(d / 30);
    return months + ' ' + pluralize(months, 'месяц', 'месяца', 'месяцев');
  }

  function pluralize(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function calculate() {
    const propertyType = getCheckedValue('propertyType') || 'apartment';
    const renovationType = getCheckedValue('renovationType') || 'cosmetic';
    const selectedRooms = getCheckedValues('rooms');
    const selectedExtras = ['design', 'demolition', 'warmfloor', 'smarthome'].filter((k) => {
      const el = form.querySelector(`input[name="${k}"]`);
      return el && el.checked;
    });
    const area = Number(areaSlider.value);

    const propConf = PRICING.propertyType[propertyType];
    const renoConf = PRICING.renovationType[renovationType];

    const roomsCoef = selectedRooms.reduce((sum, key) => sum + (PRICING.rooms[key]?.coef || 0), 0);
    const extrasCoef = selectedExtras.reduce((sum, key) => sum + (PRICING.extras[key]?.coef || 0), 0);

    const basePricePerSqm = renoConf.base * propConf.multiplier;
    const baseCost = basePricePerSqm * area;

    const roomsAdd = baseCost * roomsCoef;
    const extrasAdd = baseCost * extrasCoef;

    const subtotal = baseCost + roomsAdd + extrasAdd;

    const workCost = subtotal * renoConf.workShare;
    const materialCost = subtotal * renoConf.materialShare;
    const extrasCost = subtotal - workCost - materialCost;

    const priceMin = subtotal * (1 - renoConf.spread / 2);
    const priceMax = subtotal * (1 + renoConf.spread / 2);

    const daysMin = area * renoConf.daysPerSqm * (1 + roomsCoef * 0.5);
    const daysMax = daysMin * 1.4;

    return {
      propertyType,
      renovationType,
      selectedRooms,
      selectedExtras,
      area,
      propConf,
      renoConf,
      basePricePerSqm,
      baseCost,
      roomsAdd,
      extrasAdd,
      workCost,
      materialCost,
      extrasCost,
      subtotal,
      priceMin,
      priceMax,
      daysMin,
      daysMax,
    };
  }

  function renderResult() {
    const r = calculate();

    document.getElementById('priceRange').textContent =
      formatPrice(r.priceMin) + ' — ' + formatPrice(r.priceMax);
    document.getElementById('timeline').textContent =
      formatDays(r.daysMin) + ' — ' + formatDays(r.daysMax);
    document.getElementById('areaOut').textContent = r.area + ' м²';
    document.getElementById('typeOut').textContent = r.renoConf.label;

    const lines = [];

    lines.push({ section: 'Работа' });
    lines.push({ label: 'Демонтаж и подготовка', value: r.workCost * 0.25 });
    lines.push({ label: 'Черновые работы', value: r.workCost * 0.35 });
    lines.push({ label: 'Чистовая отделка', value: r.workCost * 0.40 });

    lines.push({ section: 'Материалы' });
    lines.push({ label: 'Черновые материалы', value: r.materialCost * 0.35 });
    lines.push({ label: 'Отделочные материалы', value: r.materialCost * 0.50 });
    lines.push({ label: 'Сантехника и электрика', value: r.materialCost * 0.15 });

    if (r.selectedExtras.length > 0 || r.extrasCost > 0) {
      lines.push({ section: 'Дополнительные услуги' });
      if (r.selectedExtras.length === 0) {
        lines.push({ label: 'Доставка, вывоз мусора, уборка', value: r.extrasCost });
      } else {
        const totalExtraCoef = r.selectedExtras.reduce(
          (s, k) => s + (PRICING.extras[k]?.coef || 0), 0
        );
        r.selectedExtras.forEach((key) => {
          const extra = PRICING.extras[key];
          const share = totalExtraCoef > 0 ? extra.coef / totalExtraCoef : 0;
          lines.push({ label: extra.label, value: r.extrasCost * share });
        });
      }
    }

    lines.push({ total: true, label: 'Итого (средняя оценка)', value: r.subtotal });

    const breakdown = document.getElementById('breakdown');
    breakdown.innerHTML = lines.map((l) => {
      if (l.section) {
        return `<li class="breakdown__row breakdown__row--section"><span class="breakdown__label">${l.section}</span><span class="breakdown__value"></span></li>`;
      }
      const cls = l.total ? 'breakdown__row breakdown__row--total' : 'breakdown__row';
      return `<li class="${cls}"><span class="breakdown__label">${l.label}</span><span class="breakdown__value">${formatPrice(l.value)}</span></li>`;
    }).join('');
  }

  // PDF export via print
  document.getElementById('pdfBtn').addEventListener('click', () => {
    window.print();
  });

  // Lead modal
  const modal = document.getElementById('leadModal');
  const leadForm = document.getElementById('leadForm');
  const leadSuccess = document.getElementById('leadSuccess');

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      leadForm.hidden = false;
      leadSuccess.hidden = true;
      leadForm.reset();
    }, 250);
  }

  document.getElementById('leadBtn').addEventListener('click', openModal);
  modal.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(leadForm);
    const payload = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      calculation: calculate(),
      timestamp: new Date().toISOString(),
    };
    // Hook for integration with CRM/backend:
    // fetch('/api/lead', { method: 'POST', body: JSON.stringify(payload) });
    document.dispatchEvent(new CustomEvent('renovation:lead', { detail: payload }));
    console.log('[renovation-calculator] lead submitted', payload);

    leadForm.hidden = true;
    leadSuccess.hidden = false;
  });

  // Init
  goToStep(1);
})();
