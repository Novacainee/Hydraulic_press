// Interactive Ear Anatomy & Sudden Pressure Change Simulation (KHTN 8)
// Models the 3D human ear cutaway, sound transmission, and sudden pressure pop during flight

const EAR_PARTS = [
  {
    id: 1,
    name: "Vành tai",
    latin: "Auricle / Pinna",
    xPercent: 17.9,
    yPercent: 37.6,
    soundOrder: 1,
    role: "Nằm ngoài cùng, hứng sóng âm từ môi trường xung quanh. Hướng âm thanh vào ống tai.",
    details: "Vành tai có cấu tạo sụn đàn hồi với nhiều nếp gấp đặc biệt, hoạt động như một chiếc phễu thu âm thanh tự nhiên giúp ta định hướng nguồn âm trong không gian."
  },
  {
    id: 2,
    name: "Ống tai",
    latin: "External Auditory Canal",
    xPercent: 40.6,
    yPercent: 65.8,
    soundOrder: 2,
    role: "Dẫn sóng âm đến màng nhĩ. Không khí trong ống tai thông với bên ngoài, nên áp suất ở đây bằng áp suất khí quyển bên ngoài.",
    details: "Đường ống dài khoảng 2.5 cm dẫn từ vành tai đến màng nhĩ. Vì thông thẳng ra khí quyển, nên khi máy bay cất cánh hoặc hạ cánh, áp suất trong ống tai biến đổi tức thì theo môi trường bên ngoài."
  },
  {
    id: 3,
    name: "Màng nhĩ",
    latin: "Tympanic Membrane",
    xPercent: 46.8,
    yPercent: 66.5,
    soundOrder: 3,
    role: "Màng mỏng ngăn cách ống tai với tai giữa, rung động khi có sóng âm. Một mặt chịu áp suất từ ống tai (áp suất ngoài), mặt kia chịu áp suất từ tai giữa. Nếu áp suất hai mặt chênh lệch đột ngột, màng nhĩ bị đẩy về phía có áp suất nhỏ hơn.",
    details: "Màng nhĩ hình nón mỏng trong suốt, cực kỳ nhạy cảm với dao động sóng âm. Khi áp suất hai bên mất cân bằng (ví dụ ngoài 101 kPa, trong 80 kPa), màng nhĩ bị căng phồng hoặc lõm sâu gây cảm giác đau tức và tiếng động/ù tai."
  },
  {
    id: 4,
    name: "Chuỗi xương con",
    latin: "Auditory Ossicles (Búa - Đe - Bàn đạp)",
    xPercent: 53.1,
    yPercent: 62.9,
    soundOrder: 4,
    role: "Ba xương nhỏ nhất cơ thể nằm trong tai giữa. Nhận rung động từ màng nhĩ rồi truyền vào tai trong.",
    details: "Gồm xương búa (malleus), xương đe (incus) và xương bàn đạp (stapes). Chuỗi xương này hoạt động như một hệ đòn bẩy khuếch đại lực rung động của màng nhĩ lên gấp hơn 20 lần trước khi tác động vào dịch tai trong."
  },
  {
    id: 5,
    name: "Ốc tai",
    latin: "Cochlea",
    xPercent: 65.6,
    yPercent: 68.6,
    soundOrder: 5,
    role: "Nằm ở tai trong, có hình xoắn ốc chứa dịch. Biến rung động thành tín hiệu thần kinh.",
    details: "Cơ quan thính giác chính chứa đầy chất dịch và hàng nghìn tế bào lông cảm thụ tinh vi. Dao động của xương bàn đạp tạo ra sóng dịch kích thích tế bào lông phát ra các xung điện sinh học."
  },
  {
    id: 6,
    name: "Dây thần kinh thính giác",
    latin: "Auditory Nerve (Dây VIII)",
    xPercent: 61.5,
    yPercent: 61.4,
    soundOrder: 6,
    role: "Nhận tín hiệu từ ốc tai. Truyền tín hiệu lên não để ta nhận biết âm thanh.",
    details: "Bó sợi thần kinh cảm giác truyền các tín hiệu điện với tốc độ cực nhanh từ ốc tai về trung tâm thính giác ở vỏ não, nơi tín hiệu được giải mã thành âm thanh ta nghe và hiểu được."
  },
  {
    id: 7,
    name: "Vòi tai (Vòi nhĩ)",
    latin: "Eustachian Tube",
    xPercent: 70.4,
    yPercent: 82.4,
    soundOrder: 0, // Pressure regulation organ
    role: "Ống nối tai giữa với vòm mũi – họng. Có nhiệm vụ điều hòa và cân bằng áp suất hai bên màng nhĩ. Thường đóng; khi nuốt hoặc ngáp thì mở rộng cho không khí đi vào (hoặc ra) tai giữa.",
    details: "Ống dài khoảng 3.5 cm nối hòm nhĩ với họng mũi. Đây là 'chiếc van an toàn' của tai. Bình thường vòi đóng kín để vi khuẩn từ họng không tràn lên tai. Khi nuốt nước bọt hoặc ngáp, cơ mở vòi co lại giúp khí tràn vào cân bằng áp suất!"
  }
];

