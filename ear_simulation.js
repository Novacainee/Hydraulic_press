// Interactive Ear Anatomy & 3D Pressure Change Simulation (KHTN 8)
// Models the 3D human ear cutaway, sound transmission, and sudden pressure pop during flight

const EAR_PARTS = [
  {
    id: 1,
    name: "Vành tai",
    latin: "Auricle / Pinna",
    badgeTitle: "Vành tai",
    badgeDesc: "Hứng âm thanh",
    color: "#f59e0b",
    colorLight: "#fbbf24",
    xPercent: 19.5,
    yPercent: 18.5,
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
    xPercent: 37.5,
    yPercent: 45.0,
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
    xPercent: 47.0,
    yPercent: 44.0,
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
    xPercent: 51.5,
    yPercent: 42.5,
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
    xPercent: 63.5,
    yPercent: 40.5,
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
    xPercent: 64.5,
    yPercent: 48.5,
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
    xPercent: 68.0,
    yPercent: 68.0,
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
    this.stage = document.getElementById('ear3DStage');
    this.calloutsContainer = document.getElementById('earCalloutsContainer');

    // 3D Orbit & Zoom State
    this.rotX = 0; // Pitch: -25 to +25 deg
    this.rotY = 0; // Yaw: -50 to +50 deg
    this.zoom = 1.0; // 0.65 to 2.2
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Auto-sway state
    this.isAutoSway = false;
    this.swayTime = 0;

    // Annotations visibility (HUD toggle)
    this.showCallouts = true;

    // Sub-mode: 'anatomy' (Tìm hiểu bộ phận) or 'pressure' (Máy bay cất/hạ cánh)
    this.subMode = 'anatomy';

    // Exploration tracker
    this.exploredParts = new Set();
    this.selectedPartId = 1;
    this.unlockedFlightMode = false;

    // Flight Pressure Stages: 1 = Cân bằng, 2 = Áp suất đổi, 3 = Tiếng động, 4 = Nuốt/ngáp
    this.stage = 1;
    this.pOuter = 80; // 80 kPa at altitude
    this.pInner = 80;
    this.eardrumDeform = 0; // 0 = flat, +1 = inward, -1 = outward
    this.targetDeform = 0;

    // Eustachian Tube Airflow State
    this.isEustachianOpen = false;
    this.eustachianParticles = [];
    this.initEustachianParticles(24);

    // Sound wave traveling animation
    this.isAcousticPlaying = false;
    this.acousticProgress = 0;

    this.bindEvents();
    this.resize();
    this.update3DTransform();
    this.selectPart(1);
    this.startLoop();
  }

  initEustachianParticles(count) {
    this.eustachianParticles = [];
    for (let i = 0; i < count; i++) {
      this.eustachianParticles.push({
        progress: Math.random(),
        offset: (Math.random() - 0.5) * 8,
        speed: 0.8 + Math.random() * 0.5,
        size: 2.5 + Math.random() * 2
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
  // 3D VIEWER CONTROLS (Tự lắc, Chú thích, Zoom +, Zoom -)
  // -------------------------------------------------------------
  toggleAutoSway() {
    this.isAutoSway = !this.isAutoSway;
    const btn = document.getElementById('btnAutoSway');
    const label = document.getElementById('autoSwayLabel');
    if (btn) {
      if (this.isAutoSway) {
        btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-md border border-teal-400 transition animate-pulse";
        if (label) label.textContent = "Đang lắc...";
      } else {
        btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-md border border-slate-200 transition";
        if (label) label.textContent = "Tự lắc";
        this.rotX = 0;
        this.rotY = 0;
        this.update3DTransform();
      }
    }
    if (window.sound) window.sound.playClick();
  }

  toggleAnnotations() {
    this.showCallouts = !this.showCallouts;
    const btn = document.getElementById('btnToggleAnnotations');
    if (btn) {
      if (this.showCallouts) {
        btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f4049] text-white text-xs font-bold shadow-md border border-teal-400/50 transition";
      } else {
        btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 text-xs font-bold shadow-md border border-slate-200 transition";
      }
    }
    if (this.calloutsContainer) {
      if (this.showCallouts) {
        this.calloutsContainer.classList.remove('opacity-0', 'pointer-events-none');
      } else {
        this.calloutsContainer.classList.add('opacity-0', 'pointer-events-none');
      }
    }
    if (window.sound) window.sound.playClick();
  }

  zoomIn() {
    this.zoom = Math.min(2.2, this.zoom + 0.15);
    this.update3DTransform();
    if (window.sound) window.sound.playClick();
  }

  zoomOut() {
    this.zoom = Math.max(0.65, this.zoom - 0.15);
    this.update3DTransform();
    if (window.sound) window.sound.playClick();
  }

  reset3D() {
    this.rotX = 0;
    this.rotY = 0;
    this.zoom = 1.0;
    this.isAutoSway = false;
    const btn = document.getElementById('btnAutoSway');
    const label = document.getElementById('autoSwayLabel');
    if (btn) btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-md border border-slate-200 transition";
    if (label) label.textContent = "Tự lắc";
    this.update3DTransform();
  }

  update3DTransform() {
    if (!this.stage) return;
    this.stage.style.transform = `perspective(1000px) rotateX(${this.rotX.toFixed(2)}deg) rotateY(${this.rotY.toFixed(2)}deg) scale(${this.zoom.toFixed(3)})`;
  }

  // -------------------------------------------------------------
  // ANATOMY SELECTION & TRACKING
  // -------------------------------------------------------------
  selectPart(id) {
    this.selectedPartId = id;
    this.exploredParts.add(id);

    const part = EAR_PARTS.find(p => p.id === id);
    if (!part) return;

    // Show checkmark on the 3D HUD badge
    const badgeCheck = document.getElementById(`badgeCheck-${id}`);
    if (badgeCheck) badgeCheck.classList.remove('hidden');

    // Highlight active 3D badge
    EAR_PARTS.forEach(p => {
      const bEl = document.getElementById(`earBadge-${p.id}`);
      if (bEl) {
        if (p.id === id) {
          bEl.classList.add('active');
        } else {
          bEl.classList.remove('active');
        }
      }
    });

    // Update Right UI Card
    const titleEl = document.getElementById('partCardTitle');
    const latinEl = document.getElementById('partCardLatin');
    const roleEl = document.getElementById('partCardRole');
    const detailsEl = document.getElementById('partCardDetails');
    const progressBadge = document.getElementById('earProgressBadge');
    const progressBar = document.getElementById('earProgressBar');

    if (titleEl) titleEl.textContent = `${part.id}. ${part.name}`;
    if (latinEl) latinEl.textContent = part.latin;
    if (roleEl) roleEl.textContent = part.role;
    if (detailsEl) detailsEl.textContent = part.details;

    const count = this.exploredParts.size;
    if (progressBadge) progressBadge.textContent = `${count} / 7 bộ phận`;
    if (progressBar) progressBar.style.width = `${(count / 7) * 100}%`;

    // Highlight active list button in right sidebar
    document.querySelectorAll('.part-item-btn').forEach(btn => {
      const bid = parseInt(btn.dataset.id);
      if (bid === id) {
        btn.classList.add('bg-sky-50', 'border-sky-300', 'text-sky-900', 'font-bold');
      } else {
        btn.classList.remove('bg-sky-50', 'border-sky-300', 'text-sky-900', 'font-bold');
      }

      if (this.exploredParts.has(bid)) {
        const check = btn.querySelector('.part-check');
        if (check) check.textContent = "✓";
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

    if (mode === 'anatomy') {
      if (btnAnatomy) btnAnatomy.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs shadow-sm transition";
      if (btnPressure) btnPressure.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition";
      if (panelAnatomy) panelAnatomy.classList.remove('hidden');
      if (panelPressure) panelPressure.classList.add('hidden');
    } else {
      if (btnAnatomy) btnAnatomy.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition";
      if (btnPressure) btnPressure.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-sm transition";
      if (panelAnatomy) panelAnatomy.classList.add('hidden');
      if (panelPressure) panelPressure.classList.remove('hidden');

      this.setStage(1);
    }

    if (window.sound) window.sound.playClick();
  }

  // Play traveling acoustic sound wave animation
  playAcousticWave() {
    this.isAcousticPlaying = true;
    this.acousticProgress = 0;
    if (window.sound) window.sound.playAcousticSequence();
  }

  // -------------------------------------------------------------
  // FLIGHT PRESSURE SCENARIO STAGES (Giai đoạn áp suất máy bay)
  // -------------------------------------------------------------
  setStage(stageNum) {
    this.stage = stageNum;
    this.isEustachianOpen = false;

    const stageTitle = document.getElementById('flightStageTitle');
    const stageDesc = document.getElementById('flightStageDesc');
    const swallowBtn = document.getElementById('swallowActionBtn');

    // Update active stage buttons
    document.querySelectorAll('.stage-step-btn').forEach((btn, idx) => {
      if (idx + 1 === stageNum) {
        btn.classList.add('bg-amber-100', 'border-amber-400', 'text-amber-950', 'font-bold');
      } else {
        btn.classList.remove('bg-amber-100', 'border-amber-400', 'text-amber-950', 'font-bold');
      }
    });

    if (stageNum === 1) {
      // 1. CÂN BẰNG: Máy bay bay ổn định trên cao (80 kPa = 80 kPa)
      this.pOuter = 80;
      this.pInner = 80;
      this.targetDeform = 0;

      if (stageTitle) stageTitle.textContent = "1. Cân bằng: Máy bay bay ổn định trên cao";
      if (stageDesc) stageDesc.textContent = "Trong khoang máy bay, áp suất khoảng 80 kPa. Áp suất ở hai bên màng nhĩ bằng nhau (80 kPa = 80 kPa) nên màng nhĩ ở vị trí cân bằng, vòi tai đang đóng. Ta không nghe thấy tiếng động lạ.";
      if (swallowBtn) swallowBtn.disabled = true;

    } else if (stageNum === 2) {
      // 2. ÁP SUẤT ĐỔI: Máy bay hạ cánh: áp suất ngoài tăng đột ngột (101 kPa)
      this.pOuter = 101;
      this.pInner = 80;
      this.targetDeform = 0.5; // Starts pressing inward

      if (stageTitle) stageTitle.textContent = "2. Áp suất đổi: Máy bay hạ cánh, áp suất ngoài tăng đột ngột";
      if (stageDesc) stageDesc.textContent = "Máy bay giảm độ cao rất nhanh nên áp suất không khí bên ngoài tăng từ 80 lên 101 kPa. Vòi tai thường không phản ứng kịp, áp suất trong tai giữa vẫn còn khoảng 80 kPa.";
      if (swallowBtn) swallowBtn.disabled = true;

    } else if (stageNum === 3) {
      // 3. TIẾNG ĐỘNG: Mất cân bằng áp suất -> tiếng động / ù tai
      this.pOuter = 101;
      this.pInner = 80;
      this.targetDeform = 1.0; // Heavily concave into middle ear!

      if (stageTitle) stageTitle.textContent = "3. Tiếng động: Mất cân bằng áp suất → tiếng động trong tai";
      if (stageDesc) stageDesc.textContent = "Áp suất ngoài (101 kPa) lớn hơn áp suất trong (80 kPa), màng nhĩ đột ngột bị đẩy võng sâu về phía có áp suất nhỏ hơn (vào phía tai giữa), gây nên tiếng động trong tai hoặc triệu chứng ù tai, căng tức tai!";
      if (swallowBtn) swallowBtn.disabled = false;

      // Synthesize pop / ear strain sound
      if (window.sound) window.sound.playEarPop();

    } else if (stageNum === 4) {
      // 4. NUỐT / NGÁP: Cân bằng lại áp suất
      this.doSwallowOrYawn();
      return;
    }

    this.updatePressureTelemetry();
  }

  // Action: Nuốt hoặc Ngáp (Opens Eustachian Tube & Pops eardrum back)
  doSwallowOrYawn() {
    this.stage = 4;
    this.isEustachianOpen = true;

    // Equalize pressure!
    this.pInner = this.pOuter; // 101 kPa
    this.targetDeform = 0; // Return to flat

    const stageTitle = document.getElementById('flightStageTitle');
    const stageDesc = document.getElementById('flightStageDesc');
    const swallowBtn = document.getElementById('swallowActionBtn');

    if (stageTitle) stageTitle.textContent = "4. Nuốt / ngáp: Mở vòi tai cân bằng lại áp suất!";
    if (stageDesc) stageDesc.textContent = "Vòi tai mở rộng! Không khí từ vòm họng tràn vào tai giữa, đưa áp suất trong tai giữa lên bằng 101 kPa. Màng nhĩ bật trở lại vị trí cân bằng phẳng ban đầu, tiếng động biến mất, tai nghe rõ trở lại!";
    if (swallowBtn) swallowBtn.disabled = true;

    // Play swallow sound followed by ear pop chime
    if (window.sound) {
      window.sound.playSwallow();
      setTimeout(() => {
        window.sound.playEarPop();
        window.sound.playSuccess();
      }, 250);
    }

    this.updatePressureTelemetry();

    // After 2.8 seconds, Eustachian tube naturally closes again
    setTimeout(() => {
      this.isEustachianOpen = false;
    }, 2800);
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
        eardrumStateBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse";
        eardrumStateBadge.textContent = "Màng nhĩ: Bị đẩy lõm vào trong (Gây ù tai)";
      } else {
        eardrumStateBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse";
        eardrumStateBadge.textContent = "Màng nhĩ: Bị phồng lồi ra ngoài";
      }
    }
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

    // 1. Draw Multicolored Connecting Arrows to 3D Pins
    if (this.showCallouts) {
      this.drawCalloutArrows(ctx, canvasRect);
    }

    // 2. Sound Wave Traveling Animation
    if (this.isAcousticPlaying) {
      this.drawAcousticWaveFlow(ctx, canvasRect);
    }

    // 3. Pressure mode overlays: Pressure gauge vectors, Eardrum deformation & Eustachian airflow
    if (this.subMode === 'pressure') {
      this.drawPressureModeOverlays(ctx, canvasRect);
    }
  }

  // Draw vibrant multicolored arrows connecting HUD badges to 3D pins
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

      // Offset end by 12px so arrowhead meets the outer edge of pin
      const targetX = pinX - (dx / dist) * 12;
      const targetY = pinY - (dy / dist) * 12;

      const isSelected = (this.selectedPartId === part.id);
      const strokeColor = isSelected ? '#fbbf24' : (part.colorLight || part.color);

      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = strokeColor;
      ctx.lineWidth = isSelected ? 3.0 : 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = isSelected ? 8 : 4;

      // Draw arrow line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Draw arrowhead triangle
      const headLen = isSelected ? 11 : 9.5;
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

    // Glowing pulse impulse
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(waveX, waveY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }

  // Draw pressure arrows and bulging eardrum in pressure simulation mode
  drawPressureModeOverlays(ctx, canvasRect) {
    const pin3 = document.getElementById('earPin-3'); // Màng nhĩ
    const pin7 = document.getElementById('earPin-7'); // Vòi tai
    if (!pin3) return;

    const r3 = pin3.getBoundingClientRect();
    const eardrumX = r3.left + r3.width * 0.5 - canvasRect.left;
    const eardrumY = r3.top + r3.height * 0.5 - canvasRect.top;

    ctx.save();

    // 1. Bulging Eardrum curve
    const deform = this.eardrumDeform;
    const arcX = eardrumX + deform * 22;

    ctx.strokeStyle = Math.abs(deform) > 0.4 ? '#ef4444' : '#22c55e';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(eardrumX, eardrumY - 26);
    ctx.quadraticCurveTo(arcX, eardrumY, eardrumX, eardrumY + 26);
    ctx.stroke();

    // 2. Pressure Vectors (Outside in Canal pushing inward vs Middle ear)
    // Outside pressure vector pushing inward:
    const outerLen = 35 * (this.pOuter / 101);
    ctx.strokeStyle = this.pOuter > 90 ? '#ef4444' : '#38bdf8';
    ctx.fillStyle = ctx.strokeStyle;
    this.drawArrow(ctx, eardrumX - outerLen - 12, eardrumY, eardrumX - 10, eardrumY, 6);

    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(`${this.pOuter} kPa`, eardrumX - outerLen - 20, eardrumY - 10);

    // Inside pressure vector pushing outward:
    const innerLen = 35 * (this.pInner / 101);
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = ctx.strokeStyle;
    this.drawArrow(ctx, eardrumX + innerLen + 12, eardrumY, eardrumX + 10, eardrumY, 6);

    ctx.fillText(`${this.pInner} kPa`, eardrumX + innerLen + 5, eardrumY - 10);

    // 3. Eustachian Tube Airflow Animation (When Nuốt / Ngáp)
    if (this.isEustachianOpen && pin7) {
      const r7 = pin7.getBoundingClientRect();
      const p7X = r7.left + r7.width * 0.5 - canvasRect.left;
      const p7Y = r7.top + r7.height * 0.5 - canvasRect.top;

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(p7X, p7Y);
      ctx.lineTo(eardrumX + 20, eardrumY + 20);
      ctx.stroke();

      // Flowing air particles streaming up
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 6;
      this.eustachianParticles.forEach(p => {
        const px = p7X + (eardrumX + 20 - p7X) * p.progress + p.offset;
        const py = p7Y + (eardrumY + 20 - p7Y) * p.progress;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Airflow label
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
      ctx.fillText('Khí tràn vào tai giữa!', (p7X + eardrumX) * 0.5 + 10, (p7Y + eardrumY) * 0.5);
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
  // MOUSE & TOUCH 3D DRAG ROTATION LISTENERS
  // -------------------------------------------------------------
  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    if (!this.viewport) return;

    // Mouse Drag on Viewport to Orbit 3D
    this.viewport.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons or badges directly
      if (e.target.closest('button') || e.target.closest('.ear-callout-badge') || e.target.closest('.ear-3d-pin')) {
        return;
      }
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.viewport.style.cursor = 'grabbing';

      // Dragging pauses auto-sway
      if (this.isAutoSway) {
        this.toggleAutoSway();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      // Update Yaw & Pitch
      this.rotY += dx * 0.38;
      this.rotX -= dy * 0.32;

      // Clamp rotation angles for pleasant anatomy viewing
      this.rotX = Math.max(-25, Math.min(25, this.rotX));
      this.rotY = Math.max(-50, Math.min(50, this.rotY));

      this.update3DTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        if (this.viewport) this.viewport.style.cursor = 'grab';
      }
    });

    // Touch events for tablet/mobile
    this.viewport.addEventListener('touchstart', (e) => {
      if (e.target.closest('button') || e.target.closest('.ear-callout-badge') || e.target.closest('.ear-3d-pin')) {
        return;
      }
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
        if (this.isAutoSway) this.toggleAutoSway();
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;

      this.rotY += dx * 0.38;
      this.rotX -= dy * 0.32;
      this.rotX = Math.max(-25, Math.min(25, this.rotX));
      this.rotY = Math.max(-50, Math.min(50, this.rotY));

      this.update3DTransform();
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Mouse wheel zoom
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      this.zoom = Math.max(0.65, Math.min(2.2, this.zoom + delta));
      this.update3DTransform();
    }, { passive: false });

    // Double click to reset 3D view
    this.viewport.addEventListener('dblclick', (e) => {
      if (e.target.closest('button') || e.target.closest('.ear-callout-badge') || e.target.closest('.ear-3d-pin')) {
        return;
      }
      this.reset3D();
    });
  }

  // -------------------------------------------------------------
  // ANIMATION LOOP (60 FPS)
  // -------------------------------------------------------------
  startLoop() {
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Auto-sway gentle 3D oscillation
      if (this.isAutoSway && !this.isDragging) {
        this.swayTime += dt * 1.5;
        this.rotY = Math.sin(this.swayTime) * 16;
        this.rotX = Math.cos(this.swayTime * 0.7) * 8;
        this.update3DTransform();
      }

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

      // Eustachian particles flow
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
