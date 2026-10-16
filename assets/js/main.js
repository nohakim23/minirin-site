(() => {
  // 스크롤하면 상단 줄에 선 긋기
  const topbar = document.querySelector('.topbar');
  const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 과정 카드의 "상담하기"를 누르면 관심 과정을 미리 골라 둔다
  const form = document.getElementById('consult-form');
  const course = form.elements.course;
  document.querySelectorAll('[data-course]').forEach((a) => {
    a.addEventListener('click', () => { course.value = a.dataset.course; });
  });

  // 모바일 떠 있는 버튼: 첫 화면과 상담 영역에서는 숨긴다
  const floatCta = document.querySelector('.float-cta');
  const hideZones = [document.querySelector('.hero'), document.getElementById('consult')];
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    floatCta.classList.toggle('is-hidden', visible.size > 0);
  }, { threshold: 0.15 });
  hideZones.forEach((z) => io.observe(z));

  // 상담 신청 보내기
  const msg = form.querySelector('.form__msg');
  const btn = form.querySelector('button[type="submit"]');
  const show = (text, ok) => { msg.textContent = text; msg.className = 'form__msg ' + (ok ? 'is-ok' : 'is-err'); };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements;
    if (!f.name.value.trim() || !f.contact.value.trim()) return show('이름과 연락처를 적어 주세요.', false);
    if (!f.consent.checked) return show('개인정보 수집·이용에 동의해 주세요.', false);

    btn.disabled = true;
    show('보내는 중이에요…', true);
    try {
      const r = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name.value,
          contact: f.contact.value,
          course: f.course.value,
          message: f.message.value,
          website: f.website.value,
          consent: f.consent.checked,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || '보내지 못했어요. 잠시 뒤 다시 시도해 주세요.');
      form.reset();
      show('상담 신청이 접수됐어요. 확인 후 연락드릴게요.', true);
    } catch (err) {
      show(err.message || '보내지 못했어요. 잠시 뒤 다시 시도해 주세요.', false);
    } finally {
      btn.disabled = false;
    }
  });
})();