class EarSimulation {
  constructor(canvasId, imgId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.img = document.getElementById(imgId);

    // Mode: 'anatomy' (Tìm hiểu bộ phận) or 'pressure' (Máy bay cất/hạ cánh)
    this.subMode = 'anatomy';

    // Exploration tracker
    this.exploredParts = new Set();
    this.selectedPartId = 1;
    this.unlockedFlightMode = false;

    // Flight Pressure Stages: 1 = Cân bằng, 2 = Áp suất đổi, 3 = Tiếng động, 4 = Nuốt/ngáp
    this.stage = 1;
    this.flightScenario = 'landing'; // 'landing' (hạ cánh) or 'takeoff' (cất cánh)

    // Pressures in kPa
    this.pOuter = 80; // 80 kPa at high altitude
    this.pInner = 80;
    this.eardrumDeform = 0; // 0 = flat, +1 = inward, -1 = outward
    this.targetDeform = 0;

    // Eustachian Tube State
    this.isEustachianOpen = false;
    this.eustachianParticles = [];
    this.initEustachianParticles(24);

    // Sound wave animation
    this.isAcousticPlaying = false;
    this.acousticProgress = 0;

    // Canvas Mouse interaction
    this.mousePos = { x: 0, y: 0 };
    this.hoverPartId = null;

    this.bindEvents();
    this.resize();
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
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
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

  // Select an anatomical part (by pin click or list item click)
  selectPart(id) {
    this.selectedPartId = id;
    this.exploredParts.add(id);

    const part = EAR_PARTS.find(p => p.id === id);
    if (!part) return;

    // Update UI Card
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

    // Highlight active list button
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
    const outerPText = document.getElementById('flightOuterP');
    const innerPText = document.getElementById('flightInnerP');
    const deltaPText = document.getElementById('flightDeltaP');
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

    // After 2.5 seconds, Eustachian tube naturally closes again
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
  // CANVAS RENDERING
  // -------------------------------------------------------------
  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw 3D Ear Cutaway Background Image
    if (this.img && this.img.complete) {
      // Draw image keeping aspect ratio centered
      const imgRatio = this.img.naturalWidth / this.img.naturalHeight;
      const canvasRatio = w / h;
      let dw, dh, dx, dy;

      if (canvasRatio > imgRatio) {
        dh = h;
        dw = h * imgRatio;
        dx = (w - dw) * 0.5;
        dy = 0;
      } else {
        dw = w;
        dh = w / imgRatio;
        dx = 0;
        dy = (h - dh) * 0.5;
      }

      ctx.drawImage(this.img, dx, dy, dw, dh);
      this.modelBounds = { dx, dy, dw, dh };
    } else {
      // Fallback placeholder
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
    }

    // Helper to get canvas pixel coordinates from percentage on 3D model
    const getPos = (pX, pY) => {
      const b = this.modelBounds || { dx: 0, dy: 0, dw: w, dh: h };
      return {
        x: b.dx + (pX / 100) * b.dw,
        y: b.dy + (pY / 100) * b.dh
      };
    };

    // 2. Acoustic wave animation
    if (this.isAcousticPlaying) {
      this.drawAcousticWaveFlow(ctx, getPos);
    }

    // 3. Pressure mode overlays: Pressure arrows & Eardrum deformation & Eustachian tube airflow
    if (this.subMode === 'pressure') {
      this.drawPressureModeOverlays(ctx, getPos);
    }

    // 4. Interactive Anatomy Pins (Shown in both or anatomy mode)
    this.drawAnatomicalPins(ctx, getPos);
  }

  // Draw interactive pins on the 7 ear parts
  drawAnatomicalPins(ctx, getPos) {
    EAR_PARTS.forEach(part => {
      const pos = getPos(part.xPercent, part.yPercent);
      const isSelected = (this.selectedPartId === part.id);
      const isHovered = (this.hoverPartId === part.id);
      const isExplored = this.exploredParts.has(part.id);

      ctx.save();

      // Pulsing glow if active
      if (isSelected || isHovered) {
        ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pin circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#0284c7' : (isExplored ? '#059669' : '#f59e0b');
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pin number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${part.id}`, pos.x, pos.y);

      // Label tag above pin
      if (isSelected || isHovered) {
        ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        const txt = part.name;
        const tw = ctx.measureText(txt).width;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.roundRect(pos.x - tw * 0.5 - 6, pos.y - 28, tw + 12, 18, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(txt, pos.x, pos.y - 19);
      }

      ctx.restore();
    });
  }

  // Draw traveling acoustic sound wave animation through the ear
  drawAcousticWaveFlow(ctx, getPos) {
    // Path from Pinna -> Canal -> Eardrum -> Ossicles -> Cochlea -> Nerve
    const path = [
      getPos(17.9, 37.6), // 1. Pinna
      getPos(32.0, 52.0),
      getPos(40.6, 65.8), // 2. Canal
      getPos(46.8, 66.5), // 3. Eardrum
      getPos(53.1, 62.9), // 4. Ossicles
      getPos(65.6, 68.6), // 5. Cochlea
      getPos(61.5, 61.4)  // 6. Auditory Nerve
    ];

    ctx.save();
    // Draw sound wave line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    path.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Traveling wave ripple
    const t = this.acousticProgress;
    const totalSegs = path.length - 1;
    const currentSeg = Math.min(totalSegs - 1, Math.floor(t * totalSegs));
    const segT = (t * totalSegs) - currentSeg;

    const pA = path[currentSeg];
    const pB = path[currentSeg + 1];
    const waveX = pA.x + (pB.x - pA.x) * segT;
    const waveY = pA.y + (pB.y - pA.y) * segT;

    // Glowing acoustic impulse ring
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(waveX, waveY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  // Draw Pressure arrows, Eardrum bulging, and Eustachian tube flow
  drawPressureModeOverlays(ctx, getPos) {
    const eardrumPos = getPos(46.8, 66.5);
    const canalPos = getPos(38.0, 65.8);
    const middleEarPos = getPos(52.0, 64.0);
    const eustachianTop = getPos(52.5, 67.5);
    const eustachianBottom = getPos(73.5, 87.0);

    ctx.save();

    // 1. EARDRUM BULGING DEFORMATION
    // Calculate current interpolated deformation (-1.0 to +1.0)
    const deform = this.eardrumDeform;
    const arcX = eardrumPos.x + deform * 18; // bulges left or right

    ctx.strokeStyle = deform > 0.3 ? '#ef4444' : (deform < -0.3 ? '#f59e0b' : '#38bdf8');
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(eardrumPos.x, eardrumPos.y - 20);
    ctx.quadraticCurveTo(arcX, eardrumPos.y, eardrumPos.x, eardrumPos.y + 20);
    ctx.stroke();

    // 2. PRESSURE ARROWS
    // Outside pressure in canal pushing inward
    const outerArrowLen = (this.pOuter / 101) * 26;
    ctx.strokeStyle = this.pOuter > 90 ? '#ef4444' : '#38bdf8';
    ctx.fillStyle = ctx.strokeStyle;
    this.drawArrow(ctx, canalPos.x - outerArrowLen, canalPos.y, canalPos.x, canalPos.y, 5);

    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(`${this.pOuter} kPa`, canalPos.x - outerArrowLen - 4, canalPos.y - 8);

    // Inside pressure in middle ear pushing outward
    const innerArrowLen = (this.pInner / 101) * 26;
    ctx.strokeStyle = this.pInner > 90 ? '#ef4444' : '#38bdf8';
    ctx.fillStyle = ctx.strokeStyle;
    this.drawArrow(ctx, middleEarPos.x + innerArrowLen, middleEarPos.y, middleEarPos.x, middleEarPos.y, 5);

    ctx.fillText(`${this.pInner} kPa`, middleEarPos.x + innerArrowLen + 4, middleEarPos.y - 8);

    // 3. EUSTACHIAN TUBE AIRFLOW (When Nuốt/Ngáp)
    if (this.isEustachianOpen) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(eustachianBottom.x, eustachianBottom.y);
      ctx.lineTo(eustachianTop.x, eustachianTop.y);
      ctx.stroke();

      // Flow particles streaming up Eustachian tube
      ctx.fillStyle = '#ffffff';
      this.eustachianParticles.forEach(p => {
        const px = eustachianBottom.x + (eustachianTop.x - eustachianBottom.x) * p.progress + p.offset;
        const py = eustachianBottom.y + (eustachianTop.y - eustachianBottom.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Label: Vòi tai mở
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
      ctx.fillText('Vòi tai đang mở: Khí tràn vào cân bằng áp suất!', (eustachianTop.x + eustachianBottom.x) * 0.5 + 10, (eustachianTop.y + eustachianBottom.y) * 0.5);
    }

    ctx.restore();
  }

  drawArrow(ctx, fromX, fromY, toX, toY, headlen = 5) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS
  // -------------------------------------------------------------
  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const checkHoverPin = (mPos) => {
      for (const part of EAR_PARTS) {
        const b = this.modelBounds || { dx: 0, dy: 0, dw: this.width, dh: this.height };
        const px = b.dx + (part.xPercent / 100) * b.dw;
        const py = b.dy + (part.yPercent / 100) * b.dh;
        const dist = Math.hypot(mPos.x - px, mPos.y - py);
        if (dist <= 16) return part.id;
      }
      return null;
    };

    this.canvas.addEventListener('mousemove', (e) => {
      this.mousePos = getPos(e);
      this.hoverPartId = checkHoverPin(this.mousePos);
      this.canvas.style.cursor = this.hoverPartId ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('click', (e) => {
      const pos = getPos(e);
      const clickedId = checkHoverPin(pos);
      if (clickedId) {
        this.selectPart(clickedId);
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      const pos = getPos(e);
      const clickedId = checkHoverPin(pos);
      if (clickedId) {
        this.selectPart(clickedId);
        e.preventDefault();
      }
    }, { passive: false });
  }

  startLoop() {
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Update eardrum deformation spring
      this.eardrumDeform += (this.targetDeform - this.eardrumDeform) * 8.0 * dt;

      // Update acoustic wave progress
      if (this.isAcousticPlaying) {
        this.acousticProgress += dt * 0.85;
        if (this.acousticProgress >= 1.0) {
          this.isAcousticPlaying = false;
          this.acousticProgress = 0;
        }
      }

      // Update Eustachian particles
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
  // Initialize EarSimulation if canvas exists
  if (document.getElementById('earCanvas')) {
    window.earSim = new EarSimulation('earCanvas', 'earModelImg');
  }
});

