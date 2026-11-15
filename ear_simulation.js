// Interactive Ear Anatomy & Pressure Simulation (KHTN 8)
// Models human ear anatomy, sound transmission, and sudden pressure changes during flight (Takeoff & Landing)

const EAR_PARTS = [
  {
    id: 1,
    name: "Vành tai",
    latin: "Auricle / Pinna",
    badgeTitle: "Vành tai",
    badgeDesc: "Hứng âm thanh",
    color: "#f59e0b",
    colorLight: "#fbbf24",
    xPercent: 19.6,
    yPercent: 27.3,
    arrowSide: "right", // arrow starts from badge right edge
    soundOrder: 1,
    role: "Nằm ngoài cùng, hứng sóng âm từ môi trường xung quanh. Hướng âm thanh vào ống tai.",
    details: "Vành tai có cấu tạo sụn đàn hồi với nhiều nếp gấp đặc biệt, hoạt động như một chiếc phễu thu âm thanh tự nhiên giúp ta định hướng nguồn âm trong không gian."
  },
  {
    id: 2,
    name: "Ống tai",
    latin: "External Auditory Canal",
    badgeTitle: "Ống tai",
    badgeDesc: "Dẫn âm thanh",
    color: "#0284c7",
    colorLight: "#38bdf8",
    xPercent: 40.7,
    yPercent: 47.0,
    arrowSide: "right",
    soundOrder: 2,
    role: "Dẫn sóng âm đến màng nhĩ. Không khí trong ống tai thông với bên ngoài, nên áp suất ở đây bằng áp suất khí quyển bên ngoài.",
    details: "Đường ống dài khoảng 2.5 cm dẫn từ vành tai đến màng nhĩ. Vì thông thẳng ra khí quyển, nên khi máy bay cất cánh hoặc hạ cánh, áp suất trong ống tai biến đổi tức thì theo môi trường bên ngoài."
  },
  {
    id: 3,
    name: "Màng nhĩ",
    latin: "Tympanic Membrane",
    badgeTitle: "Màng nhĩ",
    badgeDesc: "Ngăn ống tai và tai giữa",
    color: "#ec4899",
    colorLight: "#f472b6",
    xPercent: 52.3,
    yPercent: 47.0,
    arrowSide: "right",
    soundOrder: 3,
    role: "Màng mỏng ngăn cách ống tai với tai giữa, rung động khi có sóng âm. Một mặt chịu áp suất từ ống tai (áp suất ngoài), mặt kia chịu áp suất từ tai giữa. Nếu áp suất hai mặt chênh lệch đột ngột, màng nhĩ bị đẩy về phía có áp suất nhỏ hơn.",
    details: "Màng nhĩ hình nón mỏng trong suốt, cực kỳ nhạy cảm với dao động sóng âm. Khi áp suất hai bên mất cân bằng (ví dụ ngoài 101 kPa, trong 80 kPa), màng nhĩ bị căng phồng hoặc lõm sâu gây cảm giác đau tức và tiếng động/ù tai."
  },
  {
    id: 4,
    name: "Chuỗi xương con",
    latin: "Auditory Ossicles (Búa - Đe - Bàn đạp)",
    badgeTitle: "Chuỗi xương con",
    badgeDesc: "búa • đe • bàn đạp",
    color: "#a855f7",
    colorLight: "#c084fc",
    xPercent: 59.3,
    yPercent: 45.9,
    arrowSide: "bottom", // starts from bottom edge of top-center badge
    soundOrder: 4,
    role: "Ba xương nhỏ nhất cơ thể nằm trong tai giữa. Nhận rung động từ màng nhĩ rồi truyền vào tai trong.",
    details: "Gồm xương búa (malleus), xương đe (incus) và xương bàn đạp (stapes). Chuỗi xương này hoạt động như một hệ đòn bẩy khuếch đại lực rung động của màng nhĩ lên gấp hơn 20 lần trước khi tác động vào dịch tai trong."
  },
  {
    id: 5,
    name: "Dây thần kinh thính giác",
    latin: "Auditory Nerve (Dây VIII)",
    badgeTitle: "Dây thần kinh thính giác",
    badgeDesc: "Dẫn tín hiệu lên não",
    color: "#ea580c",
    colorLight: "#fb923c",
    xPercent: 70.2,
    yPercent: 43.1,
    arrowSide: "left", // starts from left edge of right badges
    soundOrder: 6,
    role: "Nhận tín hiệu từ ốc tai. Truyền tín hiệu lên não để ta nhận biết âm thanh.",
    details: "Bó sợi thần kinh cảm giác truyền các tín hiệu điện với tốc độ cực nhanh từ ốc tai về trung tâm thính giác ở vỏ não, nơi tín hiệu được giải mã thành âm thanh ta nghe và hiểu được."
  },
  {
    id: 6,
    name: "Ốc tai",
    latin: "Cochlea",
    badgeTitle: "Ốc tai",
    badgeDesc: "Tai trong",
    color: "#10b981",
    colorLight: "#34d399",
    xPercent: 73.2,
    yPercent: 49.8,
    arrowSide: "left",
    soundOrder: 5,
    role: "Nằm ở tai trong, có hình xoắn ốc chứa dịch. Biến rung động thành tín hiệu thần kinh.",
    details: "Cơ quan thính giác chính chứa đầy chất dịch và hàng nghìn tế bào lông cảm thụ tinh vi. Dao động của xương bàn đạp tạo ra sóng dịch kích thích tế bào lông phát ra các xung điện sinh học."
  },
  {
    id: 7,
    name: "Vòi tai (Vòi nhĩ)",
    latin: "Eustachian Tube",
    badgeTitle: "Vòi tai",
    badgeDesc: "Cân bằng áp suất",
    color: "#06b6d4",
    colorLight: "#22d3ee",
    xPercent: 76.6,
    yPercent: 68.5,
    arrowSide: "left",
    soundOrder: 0,
    role: "Ống nối tai giữa với vòm mũi – họng. Có nhiệm vụ điều hòa và cân bằng áp suất hai bên màng nhĩ. Thường đóng; khi nuốt hoặc ngáp thì mở rộng cho không khí đi vào (hoặc ra) tai giữa.",
    details: "Ống dài khoảng 3.5 cm nối hòm nhĩ với họng mũi. Đây là 'chiếc van an toàn' của tai. Bình thường vòi đóng kín để vi khuẩn từ họng không tràn lên tai. Khi nuốt nước bọt hoặc ngáp, cơ mở vòi co lại giúp khí tràn vào cân bằng áp suất!"
  }
];

class EarSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.viewport = document.getElementById('ear3DViewport');
    this.stageEl = document.getElementById('ear3DStage');
    this.modelContainer = document.getElementById('ear3DModelContainer');
    this.calloutsContainer = document.getElementById('earCalloutsContainer');

    // 2D Zoom State
    this.zoom = 1.0; // 0.75 to 1.8

    // Annotations visibility (HUD toggle)
    this.showCallouts = true;

    // Sub-mode: 'anatomy' (Tìm hiểu bộ phận) or 'pressure' (Máy bay cất/hạ cánh)
    this.subMode = 'anatomy';

    // Exploration tracker
    this.exploredParts = new Set();
    this.selectedPartId = null;
    this.unlockedFlightMode = false;

    // Flight Scenario: 'landing' (Hạ cánh) or 'takeoff' (Cất cánh)
    this.flightType = 'landing';

    // Flight Pressure Stages: 1 = Cân bằng, 2 = Áp suất đổi, 3 = Tiếng động, 4 = Nuốt/ngáp
    this.stage = 1;
    this.pOuter = 80;
    this.pInner = 80;
    this.eardrumDeform = 0; // 0 = flat, +1 = deformed
    this.targetDeform = 0;
    this.isEqualized = false; // true when student pressed Nuốt/Ngáp in stage 4

    // Eustachian Tube Airflow State
    this.isEustachianOpen = false;
    this.eustachianParticles = [];
    this.initEustachianParticles(30);

    // Sound wave traveling animation
    this.isAcousticPlaying = false;
    this.acousticProgress = 0;

    this.bindEvents();
    this.resize();
    this.updateTransform();
    this.initView();
    this.startLoop();
  }

  initEustachianParticles(count) {
    this.eustachianParticles = [];
    for (let i = 0; i < count; i++) {
      this.eustachianParticles.push({
        progress: Math.random(),
        offset: (Math.random() - 0.5) * 7.0, // slight offset across tube lumen width
        speed: 0.7 + Math.random() * 0.5,
        size: 2.2 + Math.random() * 1.8
      });
    }
  }

  resize() {
    if (!this.canvas || !this.viewport) return;
    const rect = this.viewport.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  // -------------------------------------------------------------
  // 2D VIEW CONTROLS (Chú thích, Zoom +, Zoom -, 100%)
  // -------------------------------------------------------------
  toggleAnnotations() {
    this.showCallouts = !this.showCallouts;
    const btn = document.getElementById('btnToggleAnnotations');
    if (btn) {
      if (this.showCallouts) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
    if (this.calloutsContainer) {
      if (this.showCallouts) {
        this.calloutsContainer.classList.remove('hidden');
      } else {
        this.calloutsContainer.classList.add('hidden');
      }
    }
    if (window.sound) window.sound.playClick();
  }

  zoomIn() {
    this.zoom = Math.min(1.8, this.zoom + 0.15);
    this.updateTransform();
    if (window.sound) window.sound.playClick();
  }

  zoomOut() {
    this.zoom = Math.max(0.75, this.zoom - 0.15);
    this.updateTransform();
    if (window.sound) window.sound.playClick();
  }

  resetZoom() {
    this.zoom = 1.0;
    this.updateTransform();
    if (window.sound) window.sound.playClick();
  }

  updateTransform() {
    if (!this.stageEl) return;
    this.stageEl.style.transform = `scale(${this.zoom.toFixed(3)})`;
  }

  // Backwards compatibility for app.js calls
  update3DTransform() {
    this.updateTransform();
  }

  // -------------------------------------------------------------
  // INITIAL VIEW (Khởi đầu sạch: 0/7 hoàn thành, chưa chọn điểm nào)
  // -------------------------------------------------------------
  initView() {
    this.selectedPartId = null;
    this.exploredParts = new Set();
    this.unlockedFlightMode = false;

    const banner = document.getElementById('earPartInfoBanner');
    const bNum = document.getElementById('bannerPartNum');
    const bTitle = document.getElementById('bannerPartTitle');
    const bLatin = document.getElementById('bannerPartLatin');
    const bRole = document.getElementById('bannerPartRole');
    const bDetails = document.getElementById('bannerPartDetails');
    const nextBtn = document.getElementById('btnBannerNextPart');
    const progressBadge = document.getElementById('earProgressBadge');
    const progressBar = document.getElementById('earProgressBar');
    const progressText = document.getElementById('earProgressText');
    const unlockAlert = document.getElementById('flightUnlockedAlert');
    const lockBadge = document.getElementById('flightLockBadge');

    if (banner) {
      banner.classList.remove('hidden');
      banner.style.borderTopColor = '#38bdf8';
    }
    if (bNum) {
      bNum.textContent = '👉';
      bNum.style.background = '#0284c7';
      bNum.style.color = '#ffffff';
    }
    if (bTitle) bTitle.textContent = 'Khám Phá 7 Bộ Phận Của Tai';
    if (bLatin) bLatin.textContent = 'Bấm vào điểm (1 - 7) trên mô hình để bắt đầu';
    if (bRole) bRole.textContent = 'Hãy bấm vào các điểm số (1 - 7) trên mô hình giải phẫu tai để tìm hiểu cấu tạo và chức năng từng bộ phận!';
    if (bDetails) bDetails.textContent = 'Đường truyền âm thanh: Vành tai → Ống tai → Rung màng nhĩ → Chuỗi xương con → Ốc tai → Dây thần kinh thính giác → Não.';
    if (nextBtn) {
      nextBtn.innerHTML = '<span>Bắt đầu: 1. Vành tai →</span>';
      nextBtn.onclick = () => this.selectPart(1);
    }

    if (progressBadge) progressBadge.textContent = '0 / 7 bộ phận';
    if (progressText) progressText.textContent = '0 / 7 hoàn thành';
    if (progressBar) progressBar.style.width = '0%';
    if (unlockAlert) unlockAlert.classList.add('hidden');
    if (lockBadge) lockBadge.classList.remove('hidden');

    // Đảm bảo không có điểm hay nhãn nào bị tích hoàn thành trước
    EAR_PARTS.forEach(p => {
      const badgeCheck = document.getElementById(`badgeCheck-${p.id}`);
      if (badgeCheck) badgeCheck.classList.add('hidden');

      const bEl = document.getElementById(`earBadge-${p.id}`);
      if (bEl) bEl.classList.remove('active');

      const pinEl = document.getElementById(`earPin-${p.id}`);
      if (pinEl) pinEl.classList.remove('active');

      const itemEl = document.getElementById(`partStatus-${p.id}`);
      if (itemEl) {
        itemEl.className = "part-status-item p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-between transition";
        const checkEl = itemEl.querySelector('.part-check');
        if (checkEl) {
          checkEl.textContent = '○';
          checkEl.className = 'part-check font-bold text-xs text-slate-400';
        }
      }
    });
  }

  // -------------------------------------------------------------
  // ANATOMY SELECTION & TRACKING (Bấm vào bộ phận hiện thông tin)
  // -------------------------------------------------------------
  selectPart(id) {
    this.selectedPartId = id;
    this.exploredParts.add(id);

    const part = EAR_PARTS.find(p => p.id === id);
    if (!part) return;

    // Show checkmark on the perimeter HUD badge
    const badgeCheck = document.getElementById(`badgeCheck-${id}`);
    if (badgeCheck) badgeCheck.classList.remove('hidden');

    // Highlight active perimeter badge
    EAR_PARTS.forEach(p => {
      const bEl = document.getElementById(`earBadge-${p.id}`);
      if (bEl) {
        if (p.id === id) {
          bEl.classList.add('active');
        } else {
          bEl.classList.remove('active');
        }
      }

      // Highlight active pin on the diagram
      const pinEl = document.getElementById(`earPin-${p.id}`);
      if (pinEl) {
        if (p.id === id) {
          pinEl.classList.add('active');
        } else {
          pinEl.classList.remove('active');
        }
      }
    });

    // 1. Update Below-Diagram Information Banner (Immediate, clear & non-overlapping)
    const banner = document.getElementById('earPartInfoBanner');
    const bNum = document.getElementById('bannerPartNum');
    const bTitle = document.getElementById('bannerPartTitle');
    const bLatin = document.getElementById('bannerPartLatin');
    const bRole = document.getElementById('bannerPartRole');
    const bDetails = document.getElementById('bannerPartDetails');
    const nextBtn = document.getElementById('btnBannerNextPart');

    if (banner && this.subMode === 'anatomy') {
      banner.classList.remove('hidden');
      banner.style.borderTopColor = part.color;
    }
    if (bNum) {
      bNum.textContent = part.id;
      bNum.style.background = part.color;
    }
    if (bTitle) bTitle.textContent = `${part.id}. ${part.name}`;
    if (bLatin) bLatin.textContent = part.latin;
    if (bRole) bRole.textContent = part.role;
    if (bDetails) bDetails.textContent = part.details;
    if (nextBtn) {
      const nextId = (id % 7) + 1;
      const nextPart = EAR_PARTS.find(p => p.id === nextId);
      nextBtn.innerHTML = `<span>Tiếp theo: ${nextPart ? nextPart.name : ''} →</span>`;
    }

    // 2. Update Progress Tracking Checklist in Right Sidebar (Chỉ hiển thị trạng thái đã hoàn thành)
    const progressBadge = document.getElementById('earProgressBadge');
    const progressBar = document.getElementById('earProgressBar');
    const progressText = document.getElementById('earProgressText');

    const count = this.exploredParts.size;
    if (progressBadge) progressBadge.textContent = `${count} / 7 bộ phận`;
    if (progressText) progressText.textContent = `${count} / 7 hoàn thành`;
    if (progressBar) progressBar.style.width = `${(count / 7) * 100}%`;

    // Cập nhật trạng thái từng bộ phận trong danh sách theo dõi
    EAR_PARTS.forEach(p => {
      const itemEl = document.getElementById(`partStatus-${p.id}`);
      if (!itemEl) return;
      const checkEl = itemEl.querySelector('.part-check');

      const isExplored = this.exploredParts.has(p.id);
      const isSelected = (p.id === id);

      if (isExplored) {
        if (checkEl) {
          checkEl.textContent = "✓";
          checkEl.className = "part-check font-bold text-xs text-emerald-600";
        }
      } else {
        if (checkEl) {
          checkEl.textContent = "○";
          checkEl.className = "part-check font-bold text-xs text-slate-400";
        }
      }

      if (isSelected) {
        itemEl.className = isExplored
          ? "part-status-item p-2 rounded-xl border-2 border-sky-500 bg-sky-50 text-sky-950 font-bold flex items-center justify-between transition shadow-sm"
          : "part-status-item p-2 rounded-xl border-2 border-sky-400 bg-sky-50/50 text-sky-900 font-semibold flex items-center justify-between transition";
      } else if (isExplored) {
        itemEl.className = "part-status-item p-2 rounded-xl border border-emerald-300 bg-emerald-50/70 text-emerald-950 font-semibold flex items-center justify-between transition";
      } else {
        itemEl.className = "part-status-item p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-between transition";
      }
    });

    // Check if finished all 7
    if (count === 7 && !this.unlockedFlightMode) {
      this.unlockedFlightMode = true;
      const unlockAlert = document.getElementById('flightUnlockedAlert');
      const lockBadge = document.getElementById('flightLockBadge');
      if (unlockAlert) unlockAlert.classList.remove('hidden');
      if (lockBadge) lockBadge.classList.add('hidden');
      if (window.sound) window.sound.playSuccess();
    } else {
      if (window.sound) window.sound.playClick();
    }
  }

  nextPart() {
    const nextId = this.selectedPartId ? (this.selectedPartId % 7) + 1 : 1;
    this.selectPart(nextId);
  }

  // Switch between Anatomy mode and Flight Pressure mode
  setSubMode(mode) {
    if (mode === 'pressure' && !this.unlockedFlightMode) {
      alert('Vui lòng bấm tìm hiểu đủ 7 bộ phận của tai trước khi chuyển sang bước mô phỏng máy bay cất/hạ cánh!');
      return;
    }

    this.subMode = mode;
    const btnAnatomy = document.getElementById('subTabAnatomy');
    const btnPressure = document.getElementById('subTabPressure');
    const panelAnatomy = document.getElementById('panelAnatomyCard');
    const panelPressure = document.getElementById('panelPressureCard');
    const banner = document.getElementById('earPartInfoBanner');

    if (mode === 'anatomy') {
      if (btnAnatomy) btnAnatomy.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs shadow-sm transition";
      if (btnPressure) btnPressure.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition";
      if (panelAnatomy) panelAnatomy.classList.remove('hidden');
      if (panelPressure) panelPressure.classList.add('hidden');
      if (banner) banner.classList.remove('hidden');
    } else {
      if (btnAnatomy) btnAnatomy.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition";
      if (btnPressure) btnPressure.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-sm transition";
      if (panelAnatomy) panelAnatomy.classList.add('hidden');
      if (panelPressure) panelPressure.classList.remove('hidden');
      if (banner) banner.classList.add('hidden');

      this.setStage(1);
    }

    if (window.lucide) window.lucide.createIcons();
    if (window.sound) window.sound.playClick();
  }

  // Play traveling acoustic sound wave animation
  playAcousticWave() {
    this.isAcousticPlaying = true;
    this.acousticProgress = 0;
    if (window.sound) window.sound.playAcousticSequence();
  }

  // -------------------------------------------------------------
  // FLIGHT PRESSURE MODE: CẤT CÁNH / HẠ CÁNH (TAKEOFF / LANDING)
  // -------------------------------------------------------------
  setFlightType(type) {
    this.flightType = type;
    const btnTakeoff = document.getElementById('btnFlightTakeoff');
    const btnLanding = document.getElementById('btnFlightLanding');

    if (type === 'takeoff') {
      if (btnTakeoff) {
        btnTakeoff.className = "flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 bg-amber-500 text-slate-950 shadow-sm";
      }
      if (btnLanding) {
        btnLanding.className = "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200";
      }
    } else {
      if (btnTakeoff) {
        btnTakeoff.className = "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200";
      }
      if (btnLanding) {
        btnLanding.className = "flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 bg-sky-600 text-white shadow-sm";
      }
    }

    // Update Stage 1 & 2 Button text based on type
    const s1Text = document.getElementById('stageText-1');
    const s2Text = document.getElementById('stageText-2');
    if (s1Text) s1Text.textContent = type === 'takeoff' ? "1️⃣ Cân bằng (Mặt đất)" : "1️⃣ Cân bằng (Trên cao)";
    if (s2Text) s2Text.textContent = type === 'takeoff' ? "2️⃣ Cất cánh (Áp suất đổi)" : "2️⃣ Hạ cánh (Áp suất đổi)";

    this.setStage(1);
    if (window.sound) window.sound.playClick();
    if (window.lucide) window.lucide.createIcons();
  }

  prevStage() {
    if (this.stage > 1) {
      this.setStage(this.stage - 1);
      if (window.sound) window.sound.playClick();
    }
  }

  nextStage() {
    if (this.stage < 4) {
      this.setStage(this.stage + 1);
      if (window.sound) window.sound.playClick();
    }
  }

  setStage(stageNum) {
    this.stage = stageNum;
    this.isEustachianOpen = false;

    // Reset equalized state if entering earlier stages
    if (stageNum < 4) {
      this.isEqualized = false;
    }

    const stageTitle = document.getElementById('flightStageTitle');
    const stageDesc = document.getElementById('flightStageDesc');
    const swallowBtn = document.getElementById('swallowActionBtn');
    const stepIndicator = document.getElementById('stageStepIndicator');
    const btnPrev = document.getElementById('btnPrevStage');
    const btnNext = document.getElementById('btnNextStage');

    // Update Step Indicator
    if (stepIndicator) stepIndicator.textContent = `Giai đoạn ${stageNum} / 4`;
    if (btnPrev) btnPrev.disabled = (stageNum <= 1);
    if (btnNext) btnNext.disabled = (stageNum >= 4);

    // Update active stage buttons
    document.querySelectorAll('.stage-step-btn').forEach((btn, idx) => {
      if (idx + 1 === stageNum) {
        btn.classList.add('bg-amber-100', 'border-amber-400', 'text-amber-950', 'font-bold');
      } else {
        btn.classList.remove('bg-amber-100', 'border-amber-400', 'text-amber-950', 'font-bold');
      }
    });

    if (this.flightType === 'takeoff') {
      // ==========================================
      // KỊCH BẢN CẤT CÁNH (TAKEOFF): 101 -> 80 kPa
      // Áp suất ngoài giảm đột ngột -> màng nhĩ bị đẩy phồng LỒI RA NGOÀI!
      // ==========================================
      if (stageNum === 1) {
        // 1. Cân bằng ở mặt đất (101 = 101 kPa)
        this.pOuter = 101;
        this.pInner = 101;
        this.targetDeform = 0;

        if (stageTitle) stageTitle.textContent = "1. Cân bằng: Máy bay ở mặt đất";
        if (stageDesc) stageDesc.textContent = "Tại sân bay mặt đất, áp suất không khí khoảng 101 kPa. Áp suất hai bên màng nhĩ bằng nhau (101 kPa = 101 kPa), màng nhĩ ở vị trí cân bằng phẳng, vòi tai đóng. Ta nghe bình thường.";
        if (swallowBtn) {
          swallowBtn.disabled = true;
          swallowBtn.className = "w-full py-3 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-not-allowed";
          swallowBtn.innerHTML = '<span>🗣️ NUỐT / NGÁP (Mở vòi tai cân bằng lại áp suất)</span>';
        }

      } else if (stageNum === 2) {
        // 2. Cất cánh: độ cao tăng nhanh, áp suất ngoài giảm đột ngột xuống 80 kPa
        this.pOuter = 80;
        this.pInner = 101;
        this.targetDeform = 0.5; // Starts bulging outward!

        if (stageTitle) stageTitle.textContent = "2. Cất cánh: Máy bay lên cao, áp suất ngoài giảm đột ngột";
        if (stageDesc) stageDesc.textContent = "Máy bay lấy độ cao rất nhanh nên áp suất không khí bên ngoài (trong ống tai) giảm từ 101 xuống 80 kPa. Vòi tai chưa phản ứng kịp nên áp suất trong tai giữa vẫn còn 101 kPa.";
        if (swallowBtn) {
          swallowBtn.disabled = true;
          swallowBtn.className = "w-full py-3 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-not-allowed";
          swallowBtn.innerHTML = '<span>🗣️ NUỐT / NGÁP (Mở vòi tai cân bằng lại áp suất)</span>';
        }

      } else if (stageNum === 3) {
        // 3. Tiếng động / Ù tai: Trong > Ngoài -> màng nhĩ bị đẩy lồi ra ngoài!
        this.pOuter = 80;
        this.pInner = 101;
        this.targetDeform = 1.0; // Bulges heavily outward (to the left toward canal)

        if (stageTitle) stageTitle.textContent = "3. Tiếng động: Mất cân bằng áp suất → tiếng động trong tai";
        if (stageDesc) stageDesc.textContent = "Áp suất ngoài (80 kPa) nhỏ hơn áp suất trong (101 kPa), lực ép từ bên trong đẩy màng nhĩ phồng lồi ra phía ngoài ống tai! Màng nhĩ bị căng phồng gây nên tiếng động lạo xạo hoặc triệu chứng ù tai, tức tai!";
        if (swallowBtn) {
          swallowBtn.disabled = true;
          swallowBtn.className = "w-full py-3 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-not-allowed";
          swallowBtn.innerHTML = '<span>🗣️ NUỐT / NGÁP (Mở vòi tai cân bằng lại áp suất)</span>';
        }

        if (window.sound) window.sound.playEarPop();

      } else if (stageNum === 4) {
        // 4. Nuốt / Ngáp: Chờ học sinh bấm nút Nuốt/Ngáp màu xanh!
        if (!this.isEqualized) {
          this.pOuter = 80;
          this.pInner = 101;
          this.targetDeform = 1.0;

          if (stageTitle) stageTitle.textContent = "4. Nuốt / ngáp: Mở vòi tai để cân bằng lại áp suất";
          if (stageDesc) stageDesc.textContent = "👉 Vòi tai đang đóng nên khí chưa thoát ra được, màng nhĩ vẫn bị đẩy phồng lồi ra ngoài. Hãy bấm nút NUỐT / NGÁP màu xanh bên dưới để mở vòi tai, cho khí thừa thoát ra vòm họng cân bằng áp suất!";
          if (swallowBtn) {
            swallowBtn.disabled = false;
            swallowBtn.className = "w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg ring-4 ring-emerald-300 animate-pulse transition flex items-center justify-center gap-2 cursor-pointer";
            swallowBtn.innerHTML = '<span>🟢 BẤM VÀO ĐÂY ĐỂ NUỐT / NGÁP (Mở vòi tai)</span>';
          }
        } else {
          this.pOuter = 80;
          this.pInner = 80;
          this.targetDeform = 0;
          if (stageTitle) stageTitle.textContent = "4. Nuốt / ngáp: Đã cân bằng áp suất thành công!";
          if (stageDesc) stageDesc.textContent = "🎉 Vòi tai mở rộng, khí thừa từ tai giữa thoát xuống vòm họng đưa áp suất về 80 kPa = 80 kPa. Màng nhĩ bật phẳng trở lại, tiếng ù tai biến mất!";
        }
      }

    } else {
      // ==========================================
      // KỊCH BẢN HẠ CÁNH (LANDING): 80 -> 101 kPa
      // Áp suất ngoài tăng đột ngột -> màng nhĩ bị đẩy LÕM VÀO TRONG!
      // ==========================================
      if (stageNum === 1) {
        // 1. Cân bằng trên cao (80 = 80 kPa)
        this.pOuter = 80;
        this.pInner = 80;
        this.targetDeform = 0;

        if (stageTitle) stageTitle.textContent = "1. Cân bằng: Máy bay bay ổn định trên cao";
        if (stageDesc) stageDesc.textContent = "Trong khoang máy bay trên cao, áp suất khoảng 80 kPa. Áp suất hai bên màng nhĩ bằng nhau (80 kPa = 80 kPa), màng nhĩ ở vị trí cân bằng phẳng, vòi tai đang đóng. Ta nghe bình thường.";
        if (swallowBtn) {
          swallowBtn.disabled = true;
          swallowBtn.className = "w-full py-3 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-not-allowed";
          swallowBtn.innerHTML = '<span>🗣️ NUỐT / NGÁP (Mở vòi tai cân bằng lại áp suất)</span>';
        }

      } else if (stageNum === 2) {
        // 2. Hạ cánh: độ cao giảm nhanh, áp suất ngoài tăng lên 101 kPa
        this.pOuter = 101;
        this.pInner = 80;
        this.targetDeform = 0.5; // Starts pressing inward

        if (stageTitle) stageTitle.textContent = "2. Áp suất đổi: Máy bay hạ cánh, áp suất ngoài tăng đột ngột";
        if (stageDesc) stageDesc.textContent = "Máy bay giảm độ cao rất nhanh nên áp suất không khí bên ngoài (trong ống tai) tăng từ 80 lên 101 kPa. Vòi tai chưa phản ứng kịp nên áp suất trong tai giữa vẫn còn 80 kPa.";
        if (swallowBtn) {
          swallowBtn.disabled = true;
          swallowBtn.className = "w-full py-3 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-not-allowed";
          swallowBtn.innerHTML = '<span>🗣️ NUỐT / NGÁP (Mở vòi tai cân bằng lại áp suất)</span>';
        }

      } else if (stageNum === 3) {
        // 3. Tiếng động / Ù tai: Ngoài > Trong -> màng nhĩ bị đẩy lõm vào trong!
        this.pOuter = 101;
        this.pInner = 80;
        this.targetDeform = 1.0; // Heavily concave into middle ear

        if (stageTitle) stageTitle.textContent = "3. Tiếng động: Mất cân bằng áp suất → tiếng động trong tai";
        if (stageDesc) stageDesc.textContent = "Áp suất ngoài (101 kPa) lớn hơn áp suất trong (80 kPa), màng nhĩ đột ngột bị đẩy võng sâu vào phía trong tai giữa! Màng nhĩ bị căng lõm gây tiếng động hoặc triệu chứng ù tai, căng tức tai!";
        if (swallowBtn) {
          swallowBtn.disabled = true;
          swallowBtn.className = "w-full py-3 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-not-allowed";
          swallowBtn.innerHTML = '<span>🗣️ NUỐT / NGÁP (Mở vòi tai cân bằng lại áp suất)</span>';
        }

        if (window.sound) window.sound.playEarPop();

      } else if (stageNum === 4) {
        // 4. Nuốt / Ngáp: Chờ học sinh bấm nút Nuốt/Ngáp màu xanh!
        if (!this.isEqualized) {
          this.pOuter = 101;
          this.pInner = 80;
          this.targetDeform = 1.0;

          if (stageTitle) stageTitle.textContent = "4. Nuốt / ngáp: Mở vòi tai để cân bằng lại áp suất";
          if (stageDesc) stageDesc.textContent = "👉 Vòi tai đang đóng nên áp suất ngoài lớn hơn vẫn ép màng nhĩ lõm vào trong. Hãy bấm nút NUỐT / NGÁP màu xanh bên dưới để mở vòi tai, cho không khí từ vòm họng tràn vào tai giữa cân bằng áp suất!";
          if (swallowBtn) {
            swallowBtn.disabled = false;
            swallowBtn.className = "w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg ring-4 ring-emerald-300 animate-pulse transition flex items-center justify-center gap-2 cursor-pointer";
            swallowBtn.innerHTML = '<span>🟢 BẤM VÀO ĐÂY ĐỂ NUỐT / NGÁP (Mở vòi tai)</span>';
          }
        } else {
          this.pOuter = 101;
          this.pInner = 101;
          this.targetDeform = 0;
          if (stageTitle) stageTitle.textContent = "4. Nuốt / ngáp: Đã cân bằng áp suất thành công!";
          if (stageDesc) stageDesc.textContent = "🎉 Vòi tai mở rộng! Không khí từ vòm họng tràn vào tai giữa, đưa áp suất tai giữa lên bằng 101 kPa. Màng nhĩ bật phẳng trở lại, tiếng ù tai biến mất!";
        }
      }
    }

    this.updatePressureTelemetry();
  }

  // Action: Nuốt hoặc Ngáp (Triggered when student clicks the green button in stage 4)
  doSwallowOrYawn() {
    this.stage = 4;
    this.isEqualized = true;
    this.isEustachianOpen = true;

    // Equalize inner pressure to outer pressure!
    this.pInner = this.pOuter;
    this.targetDeform = 0; // Springs back to flat

    const stageTitle = document.getElementById('flightStageTitle');
    const stageDesc = document.getElementById('flightStageDesc');
    const swallowBtn = document.getElementById('swallowActionBtn');

    if (stageTitle) stageTitle.textContent = "4. Nuốt / ngáp: Đã cân bằng áp suất thành công!";
    if (this.flightType === 'takeoff') {
      if (stageDesc) stageDesc.textContent = "🎉 Vòi tai mở rộng! Khí nén thừa trong tai giữa theo vòi tai thoát xuống vòm họng, đưa áp suất trong tai giữa về 80 kPa. Màng nhĩ bật phẳng trở lại vị trí ban đầu, tiếng ù tai biến mất!";
    } else {
      if (stageDesc) stageDesc.textContent = "🎉 Vòi tai mở rộng! Không khí từ vòm họng theo vòi tai tràn lên tai giữa, đưa áp suất trong tai giữa lên bằng 101 kPa. Màng nhĩ bật phẳng trở lại vị trí ban đầu, tiếng ù tai biến mất!";
    }

    if (swallowBtn) {
      swallowBtn.disabled = true;
      swallowBtn.className = "w-full py-3 rounded-xl bg-emerald-700 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-2";
      swallowBtn.innerHTML = '<span>✓ ĐÃ CÂN BẰNG ÁP SUẤT THÀNH CÔNG!</span>';
    }

    // Play swallow sound followed by ear pop chime
    if (window.sound) {
      window.sound.playSwallow();
      setTimeout(() => {
        window.sound.playEarPop();
        window.sound.playSuccess();
      }, 250);
    }

    this.updatePressureTelemetry();

    // After 3.2 seconds, Eustachian tube naturally closes again
    setTimeout(() => {
      this.isEustachianOpen = false;
    }, 3200);
  }

  updatePressureTelemetry() {
    const outerPText = document.getElementById('flightOuterP');
    const innerPText = document.getElementById('flightInnerP');
    const deltaPText = document.getElementById('flightDeltaP');
    const eardrumStateBadge = document.getElementById('eardrumStateBadge');

    const delta = this.pOuter - this.pInner;

    if (outerPText) outerPText.textContent = `${this.pOuter} kPa`;
    if (innerPText) innerPText.textContent = `${this.pInner} kPa`;
    if (deltaPText) {
      deltaPText.textContent = `${delta > 0 ? '+' : ''}${delta} kPa`;
      deltaPText.className = Math.abs(delta) > 5 ? "font-mono font-bold text-rose-600" : "font-mono font-bold text-emerald-600";
    }

    if (eardrumStateBadge) {
      if (Math.abs(delta) < 2) {
        eardrumStateBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
        eardrumStateBadge.textContent = "Màng nhĩ: Cân bằng phẳng (Bình thường)";
      } else if (delta > 0) {
        eardrumStateBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300";
        eardrumStateBadge.textContent = "Màng nhĩ: Bị đẩy lõm vào trong (Hạ cánh)";
      } else {
        eardrumStateBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300";
        eardrumStateBadge.textContent = "Màng nhĩ: Bị phồng lồi ra ngoài (Cất cánh)";
      }
    }
  }

  // -------------------------------------------------------------
  // ANATOMICAL CURVED EUSTACHIAN TUBE AIRFLOW INTERPOLATION
  // -------------------------------------------------------------
  getTubePoint(progress, direction = 'landing') {
    if (!this.canvas) return null;
    const canvasRect = this.canvas.getBoundingClientRect();
    const container = this.modelContainer || document.getElementById('ear3DModelContainer');
    if (!container) return null;
    const cRect = container.getBoundingClientRect();

    // 8 Spline percentage points following the exact mucosal lumen of Eustachian tube on ear_model.jpg
    const tubeSpline = [
      { x: 85.6, y: 87.4 }, // 0: Cuối vòi tai (lỗ hầu vòi tai ở vòm họng)
      { x: 82.9, y: 79.7 }, // 1: Đoạn dưới vòi tai
      { x: 78.6, y: 72.7 }, // 2: Đoạn giữa dưới
      { x: 73.2, y: 65.7 }, // 3: Đoạn giữa vòi tai
      { x: 67.1, y: 58.7 }, // 4: Đoạn giữa trên
      { x: 61.0, y: 52.4 }, // 5: Cửa vào hòm nhĩ (tai giữa)
      { x: 56.2, y: 48.7 }, // 6: Khoang hòm nhĩ
      { x: 53.1, y: 47.0 }  // 7: Mặt trong màng nhĩ
    ];

    // Direction:
    // 'landing': from nasopharynx (pt 0) up to eardrum (pt 7)
    // 'takeoff': from eardrum (pt 7) down to nasopharynx (pt 0)
    const pts = (direction === 'takeoff') ? [...tubeSpline].reverse() : tubeSpline;

    // Convert to canvas coordinates
    const canvasPts = pts.map(p => ({
      x: cRect.left - canvasRect.left + (p.x / 100) * cRect.width,
      y: cRect.top - canvasRect.top + (p.y / 100) * cRect.height
    }));

    // Calculate segment lengths
    const segLens = [];
    let totalLen = 0;
    for (let i = 0; i < canvasPts.length - 1; i++) {
      const d = Math.hypot(canvasPts[i+1].x - canvasPts[i].x, canvasPts[i+1].y - canvasPts[i].y);
      segLens.push(d);
      totalLen += d;
    }
    if (totalLen === 0) return null;

    // Target distance
    const tDist = Math.max(0, Math.min(1, progress)) * totalLen;
    let accumulated = 0;

    for (let i = 0; i < segLens.length; i++) {
      const d = segLens[i];
      if (accumulated + d >= tDist || i === segLens.length - 1) {
        const segT = d > 0 ? (tDist - accumulated) / d : 0;
        const p1 = canvasPts[i];
        const p2 = canvasPts[i+1];
        return {
          x: p1.x + (p2.x - p1.x) * segT,
          y: p1.y + (p2.y - p1.y) * segT,
          angle: Math.atan2(p2.y - p1.y, p2.x - p1.x)
        };
      }
      accumulated += d;
    }
    return canvasPts[canvasPts.length - 1];
  }

  // Draw glowing curved Eustachian tube lumen and animated air particles
  drawCurvedEustachianTube(ctx, canvasRect) {
    const container = this.modelContainer || document.getElementById('ear3DModelContainer');
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    const tubeSpline = [
      { x: 85.6, y: 87.4 },
      { x: 82.9, y: 79.7 },
      { x: 78.6, y: 72.7 },
      { x: 73.2, y: 65.7 },
      { x: 67.1, y: 58.7 },
      { x: 61.0, y: 52.4 },
      { x: 56.2, y: 48.7 },
      { x: 53.1, y: 47.0 }
    ];

    const canvasPts = tubeSpline.map(p => ({
      x: cRect.left - canvasRect.left + (p.x / 100) * cRect.width,
      y: cRect.top - canvasRect.top + (p.y / 100) * cRect.height
    }));

    ctx.save();

    // 1. Outer translucent green glow following the exact curve of the tube
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.25)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    canvasPts.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // 2. Inner core line following the tube lumen curve
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4.5;
    ctx.stroke();

    // 3. Flowing air particles traveling along the curved anatomical shape of the tube
    this.eustachianParticles.forEach(p => {
      const ptInfo = this.getTubePoint(p.progress, this.flightType);
      if (!ptInfo) return;

      // Perpendicular offset within tube lumen
      const perpX = -Math.sin(ptInfo.angle) * p.offset;
      const perpY = Math.cos(ptInfo.angle) * p.offset;
      const px = ptInfo.x + perpX;
      const py = ptInfo.y + perpY;

      // Glow halo
      ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
      ctx.beginPath();
      ctx.arc(px, py, p.size * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Bright white core bubble
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Directional label along the tube
    const midPt = canvasPts[3];
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    if (this.flightType === 'landing') {
      ctx.fillText('↑ Luồng khí tràn từ vòm họng vào tai giữa!', midPt.x + 14, midPt.y);
    } else {
      ctx.fillText('↓ Khí thừa từ tai giữa thoát xuống vòm họng!', midPt.x + 14, midPt.y);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // CANVAS RENDERING (Arrows, Sound Waves, Pressure Overlays)
  // -------------------------------------------------------------
  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    if (!ctx || !w || !h || !this.viewport) return;

    ctx.clearRect(0, 0, w, h);

    const canvasRect = this.canvas.getBoundingClientRect();

    // 1. Draw Multicolored Connecting Arrows to Pins
    if (this.showCallouts) {
      this.drawCalloutArrows(ctx, canvasRect);
    }

    // 2. Sound Wave Traveling Animation
    if (this.isAcousticPlaying) {
      this.drawAcousticWaveFlow(ctx, canvasRect);
    }

    // 3. Pressure mode overlays: Pressure vectors, Eardrum deformation & Eustachian airflow
    if (this.subMode === 'pressure') {
      this.drawPressureModeOverlays(ctx, canvasRect);
    }
  }

  // Draw vibrant multicolored arrows connecting perimeter badges to diagram pins
  drawCalloutArrows(ctx, canvasRect) {
    EAR_PARTS.forEach(part => {
      const badgeEl = document.getElementById(`earBadge-${part.id}`);
      const pinEl = document.getElementById(`earPin-${part.id}`);
      if (!badgeEl || !pinEl) return;

      const bRect = badgeEl.getBoundingClientRect();
      const pRect = pinEl.getBoundingClientRect();

      // Start coordinate on badge border
      let startX, startY;
      if (part.arrowSide === 'right') {
        startX = bRect.right - canvasRect.left;
        startY = bRect.top + bRect.height * 0.5 - canvasRect.top;
      } else if (part.arrowSide === 'bottom') {
        startX = bRect.left + bRect.width * 0.5 - canvasRect.left;
        startY = bRect.bottom - canvasRect.top;
      } else {
        // 'left'
        startX = bRect.left - canvasRect.left;
        startY = bRect.top + bRect.height * 0.5 - canvasRect.top;
      }

      // Pin center coordinate
      const pinX = pRect.left + pRect.width * 0.5 - canvasRect.left;
      const pinY = pRect.top + pRect.height * 0.5 - canvasRect.top;

      // Vector to pin
      const dx = pinX - startX;
      const dy = pinY - startY;
      const dist = Math.hypot(dx, dy);
      if (dist < 15) return; // Too close

      // Offset end by 14px so arrowhead meets the outer edge of pin
      const targetX = pinX - (dx / dist) * 14;
      const targetY = pinY - (dy / dist) * 14;

      const isSelected = (this.selectedPartId === part.id);
      const strokeColor = isSelected ? '#fbbf24' : (part.colorLight || part.color);

      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = strokeColor;
      ctx.lineWidth = isSelected ? 3.0 : 2.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw arrow line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Draw arrowhead triangle
      const headLen = isSelected ? 12 : 9.5;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(targetX, targetY);
      ctx.lineTo(
        targetX - headLen * Math.cos(angle - Math.PI / 6.5),
        targetY - headLen * Math.sin(angle - Math.PI / 6.5)
      );
      ctx.lineTo(
        targetX - headLen * Math.cos(angle + Math.PI / 6.5),
        targetY - headLen * Math.sin(angle + Math.PI / 6.5)
      );
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }

  // Draw acoustic traveling wave impulse through ear structures
  drawAcousticWaveFlow(ctx, canvasRect) {
    // Sound wave traveling path: 1. Vành tai -> 2. Ống tai -> 3. Màng nhĩ -> 4. Xương con -> 6. Ốc tai -> 5. Dây thần kinh
    const partOrder = [1, 2, 3, 4, 6, 5];
    const pts = [];

    partOrder.forEach(pid => {
      const pinEl = document.getElementById(`earPin-${pid}`);
      if (pinEl) {
        const r = pinEl.getBoundingClientRect();
        pts.push({
          x: r.left + r.width * 0.5 - canvasRect.left,
          y: r.top + r.height * 0.5 - canvasRect.top
        });
      }
    });

    if (pts.length < 2) return;

    ctx.save();

    // Draw sound wave line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    pts.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Traveling wave pulse
    const t = this.acousticProgress;
    const totalSegs = pts.length - 1;
    const currentSeg = Math.min(totalSegs - 1, Math.floor(t * totalSegs));
    const segT = (t * totalSegs) - currentSeg;

    const pA = pts[currentSeg];
    const pB = pts[currentSeg + 1];
    const waveX = pA.x + (pB.x - pA.x) * segT;
    const waveY = pA.y + (pB.y - pA.y) * segT;

    // Acoustic wave pulse
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(waveX, waveY, 7.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    ctx.restore();
  }

  // Draw pressure arrows and bulging eardrum in pressure simulation mode
  drawPressureModeOverlays(ctx, canvasRect) {
    const pin3 = document.getElementById('earPin-3'); // Màng nhĩ
    if (!pin3) return;

    const r3 = pin3.getBoundingClientRect();
    const eardrumX = r3.left + r3.width * 0.5 - canvasRect.left;
    const eardrumY = r3.top + r3.height * 0.5 - canvasRect.top;

    ctx.save();

    // 1. Bulging Eardrum curve
    // In Landing: outside > inside -> eardrum pushed inward (to the RIGHT toward middle ear)
    // In Takeoff: inside > outside -> eardrum pushed outward (to the LEFT toward canal)
    const deformDir = (this.flightType === 'takeoff') ? -1 : 1;
    const arcX = eardrumX + (this.eardrumDeform * deformDir * 22);

    ctx.strokeStyle = Math.abs(this.eardrumDeform) > 0.4 ? '#ef4444' : '#22c55e';
    ctx.lineWidth = 4.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(eardrumX, eardrumY - 26);
    ctx.quadraticCurveTo(arcX, eardrumY, eardrumX, eardrumY + 26);
    ctx.stroke();

    // 2. Pressure Vectors (Outside in Canal vs Inside in Middle ear)
    // Outside pressure vector (in canal, pushing inward towards eardrum):
    const outerLen = 35 * (this.pOuter / 101);
    ctx.strokeStyle = this.pOuter > 90 ? '#ef4444' : '#38bdf8';
    ctx.fillStyle = ctx.strokeStyle;
    this.drawArrow(ctx, eardrumX - outerLen - 12, eardrumY, eardrumX - 10, eardrumY, 6);

    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(`${this.pOuter} kPa`, eardrumX - outerLen - 20, eardrumY - 10);

    // Inside pressure vector (in middle ear, pushing outward towards eardrum):
    const innerLen = 35 * (this.pInner / 101);
    ctx.strokeStyle = this.pInner > 90 ? '#ef4444' : '#38bdf8';
    ctx.fillStyle = ctx.strokeStyle;
    this.drawArrow(ctx, eardrumX + innerLen + 12, eardrumY, eardrumX + 10, eardrumY, 6);

    ctx.fillText(`${this.pInner} kPa`, eardrumX + innerLen + 5, eardrumY - 10);

    // 3. Eustachian Tube Airflow Animation (Curved anatomical path from throat to eardrum)
    if (this.isEustachianOpen) {
      this.drawCurvedEustachianTube(ctx, canvasRect);
    }

    ctx.restore();
  }

  drawArrow(ctx, fromX, fromY, toX, toY, headlen = 6) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineWidth = 2.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS (Clean 2D, No 3D drag handlers)
  // -------------------------------------------------------------
  bindEvents() {
    window.addEventListener('resize', () => this.resize());
  }

  // -------------------------------------------------------------
  // ANIMATION LOOP (60 FPS)
  // -------------------------------------------------------------
  startLoop() {
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Smooth eardrum deformation spring
      this.eardrumDeform += (this.targetDeform - this.eardrumDeform) * 8.0 * dt;

      // Acoustic wave progress
      if (this.isAcousticPlaying) {
        this.acousticProgress += dt * 0.85;
        if (this.acousticProgress >= 1.0) {
          this.isAcousticPlaying = false;
          this.acousticProgress = 0;
        }
      }

      // Eustachian particles flow along curved anatomical tube
      if (this.isEustachianOpen) {
        this.eustachianParticles.forEach(p => {
          p.progress += dt * p.speed;
          if (p.progress > 1) p.progress -= 1;
        });
      }

      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('ear3DViewport')) {
    window.earSim = new EarSimulation('earCanvas');
  }
});
