// Simulation Physics & Canvas 2D Engine for Pascal Law & Hydraulic Press

class HydraulicSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Display mode: 'sgk', 'sandbox', 'hydraulic-lift'
    this.mode = 'sgk';

    // Physical parameters
    this.ratio = 2.0; // S1 / S2
    this.baseArea2 = 10; // cm^2
    this.area1 = 20; // cm^2
    this.area2 = 10; // cm^2

    // Weights on pistons (Number of 1N standard weights)
    this.weights1 = 0;
    this.weights2 = 0;

    // Displacements from reference equilibrium 0 (in virtual cm)
    // Positive h means pushed downward, negative h means lifted upward
    this.h1 = 0; // cm (Piston 1 height displacement)
    this.h2 = 0; // cm (Piston 2 height displacement)
    this.targetH1 = 0;
    this.targetH2 = 0;
    this.velocityH1 = 0;

    // Fluid properties
    this.fluidType = 'water'; // 'water', 'oil', 'mercury'
    this.fluidDensity = 1000; // kg/m^3

    // Visual options
    this.showVectors = true;
    this.showParticles = true;
    this.showRuler = true;

    // Particles for fluid flow visualization
    this.particles = [];
    this.initParticles(35);

    // Car Lift Mode Specifics
    this.carWeight = 15000; // 15,000 N (1.5 ton)
    this.carLiftActive = false;
    this.carLiftPumpForce = 0; // Force applied by technician

    // Drag and Drop State
    this.draggedWeight = null;
    this.isDragging = false;
    this.mousePos = { x: 0, y: 0 };
    this.hoverTarget = null; // 1 or 2

    // Geometry layout cache (updated on resize)
    this.layout = {};

    // Animation & Sound State
    this.lastTime = performance.now();
    this.wasBalanced = true;

    this.bindEvents();
    this.resize();
    this.startLoop();
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        u: Math.random(), // parametric position along U-tube path (0=top left cylinder, 0.5=bottom pipe, 1=top right)
        crossOffset: (Math.random() - 0.5) * 0.7, // offset across tube width
        speed: (Math.random() * 0.4 + 0.8),
        size: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.4 + 0.3
      });
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.updateLayout();
  }

  updateLayout() {
    const w = this.width;
    const h = this.height;

    // Base coordinates for U-tube system
    const centerY = h * 0.52;
    const bottomY = h * 0.86;
    const cylinderHeight = h * 0.52;
    const pipeHeight = h * 0.08;

    // Cylinder widths proportional to sqrt(Area) to reflect diameter d = sqrt(4S/pi)
    // Scale widths gracefully
    const s1 = this.area1;
    const s2 = this.area2;
    
    // Width ratio based on diameter
    const d1Ratio = Math.sqrt(s1 / s2);
    const baseW = Math.min(w * 0.16, 110);
    const width2 = baseW;
    const width1 = baseW * Math.min(d1Ratio, 2.24);

    // Positions of cylinders
    const spacing = Math.min(w * 0.35, 240);
    const cx1 = w * 0.5 - spacing * 0.5;
    const cx2 = w * 0.5 + spacing * 0.5;

    this.layout = {
      w, h,
      centerY,
      bottomY,
      cylinderHeight,
      pipeHeight,
      // Cylinder 1
      c1: {
        cx: cx1,
        width: width1,
        left: cx1 - width1 * 0.5,
        right: cx1 + width1 * 0.5,
        top: bottomY - cylinderHeight,
        bottom: bottomY,
      },
      // Cylinder 2
      c2: {
        cx: cx2,
        width: width2,
        left: cx2 - width2 * 0.5,
        right: cx2 + width2 * 0.5,
        top: bottomY - cylinderHeight,
        bottom: bottomY,
      },
      scalePxlPerCm: cylinderHeight * 0.038 // 1 cm displacement = ~N pixels
    };
  }

  setRatio(newRatio) {
    this.ratio = Math.max(1, Math.min(5, newRatio));
    this.area2 = this.baseArea2;
    this.area1 = this.baseArea2 * this.ratio;
    this.updateLayout();
    this.calculatePhysics();
    this.updateTelemetry();
  }

  setFluid(type) {
    this.fluidType = type;
    if (type === 'water') this.fluidDensity = 1000;
    else if (type === 'oil') this.fluidDensity = 850;
    else if (type === 'mercury') this.fluidDensity = 13600;
    if (window.sound) window.sound.playClick();
  }

  addWeight(pistonId, delta = 1) {
    if (pistonId === 1) {
      this.weights1 = Math.max(0, Math.min(10, this.weights1 + delta));
    } else {
      this.weights2 = Math.max(0, Math.min(10, this.weights2 + delta));
    }

    if (delta > 0 && window.sound) {
      window.sound.playClink();
    } else if (delta < 0 && window.sound) {
      window.sound.playClick();
    }

    this.calculatePhysics();
    this.updateTelemetry();
  }

  clearWeights() {
    this.weights1 = 0;
    this.weights2 = 0;
    this.carLiftActive = false;
    this.carLiftPumpForce = 0;
    if (window.sound) window.sound.playClick();
    this.calculatePhysics();
    this.updateTelemetry();
  }

  // Pre-configured SGK Scenarios from textbook
  applyScenario(scenario) {
    this.mode = 'sgk';
    this.setRatio(2.0); // SGK specifies S1 = 2 * S2
    const slider = document.getElementById('ratioSlider');
    if (slider) slider.value = 2;
    const ratioDisp = document.getElementById('ratioDisplay');
    if (ratioDisp) ratioDisp.textContent = '2.0×';

    const titleEl = document.getElementById('stepTitle');
    const descEl = document.getElementById('stepDesc');
    const badgeEl = document.getElementById('stepNumberBadge');

    if (scenario === 'balanced') {
      this.weights1 = 0;
      this.weights2 = 0;
      if (badgeEl) badgeEl.textContent = '1';
      if (titleEl) titleEl.textContent = 'Trạng thái ban đầu: Hai pit-tông ở vị trí cân bằng';
      if (descEl) descEl.textContent = 'Chưa đặt quả nặng lên đĩa nào. Áp suất ở hai bên bằng nhau (áp suất khí quyển), hai mặt thoáng chất lỏng ngang bằng nhau ở vạch số 0.';
    } else if (scenario === 'step1_4weights') {
      this.weights1 = 4;
      this.weights2 = 0;
      if (badgeEl) badgeEl.textContent = '2';
      if (titleEl) titleEl.textContent = 'Đặt 4 quả nặng lên pit-tông (1)';
      if (descEl) descEl.textContent = 'Quan sát thấy: Áp suất tác dụng lên mặt chất lỏng ở nhánh (1) tăng lên, truyền nguyên vẹn theo mọi hướng đẩy pit-tông (2) dịch chuyển lên trên!';
    } else if (scenario === 'step2_balance4') {
      this.weights1 = 4;
      this.weights2 = 2;
      if (badgeEl) badgeEl.textContent = '3';
      if (titleEl) titleEl.textContent = 'Đặt 2 quả nặng lên pit-tông (2) để đưa về vị trí cân bằng';
      if (descEl) descEl.textContent = 'Kết quả: Mặc dù số quả nặng ở (1) gấp đôi ở (2), nhưng do diện tích S₁ cũng gấp đôi S₂, áp suất p₁ = p₂ nên hai pit-tông trở về vị trí cân bằng ngang nhau!';
    } else if (scenario === 'step3_2weights') {
      this.weights1 = 2;
      this.weights2 = 1;
      if (badgeEl) badgeEl.textContent = '4';
      if (titleEl) titleEl.textContent = 'Kịch bản 2: Đặt 2 quả lên (1) và 1 quả lên (2)';
      if (descEl) descEl.textContent = 'Vì F₁ / S₁ = 2 / (2·S₂) = 1 / S₂ = F₂ / S₂ nên áp suất hai bên hoàn toàn bằng nhau, hệ tiếp tục giữ vị trí cân bằng!';
    }

    if (window.sound) window.sound.playClink();
    this.calculatePhysics();
    this.updateTelemetry();
  }

  loadCarLiftDemo() {
    this.mode = 'hydraulic-lift';
    this.setRatio(5.0); // High ratio
    this.weights1 = 0;
    this.weights2 = 0;
    this.carLiftActive = true;
    this.carLiftPumpForce = 300; // 300 N pump
    if (window.sound) window.sound.playClink();
    this.calculatePhysics();
    this.updateTelemetry();
  }

  calculatePhysics() {
    let f1, f2, s1, s2;

    if (this.carLiftActive) {
      s1 = 500; // cm^2
      s2 = 10;  // cm^2
      f1 = this.carWeight; // 15,000 N
      f2 = this.carLiftPumpForce; // 300 N
    } else {
      s1 = this.area1; // cm^2
      s2 = this.area2; // cm^2
      f1 = this.weights1 * 1.0; // 1 N per weight
      f2 = this.weights2 * 1.0;
    }

    // Pressures in N/cm^2 (x10 = kPa)
    // 1 N/cm^2 = 10,000 N/m^2 = 10 kPa
    const p1 = f1 / s1; // N/cm^2
    const p2 = f2 / s2; // N/cm^2

    // Pressure difference Delta P (p1 - p2)
    const deltaP = p1 - p2; // N/cm^2

    // Calculate steady-state height displacement
    // In an educational simulation, we demonstrate:
    // When p1 == p2 => h1 = 0, h2 = 0 (perfect balance at reference line)
    // When p1 > p2 => piston 1 pushes down by h1, piston 2 rises by h2 = h1 * (S1/S2)
    // Stroke travel limit: max 7 cm for h1
    const maxStroke1 = 6.5; // cm
    const maxStroke2 = 13.0; // cm

    if (Math.abs(deltaP) < 0.001) {
      // Balanced!
      this.targetH1 = 0;
      this.targetH2 = 0;
    } else {
      // Displacement scaled by deltaP
      // Normalizing factor so 1-2 weights difference gives clear visual movement
      const normalizedMove = Math.sign(deltaP) * Math.min(maxStroke1, Math.abs(deltaP) * 35.0);
      this.targetH1 = normalizedMove;
      // Conservation of volume: S1 * h1 = S2 * h2 => h2 = h1 * (S1 / S2)
      this.targetH2 = -normalizedMove * (s1 / s2);

      // Clamp stroke limit on piston 2
      if (Math.abs(this.targetH2) > maxStroke2) {
        this.targetH2 = Math.sign(this.targetH2) * maxStroke2;
        this.targetH1 = -this.targetH2 * (s2 / s1);
      }
    }
  }

  updatePhysics(dt) {
    // Smooth damped spring interpolation towards targetH1 and targetH2
    const k = 12.0; // Spring stiffness
    const damping = 0.72; // Damping factor

    const diff1 = this.targetH1 - this.h1;
    this.velocityH1 += diff1 * k * dt;
    this.velocityH1 *= Math.pow(damping, dt * 60);

    const oldH1 = this.h1;
    this.h1 += this.velocityH1 * dt;

    // By volume conservation, h2 strictly follows h1
    const s1 = this.carLiftActive ? 500 : this.area1;
    const s2 = this.carLiftActive ? 10 : this.area2;
    this.h2 = -this.h1 * (s1 / s2);

    // Audio hum feedback when fluid is in rapid motion
    const speed = Math.abs(this.velocityH1);
    if (speed > 0.4 && window.sound) {
      window.sound.startHydraulic(Math.min(1.0, speed / 4.0));
    } else if (window.sound && window.sound.isHydraulicPlaying) {
      window.sound.stopHydraulic();
    }

    // Check if we just reached equilibrium
    const isNowBalanced = (Math.abs(this.h1) < 0.02 && Math.abs(this.velocityH1) < 0.05);
    const pressureBalanced = (Math.abs(this.weights1 / this.area1 - this.weights2 / this.area2) < 0.0001);

    if (isNowBalanced && pressureBalanced && !this.wasBalanced && (this.weights1 > 0 || this.weights2 > 0)) {
      if (window.sound) window.sound.playSuccess();
    }
    this.wasBalanced = isNowBalanced && pressureBalanced;

    // Update particle flow
    const flowDirection = Math.sign(this.velocityH1);
    const flowSpeed = Math.abs(this.velocityH1) * 0.05 + 0.02;

    this.particles.forEach(p => {
      p.u += flowDirection * flowSpeed * p.speed * dt;
      if (p.u > 1) p.u -= 1;
      if (p.u < 0) p.u += 1;
    });
  }

  updateTelemetry() {
    const s1 = this.carLiftActive ? 500 : this.area1;
    const s2 = this.carLiftActive ? 10 : this.area2;
    const f1 = this.carLiftActive ? this.carWeight : this.weights1 * 1.0;
    const f2 = this.carLiftActive ? this.carLiftPumpForce : this.weights2 * 1.0;

    const p1_kPa = (f1 / s1) * 10;
    const p2_kPa = (f2 / s2) * 10;

    // Update live DOM elements
    const liveF1 = document.getElementById('liveF1');
    const liveS1 = document.getElementById('liveS1');
    const liveP1 = document.getElementById('liveP1');
    const liveF2 = document.getElementById('liveF2');
    const liveS2 = document.getElementById('liveS2');
    const liveP2 = document.getElementById('liveP2');
    const ratioSummary = document.getElementById('liveRatioSummary');
    const numW1 = document.getElementById('numWeights1');
    const numW2 = document.getElementById('numWeights2');
    const workH1 = document.getElementById('workH1');
    const workH2 = document.getElementById('workH2');
    const statusPill = document.getElementById('statusPill');
    const statusText = document.getElementById('statusText');

    if (liveF1) liveF1.textContent = f1.toFixed(0);
    if (liveS1) liveS1.textContent = s1.toFixed(0);
    if (liveP1) liveP1.textContent = p1_kPa.toFixed(2);

    if (liveF2) liveF2.textContent = f2.toFixed(0);
    if (liveS2) liveS2.textContent = s2.toFixed(0);
    if (liveP2) liveP2.textContent = p2_kPa.toFixed(2);

    if (ratioSummary) {
      ratioSummary.textContent = `Tỉ lệ diện tích: S₁ = ${(s1 / s2).toFixed(1)} × S₂`;
    }

    if (numW1) numW1.textContent = this.weights1;
    if (numW2) numW2.textContent = this.weights2;

    if (workH1) workH1.textContent = `${Math.abs(this.h1).toFixed(1)} cm (${this.h1 >= 0 ? 'hạ' : 'nâng'})`;
    if (workH2) workH2.textContent = `${Math.abs(this.h2).toFixed(1)} cm (${this.h2 >= 0 ? 'hạ' : 'nâng'})`;

    // Status pill state
    if (statusPill && statusText) {
      const deltaP = p1_kPa - p2_kPa;
      if (Math.abs(deltaP) < 0.001) {
        statusPill.className = "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur shadow-lg transition-all duration-300 bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
        statusText.textContent = "Cân bằng ngang nhau (p₁ = p₂)";
      } else if (deltaP > 0) {
        statusPill.className = "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur shadow-lg transition-all duration-300 bg-amber-500/20 text-amber-300 border-amber-500/40";
        statusText.textContent = "Pít-tông 1 đẩy Pít-tông 2 dâng lên (p₁ > p₂)";
      } else {
        statusPill.className = "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur shadow-lg transition-all duration-300 bg-sky-500/20 text-sky-300 border-sky-500/40";
        statusText.textContent = "Pít-tông 2 đẩy Pít-tông 1 dâng lên (p₂ > p₁)";
      }
    }
  }

  toggleSGKAnswer() {
    const box = document.getElementById('sgkAnswerBox');
    if (box) {
      box.classList.toggle('hidden');
    }
  }

  recordCurrentState() {
    const s1 = this.carLiftActive ? 500 : this.area1;
    const s2 = this.carLiftActive ? 10 : this.area2;
    const f1 = this.carLiftActive ? this.carWeight : this.weights1 * 1.0;
    const f2 = this.carLiftActive ? this.carLiftPumpForce : this.weights2 * 1.0;

    const p1 = ((f1 / s1) * 10).toFixed(2);
    const p2 = ((f2 / s2) * 10).toFixed(2);

    let status = "Cân bằng ngang vạch 0";
    if (p1 > p2) status = "Pít-tông (1) chìm xuống, (2) dâng lên";
    else if (p1 < p2) status = "Pít-tông (2) chìm xuống, (1) dâng lên";

    if (window.reportManager) {
      window.reportManager.addRecord({
        F1: `${f1} N`,
        S1: `${s1} cm²`,
        p1: `${p1} kPa`,
        F2: `${f2} N`,
        S2: `${s2} cm²`,
        p2: `${p2} kPa`,
        status: status
      });

      if (window.sound) window.sound.playSuccess();
      
      // Flash button or alert
      const btn = document.querySelector('[data-tab="report"]');
      if (btn) {
        btn.classList.add('ring-2', 'ring-cyan-400');
        setTimeout(() => btn.classList.remove('ring-2', 'ring-cyan-400'), 800);
      }
    }
  }

  // -------------------------------------------------------------
  // CANVAS RENDERING PIPELINE
  // -------------------------------------------------------------
  render() {
    const ctx = this.ctx;
    const { w, h, c1, c2, bottomY, centerY, pipeHeight, scalePxlPerCm } = this.layout;
    if (!c1 || !c2) return;

    ctx.clearRect(0, 0, w, h);

    // Compute current vertical pixel offsets from equilibrium reference line
    const yEquilibrium = centerY;
    const yFluid1 = yEquilibrium + this.h1 * scalePxlPerCm;
    const yFluid2 = yEquilibrium + this.h2 * scalePxlPerCm;

    // 1. Draw Lab Background Bench & Support Mounts
    this.drawLaboratoryEnvironment(ctx, w, h, bottomY, c1, c2);

    // 2. Draw Back Glass Cylinder & Rulers
    this.drawCylinderGlassBack(ctx, c1, yFluid1);
    this.drawCylinderGlassBack(ctx, c2, yFluid2);

    if (this.showRuler) {
      this.drawMetricRuler(ctx, c1, yEquilibrium, scalePxlPerCm, "Pít-tông (1)");
      this.drawMetricRuler(ctx, c2, yEquilibrium, scalePxlPerCm, "Pít-tông (2)");
    }

    // 3. Draw Fluid Body (Water, Oil, or Mercury)
    this.drawFluid(ctx, c1, c2, yFluid1, yFluid2, bottomY, pipeHeight);

    // 4. Draw Flow Particles & Pressure Vectors
    if (this.showParticles) {
      this.drawFlowParticles(ctx, c1, c2, yFluid1, yFluid2, bottomY, pipeHeight);
    }
    if (this.showVectors) {
      this.drawPressureVectors(ctx, c1, c2, yFluid1, yFluid2, bottomY);
    }

    // 5. Draw Reference Zero Line
    this.drawReferenceLine(ctx, c1, c2, yEquilibrium);

    // 6. Draw Realistic Metallic Pistons (Piston head, rubber seals, rod, tray, weights)
    this.drawPistonAssembly(ctx, c1, yFluid1, 1, this.weights1);
    this.drawPistonAssembly(ctx, c2, yFluid2, 2, this.weights2);

    // 7. Draw Glass Specular Glare & Cylinder Foreground
    this.drawCylinderGlassFront(ctx, c1);
    this.drawCylinderGlassFront(ctx, c2);

    // 8. Draw Pressure Gauges (Áp kế) on top/side
    this.drawPressureGauges(ctx, c1, c2);

    // 9. Draw Dragging Weight if actively dragged
    if (this.isDragging && this.draggedWeight) {
      this.drawFloatingWeight(ctx, this.mousePos.x, this.mousePos.y, this.draggedWeight.mass);
    }
  }

  // Draw lab baseplate and brackets
  drawLaboratoryEnvironment(ctx, w, h, bottomY, c1, c2) {
    // Heavy wooden/metal lab bench table
    const benchY = bottomY + 15;
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, h);
    benchGrad.addColorStop(0, '#334155');
    benchGrad.addColorStop(0.1, '#1e293b');
    benchGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, w, h - benchY);

    // Bench top metallic bevel trim
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, benchY - 2, w, 2);

    // Mounting stand / clamp holding the glass U-tube
    ctx.fillStyle = '#475569';
    [c1.cx, c2.cx].forEach(cx => {
      ctx.fillRect(cx - 18, bottomY, 36, 15);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx - 20, bottomY + 13, 40, 2);
    });
  }

  // Draw metric ruler markings (-8 cm to +8 cm, with 0 at reference line)
  drawMetricRuler(ctx, c, yEquilibrium, scalePxlPerCm, label) {
    const rulerX = c.right + 6;
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    // Vertical ruler spine
    ctx.beginPath();
    ctx.moveTo(rulerX, c.top + 20);
    ctx.lineTo(rulerX, c.bottom - 10);
    ctx.stroke();

    for (let cm = -8; cm <= 8; cm++) {
      const y = yEquilibrium + cm * scalePxlPerCm;
      if (y < c.top + 20 || y > c.bottom - 10) continue;

      const isZero = (cm === 0);
      const isMajor = (cm % 2 === 0);
      const tickLength = isZero ? 12 : (isMajor ? 8 : 4);

      ctx.beginPath();
      ctx.moveTo(rulerX, y);
      ctx.lineTo(rulerX + tickLength, y);
      ctx.strokeStyle = isZero ? '#f59e0b' : 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = isZero ? 2 : 1;
      ctx.stroke();

      if (isMajor || isZero) {
        ctx.fillStyle = isZero ? '#fbbf24' : 'rgba(203, 213, 225, 0.7)';
        ctx.fillText(`${cm > 0 ? '+' : ''}${-cm}`, rulerX + tickLength + 3, y + 3);
      }
    }
    ctx.restore();
  }

  // Draw reference zero line connecting both cylinders
  drawReferenceLine(ctx, c1, c2, yEquilibrium) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(c1.left - 10, yEquilibrium);
    ctx.lineTo(c2.right + 10, yEquilibrium);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '10px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Vị trí ban đầu (Vạch 0)', c1.left - 14, yEquilibrium + 3);
    ctx.restore();
  }

  // Fluid rendering with meniscus and custom color styles
  drawFluid(ctx, c1, c2, y1, y2, bottomY, pipeH) {
    const pipeTop = bottomY - pipeH;

    let colStart, colEnd;
    if (this.fluidType === 'water') {
      colStart = 'rgba(14, 165, 233, 0.85)';
      colEnd = 'rgba(3, 105, 161, 0.95)';
    } else if (this.fluidType === 'oil') {
      colStart = 'rgba(245, 158, 11, 0.85)';
      colEnd = 'rgba(180, 83, 9, 0.95)';
    } else {
      // Mercury
      colStart = 'rgba(226, 232, 240, 0.95)';
      colEnd = 'rgba(100, 116, 139, 0.98)';
    }

    ctx.save();

    // Create U-tube fluid path
    ctx.beginPath();
    // Left cylinder fluid surface (with subtle concave meniscus)
    ctx.moveTo(c1.left, y1);
    ctx.quadraticCurveTo(c1.cx, y1 + 3, c1.right, y1);
    // Down right side of left cylinder to pipe
    ctx.lineTo(c1.right, pipeTop);
    // Across connecting pipe top
    ctx.lineTo(c2.left, pipeTop);
    // Up left side of right cylinder to fluid surface
    ctx.lineTo(c2.left, y2);
    // Right cylinder fluid surface meniscus
    ctx.quadraticCurveTo(c2.cx, y2 + 3, c2.right, y2);
    // Down right side of right cylinder
    ctx.lineTo(c2.right, bottomY);
    // Across bottom
    ctx.lineTo(c1.left, bottomY);
    ctx.closePath();

    // Fill with depth gradient
    const grad = ctx.createLinearGradient(0, Math.min(y1, y2), 0, bottomY);
    grad.addColorStop(0, colStart);
    grad.addColorStop(1, colEnd);
    ctx.fillStyle = grad;
    ctx.fill();

    // Fluid surface glossy highlight line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(c1.left + 2, y1);
    ctx.lineTo(c1.right - 2, y1);
    ctx.moveTo(c2.left + 2, y2);
    ctx.lineTo(c2.right - 2, y2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw floating particles in the fluid
  drawFlowParticles(ctx, c1, c2, y1, y2, bottomY, pipeH) {
    const pipeCenterY = bottomY - pipeH * 0.5;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';

    this.particles.forEach(p => {
      let px, py;
      // Parametric U path: 0 -> 0.35: down cylinder 1; 0.35 -> 0.65: along pipe; 0.65 -> 1.0: up cylinder 2
      if (p.u < 0.35) {
        const t = p.u / 0.35;
        px = c1.cx + p.crossOffset * (c1.width * 0.4);
        py = y1 + (pipeCenterY - y1) * t;
      } else if (p.u < 0.65) {
        const t = (p.u - 0.35) / 0.3;
        px = c1.cx + (c2.cx - c1.cx) * t;
        py = pipeCenterY + p.crossOffset * (pipeH * 0.35);
      } else {
        const t = (p.u - 0.65) / 0.35;
        px = c2.cx + p.crossOffset * (c2.width * 0.4);
        py = pipeCenterY - (pipeCenterY - y2) * t;
      }

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    });

    ctx.restore();
  }

  // Draw glowing pressure vectors according to Pascal's Law
  drawPressureVectors(ctx, c1, c2, y1, y2, bottomY) {
    const s1 = this.carLiftActive ? 500 : this.area1;
    const s2 = this.carLiftActive ? 10 : this.area2;
    const f1 = this.carLiftActive ? this.carWeight : this.weights1 * 1.0;
    const f2 = this.carLiftActive ? this.carLiftPumpForce : this.weights2 * 1.0;
    const p1 = f1 / s1;
    const p2 = f2 / s2;

    const baseLen = 14;
    const arrowLen1 = Math.min(26, baseLen + p1 * 50);
    const arrowLen2 = Math.min(26, baseLen + p2 * 50);

    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    // Cylinder 1 pressure vectors (pushing against cylinder walls & piston head)
    this.drawArrow(ctx, c1.cx - 10, y1 + 18, c1.cx - 10, y1 + 18 - arrowLen1); // Upwards against piston
    this.drawArrow(ctx, c1.cx + 10, y1 + 18, c1.cx + 10, y1 + 18 - arrowLen1);
    this.drawArrow(ctx, c1.left + 15, (y1 + bottomY) * 0.5, c1.left + 15 - arrowLen1, (y1 + bottomY) * 0.5); // Leftwards
    this.drawArrow(ctx, c1.right - 15, (y1 + bottomY) * 0.5, c1.right - 15 + arrowLen1, (y1 + bottomY) * 0.5); // Rightwards

    // Cylinder 2 pressure vectors
    this.drawArrow(ctx, c2.cx, y2 + 18, c2.cx, y2 + 18 - arrowLen2); // Upwards against piston 2
    this.drawArrow(ctx, c2.left + 10, (y2 + bottomY) * 0.5, c2.left + 10 - arrowLen2, (y2 + bottomY) * 0.5);
    this.drawArrow(ctx, c2.right - 10, (y2 + bottomY) * 0.5, c2.right - 10 + arrowLen2, (y2 + bottomY) * 0.5);

    ctx.restore();
  }

  drawArrow(ctx, fromX, fromY, toX, toY) {
    const headlen = 5;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  // Draw Cylinder Glass Backing
  drawCylinderGlassBack(ctx, c, yFluid) {
    ctx.save();
    // Glass inner fill
    ctx.fillStyle = 'rgba(241, 245, 249, 0.04)';
    ctx.fillRect(c.left, c.top, c.width, c.bottom - c.top);
    ctx.restore();
  }

  // Draw Cylinder Glass Foreground (Walls, reflections, rim)
  drawCylinderGlassFront(ctx, c) {
    ctx.save();
    // Glass walls
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    // Left wall
    ctx.moveTo(c.left, c.top);
    ctx.lineTo(c.left, c.bottom);
    // Right wall
    ctx.moveTo(c.right, c.top);
    ctx.lineTo(c.right, c.bottom);
    ctx.stroke();

    // Glass top lip rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.left - 2, c.top - 2, c.width + 4, 4);

    // Specular reflection streaks down the glass
    const streakGrad = ctx.createLinearGradient(c.left, 0, c.right, 0);
    streakGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
    streakGrad.addColorStop(0.12, 'rgba(255,255,255,0.03)');
    streakGrad.addColorStop(0.85, 'rgba(255,255,255,0)');
    streakGrad.addColorStop(0.95, 'rgba(255,255,255,0.12)');

    ctx.fillStyle = streakGrad;
    ctx.fillRect(c.left, c.top, c.width, c.bottom - c.top);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // REALISTIC PISTON ASSEMBLY
  // -------------------------------------------------------------
  drawPistonAssembly(ctx, c, yFluid, pistonId, numWeights) {
    const pistonH = 24; // Height of piston head
    const pistonTop = yFluid - pistonH;
    const rodW = Math.max(8, c.width * 0.12);
    const rodH = 75; // Piston rod length
    const trayY = pistonTop - rodH;
    const trayW = c.width * 1.35; // Tray slightly wider than cylinder

    ctx.save();

    // 1. PISTON HEAD (Cylindrical metallic body sitting directly on fluid surface)
    // Horizontal linear gradient for 3D metallic chrome finish
    const metalGrad = ctx.createLinearGradient(c.left, 0, c.right, 0);
    metalGrad.addColorStop(0, '#64748b');
    metalGrad.addColorStop(0.2, '#f8fafc'); // Specular highlight
    metalGrad.addColorStop(0.5, '#cbd5e1');
    metalGrad.addColorStop(0.8, '#94a3b8');
    metalGrad.addColorStop(1, '#475569');

    ctx.fillStyle = metalGrad;
    ctx.fillRect(c.left + 1, pistonTop, c.width - 2, pistonH);

    // Two Rubber O-Ring Seals (Chống rò rỉ chất lỏng)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(c.left + 1, pistonTop + 5, c.width - 2, 4);
    ctx.fillRect(c.left + 1, pistonTop + 15, c.width - 2, 4);

    // O-ring highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(c.left + 8, pistonTop + 6, c.width * 0.3, 2);
    ctx.fillRect(c.left + 8, pistonTop + 16, c.width * 0.3, 2);

    // Top and bottom bevels of piston head
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(c.left + 1, pistonTop, c.width - 2, pistonH);

    // 2. CHROME PISTON ROD
    const rodGrad = ctx.createLinearGradient(c.cx - rodW * 0.5, 0, c.cx + rodW * 0.5, 0);
    rodGrad.addColorStop(0, '#94a3b8');
    rodGrad.addColorStop(0.3, '#ffffff');
    rodGrad.addColorStop(0.7, '#cbd5e1');
    rodGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = rodGrad;
    ctx.fillRect(c.cx - rodW * 0.5, trayY, rodW, rodH);

    // Rod joint flange at bottom and top
    ctx.fillStyle = '#475569';
    ctx.fillRect(c.cx - rodW * 0.7, pistonTop - 3, rodW * 1.4, 4);
    ctx.fillRect(c.cx - rodW * 0.7, trayY, rodW * 1.4, 4);

    // 3. TOP WEIGHING TRAY / CAR PLATFORM
    if (this.carLiftActive && pistonId === 1) {
      this.drawCarPlatform(ctx, c.cx, trayY);
    } else {
      this.drawWeighingTray(ctx, c.cx, trayY, trayW, pistonId);
      // 4. DRAW STANDARD WEIGHTS ON TRAY
      this.drawWeightsOnTray(ctx, c.cx, trayY - 2, numWeights, trayW);
    }

    // Indicator pointer showing level on ruler
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.moveTo(c.right, pistonTop + pistonH * 0.5);
    ctx.lineTo(c.right + 5, pistonTop + pistonH * 0.5 - 3);
    ctx.lineTo(c.right + 5, pistonTop + pistonH * 0.5 + 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw realistic lab weighing tray
  drawWeighingTray(ctx, cx, y, width, pistonId) {
    const isHovered = (this.hoverTarget === pistonId);

    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // Metallic tray body
    const trayGrad = ctx.createLinearGradient(cx - width * 0.5, 0, cx + width * 0.5, 0);
    if (isHovered) {
      trayGrad.addColorStop(0, '#38bdf8');
      trayGrad.addColorStop(0.5, '#e0f2fe');
      trayGrad.addColorStop(1, '#0284c7');
    } else {
      trayGrad.addColorStop(0, '#94a3b8');
      trayGrad.addColorStop(0.2, '#f8fafc');
      trayGrad.addColorStop(0.5, '#cbd5e1');
      trayGrad.addColorStop(1, '#64748b');
    }

    ctx.fillStyle = trayGrad;
    ctx.beginPath();
    // Shallow concave plate
    ctx.moveTo(cx - width * 0.5, y - 6);
    ctx.lineTo(cx - width * 0.45, y);
    ctx.lineTo(cx + width * 0.45, y);
    ctx.lineTo(cx + width * 0.5, y - 6);
    ctx.lineTo(cx + width * 0.48, y + 3);
    ctx.lineTo(cx - width * 0.48, y + 3);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = isHovered ? '#38bdf8' : '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Piston identification badge below tray
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`(${pistonId})`, cx, y + 15);

    ctx.restore();
  }

  // Draw stacked brass weights on the tray
  drawWeightsOnTray(ctx, cx, baseY, count, trayWidth) {
    if (count <= 0) return;

    const weightW = 20;
    const weightH = 14;
    const knobR = 3;

    // Max 3 weights per row, stack upwards
    const maxPerRow = Math.min(count, Math.max(2, Math.floor(trayWidth / (weightW + 4))));
    const rows = Math.ceil(count / maxPerRow);

    let drawn = 0;
    for (let r = 0; r < rows; r++) {
      const inThisRow = Math.min(count - drawn, maxPerRow);
      const rowStartX = cx - ((inThisRow - 1) * (weightW + 3)) * 0.5;
      const rowY = baseY - r * (weightH + 2);

      for (let i = 0; i < inThisRow; i++) {
        const wx = rowStartX + i * (weightW + 3);
        this.drawSingleBrassWeight(ctx, wx, rowY, weightW, weightH, knobR);
        drawn++;
      }
    }
  }

  // Draw a single brass slotted weight (standard physics lab weight)
  drawSingleBrassWeight(ctx, cx, bottomY, w, h, knobR) {
    const left = cx - w * 0.5;
    const top = bottomY - h;

    ctx.save();

    // Weight body gradient (polished brass)
    const brassGrad = ctx.createLinearGradient(left, 0, left + w, 0);
    brassGrad.addColorStop(0, '#b45309');
    brassGrad.addColorStop(0.2, '#fef08a');
    brassGrad.addColorStop(0.5, '#f59e0b');
    brassGrad.addColorStop(0.8, '#d97706');
    brassGrad.addColorStop(1, '#92400e');

    ctx.fillStyle = brassGrad;
    ctx.beginPath();
    ctx.roundRect(left, top, w, h, 2);
    ctx.fill();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Top knob handle
    const knobGrad = ctx.createRadialGradient(cx, top - knobR, 1, cx, top - knobR, knobR);
    knobGrad.addColorStop(0, '#fef08a');
    knobGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = knobGrad;
    ctx.beginPath();
    ctx.arc(cx, top - knobR, knobR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // "1N" embossed stamp
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 8px "JetBrains Mono", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1N', cx, top + h * 0.75);

    ctx.restore();
  }

  // Draw floating weight when dragging
  drawFloatingWeight(ctx, x, y, mass) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    this.drawSingleBrassWeight(ctx, x, y + 10, 24, 18, 4);
    ctx.restore();
  }

  // Draw Car on platform for Car Lift Mode
  drawCarPlatform(ctx, cx, trayY) {
    ctx.save();
    // Sturdy hydraulic lift platform
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 70, trayY - 6, 140, 8);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx - 68, trayY - 2, 136, 3); // Safety yellow strip

    // Draw stylish car silhouette/model
    const carX = cx;
    const carY = trayY - 6;

    // Car shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(carX, carY + 2, 60, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car body (Sports Sedan)
    ctx.fillStyle = '#ef4444'; // Racing red
    ctx.beginPath();
    ctx.moveTo(carX - 55, carY - 8);
    ctx.lineTo(carX - 50, carY - 18);
    ctx.lineTo(carX - 25, carY - 22);
    ctx.lineTo(carX - 10, carY - 35); // Windshield
    ctx.lineTo(carX + 25, carY - 35); // Roof
    ctx.lineTo(carX + 42, carY - 18); // Rear window
    ctx.lineTo(carX + 58, carY - 12);
    ctx.lineTo(carX + 58, carY - 8);
    ctx.closePath();
    ctx.fill();

    // Car Windows
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(carX - 20, carY - 22);
    ctx.lineTo(carX - 8, carY - 33);
    ctx.lineTo(carX + 10, carY - 33);
    ctx.lineTo(carX + 10, carY - 22);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(carX + 13, carY - 22);
    ctx.lineTo(carX + 13, carY - 33);
    ctx.lineTo(carX + 24, carY - 33);
    ctx.lineTo(carX + 38, carY - 22);
    ctx.closePath();
    ctx.fill();

    // Wheels
    const drawWheel = (wx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(wx, carY - 6, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(wx, carY - 6, 4, 0, Math.PI * 2);
      ctx.fill();
    };
    drawWheel(carX - 35);
    drawWheel(carX + 35);

    // Car label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ô TÔ: 15.000 N (1.5 tấn)', carX, carY - 42);

    ctx.restore();
  }

  // Draw dual analog dial pressure gauges
  drawPressureGauges(ctx, c1, c2) {
    const s1 = this.carLiftActive ? 500 : this.area1;
    const s2 = this.carLiftActive ? 10 : this.area2;
    const f1 = this.carLiftActive ? this.carWeight : this.weights1 * 1.0;
    const f2 = this.carLiftActive ? this.carLiftPumpForce : this.weights2 * 1.0;
    const p1 = (f1 / s1) * 10;
    const p2 = (f2 / s2) * 10;

    const gaugeR = 22;
    const gaugeY = c1.top + 35;

    this.drawSingleGauge(ctx, c1.left - gaugeR - 8, gaugeY, gaugeR, p1, 'p₁');
    this.drawSingleGauge(ctx, c2.right + gaugeR + 8, gaugeY, gaugeR, p2, 'p₂');
  }

  drawSingleGauge(ctx, gx, gy, r, valueKPa, label) {
    ctx.save();

    // Mounting stem to cylinder
    ctx.fillStyle = '#64748b';
    ctx.fillRect(label === 'p₁' ? gx + r - 2 : gx - r - 6, gy - 3, 8, 6);

    // Outer bezel
    const bezelGrad = ctx.createLinearGradient(gx - r, gy - r, gx + r, gy + r);
    bezelGrad.addColorStop(0, '#f8fafc');
    bezelGrad.addColorStop(1, '#475569');
    ctx.fillStyle = bezelGrad;
    ctx.beginPath();
    ctx.arc(gx, gy, r, 0, Math.PI * 2);
    ctx.fill();

    // Dial face
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(gx, gy, r - 3, 0, Math.PI * 2);
    ctx.fill();

    // Scale ticks
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    for (let a = -Math.PI * 0.75; a <= Math.PI * 0.75; a += Math.PI * 0.25) {
      const tx1 = gx + Math.cos(a) * (r - 7);
      const ty1 = gy + Math.sin(a) * (r - 7);
      const tx2 = gx + Math.cos(a) * (r - 4);
      const ty2 = gy + Math.sin(a) * (r - 4);
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.stroke();
    }

    // Needle rotation (0 to 5 kPa maps to -135deg to +135deg)
    const maxKPa = 5.0;
    const norm = Math.min(1.0, valueKPa / maxKPa);
    const needleAngle = -Math.PI * 0.75 + norm * (Math.PI * 1.5);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + Math.cos(needleAngle) * (r - 6), gy + Math.sin(needleAngle) * (r - 6));
    ctx.stroke();

    // Center pin
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Gauge label text
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${label}`, gx, gy + r * 0.6);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // INTERACTION HANDLERS (Drag & Drop, Clicks)
  // -------------------------------------------------------------
  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    // Canvas Mouse / Touch events for Drag & Drop
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const checkHoverPiston = (pos) => {
      const { c1, c2 } = this.layout;
      if (!c1 || !c2) return null;
      if (pos.x >= c1.left - 20 && pos.x <= c1.right + 20) return 1;
      if (pos.x >= c2.left - 20 && pos.x <= c2.right + 20) return 2;
      return null;
    };

    this.canvas.addEventListener('mousemove', (e) => {
      this.mousePos = getPos(e);
      if (this.isDragging) {
        this.hoverTarget = checkHoverPiston(this.mousePos);
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      this.mousePos = getPos(e);
      if (this.isDragging) {
        this.hoverTarget = checkHoverPiston(this.mousePos);
      }
    }, { passive: false });

    // Click on canvas trays to quickly remove weight
    this.canvas.addEventListener('click', (e) => {
      if (this.isDragging) return;
      const pos = getPos(e);
      const target = checkHoverPiston(pos);
      if (target === 1 && this.weights1 > 0) {
        this.addWeight(1, -1);
      } else if (target === 2 && this.weights2 > 0) {
        this.addWeight(2, -1);
      }
    });

    // Native Drag and Drop from bottom rack
    const dragChips = document.querySelectorAll('.weight-chip-draggable');
    dragChips.forEach(chip => {
      chip.addEventListener('dragstart', (e) => {
        this.draggedWeight = { mass: 1 };
        this.isDragging = true;
        if (window.sound) window.sound.playClick();
      });

      chip.addEventListener('dragend', (e) => {
        if (this.hoverTarget) {
          this.addWeight(this.hoverTarget, 1);
        }
        this.isDragging = false;
        this.draggedWeight = null;
        this.hoverTarget = null;
      });
    });

    this.canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.mousePos = getPos(e);
      this.hoverTarget = checkHoverPiston(this.mousePos);
    });

    this.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      if (this.hoverTarget) {
        this.addWeight(this.hoverTarget, 1);
      }
      this.isDragging = false;
      this.draggedWeight = null;
      this.hoverTarget = null;
    });
  }

  startLoop() {
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;

      this.updatePhysics(dt);
      this.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Instantiate simulation when DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new HydraulicSimulation('simCanvas');
});

