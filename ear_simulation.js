// Interactive Human Ear Anatomy & 3D WebGL Simulation (KHTN 8)
// Real-time 3D anatomical model (Three.js), sound transmission, and sudden pressure changes during flight (Takeoff & Landing)

const EAR_PARTS = [
  {
    id: 1,
    name: "Vành tai",
    latin: "Auricle / Pinna",
    badgeTitle: "Vành tai",
    badgeDesc: "Hứng âm thanh",
    color: "#f59e0b",
    colorLight: "#fbbf24",
    pos3D: new THREE.Vector3(-0.84, 0.16, 0.03),
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
    pos3D: new THREE.Vector3(-0.55, -0.05, 0.22),
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
    pos3D: new THREE.Vector3(0.19, 0.08, 0.34),
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
    pos3D: new THREE.Vector3(0.12, 0.19, 0.18),
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
    pos3D: new THREE.Vector3(0.55, 0.17, 0.04),
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
    pos3D: new THREE.Vector3(0.44, 0.17, 0.21),
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
    pos3D: new THREE.Vector3(0.71, -0.31, 0.45),
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
    this.webglMount = document.getElementById('earWebGLMount');
    this.calloutsContainer = document.getElementById('earCalloutsContainer');

    // Sub-mode: 'anatomy' (Tìm hiểu bộ phận) or 'pressure' (Máy bay cất/hạ cánh)
    this.subMode = 'anatomy';

    // HUD annotations visibility toggle
    this.showCallouts = true;

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
    this.initEustachianParticles(32);

    // Sound wave traveling animation
    this.isAcousticPlaying = false;
    this.acousticProgress = 0;

    // Three.js 3D Objects
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.modelGroup = null;
    this.eardrumMesh3D = null;
    this.pinMeshes = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 3D Auto-sway & View State
    this.isAutoSway = false;
    this.swayTime = 0;
    this.baseRotX = 0.0;
    this.baseRotY = 0.0;

    this.initThree();
    this.load3DEarModel();
    this.bindEvents();
    this.resize();
    this.initView();
    this.startLoop();
  }

  // -------------------------------------------------------------
  // THREE.JS 3D SCENE & LIGHTING SETUP
  // -------------------------------------------------------------
  initThree() {
    if (!this.webglMount) return;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera: FOV 36 for natural medical perspective
    const rect = this.viewport.getBoundingClientRect();
    const aspect = (rect.width || 800) / (rect.height || 520);
    this.camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 50);
    this.camera.position.set(0, -0.05, 4.2);

    // 3. Renderer with transparent background (revealing CSS medical teal gradient)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(rect.width || 800, rect.height || 520);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.webglMount.innerHTML = '';
    this.webglMount.appendChild(this.renderer.domElement);

    // 4. Studio Medical Lighting matching user reference (clean, pure anatomical true-color rendering)
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.85));

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.20);
    keyLight.position.set(2.0, 3.5, 4.0);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.10);
    fillLight.position.set(-3.0, -2.0, 2.5);
    this.scene.add(fillLight);

    // 5. OrbitControls: Smooth, responsive 3D mouse rotation, zooming & orbit
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.85;
    this.controls.zoomSpeed = 0.95;
    this.controls.minDistance = 1.8;
    this.controls.maxDistance = 7.0;
    this.controls.maxPolarAngle = Math.PI * 0.92;
    this.controls.minPolarAngle = Math.PI * 0.08;
    this.controls.target.set(0, 0, 0);

    // When student drags, pause auto-sway
    this.controls.addEventListener('start', () => {
      this.isDragging = true;
    });
    this.controls.addEventListener('end', () => {
      this.isDragging = false;
    });
  }

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // LOAD REAL 3D EAR ANATOMICAL MODEL (Sketchfab PBR Reconstructed)
  // + REALISTIC FLIGHT PRESSURE EARDRUM MODELS (catcanh.glb & hacanh.glb)
  // -------------------------------------------------------------
  load3DEarModel() {
    this.modelGroup = new THREE.Group();
    this.pinMeshes = [];
    this.interactiveMeshes = [];
    this.meshNormal = null;
    this.meshTakeoff = null;
    this.meshLanding = null;

    const loader = new THREE.GLTFLoader();

    const buildFull3DModel = (gltf) => {
      const earRoot = new THREE.Group();
      this.earRoot = earRoot;
      const raw = gltf.scene;
      this.meshNormal = raw;

      // 1. Center and scale authentic model to fit viewport cleanly
      const box = new THREE.Box3().setFromObject(raw);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const targetScale = 2.6 / (size.x || 1.1);
      this.modelScale = targetScale;
      this.modelCenter = center;

      raw.scale.set(-targetScale, targetScale, targetScale);
      raw.position.set(center.x * targetScale, -center.y * targetScale, -center.z * targetScale);

      // Process all anatomical meshes from GLB with authentic textures or vertex colors
      raw.traverse(c => {
        if (!c.isMesh) return;
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          c.material.side = THREE.DoubleSide;
          if (c.geometry && c.geometry.attributes && c.geometry.attributes.color) {
            c.material.vertexColors = true;
          } else {
            c.material.vertexColors = false;
          }
          c.material.roughness = 0.55;
          c.material.metalness = 0.05;
          if (c.material.map) {
            c.material.map.encoding = THREE.sRGBEncoding;
            c.material.needsUpdate = true;
          }
        }
        this.interactiveMeshes.push(c);
      });

      earRoot.add(raw);

      // 2. 3D Landmark Hotspot Pins & Sprites
      EAR_PARTS.forEach(p => {
        const pinGeo = new THREE.SphereGeometry(0.046, 24, 24);
        const pinColor = new THREE.Color(p.color);
        const pinMat = new THREE.MeshStandardMaterial({
          color: pinColor,
          roughness: 0.22,
          metalness: 0.15,
          emissive: pinColor,
          emissiveIntensity: 0.45
        });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(p.pos3D);
        pinMesh.userData = { partId: p.id, baseColor: pinColor };
        earRoot.add(pinMesh);
        this.pinMeshes.push(pinMesh);
        this.interactiveMeshes.push(pinMesh);
        p.pinMesh = pinMesh;

        // Glowing Outline Ring
        const ringGeo = new THREE.RingGeometry(0.056, 0.072, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(p.pos3D);
        ringMesh.position.z += 0.005;
        earRoot.add(ringMesh);
        p.ringMesh = ringMesh;
      });

      // Center ear assembly in viewport
      earRoot.position.set(0, 0, 0);
      this.modelGroup.add(earRoot);

      this.modelGroup.rotation.y = this.baseRotY;
      this.modelGroup.rotation.x = this.baseRotX;
      this.scene.add(this.modelGroup);
      console.log("Reconstructed 3D Ear Anatomy Model loaded and initialized successfully!");

      // 3. Load Authentic Deformed Eardrum Models (catcanh.glb & hacanh.glb)
      const setupVariantMesh = (variantGltf, type) => {
        const variantRaw = variantGltf.scene;
        variantRaw.scale.set(-this.modelScale, this.modelScale, this.modelScale);
        variantRaw.position.set(this.modelCenter.x * this.modelScale, -this.modelCenter.y * this.modelScale, -this.modelCenter.z * this.modelScale);
        variantRaw.traverse(c => {
          if (!c.isMesh) return;
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material) {
            c.material.side = THREE.DoubleSide;
            if (c.geometry && c.geometry.attributes && c.geometry.attributes.color) {
              c.material.vertexColors = true;
            } else {
              c.material.vertexColors = false;
            }
            c.material.roughness = 0.55;
            c.material.metalness = 0.05;
            if (c.material.map) {
              c.material.map.encoding = THREE.sRGBEncoding;
              c.material.needsUpdate = true;
            }
          }
        });
        variantRaw.visible = false;
        earRoot.add(variantRaw);
        if (type === 'takeoff') {
          this.meshTakeoff = variantRaw;
          console.log("Realistic Takeoff (catcanh.glb) eardrum model loaded successfully!");
        } else if (type === 'landing') {
          this.meshLanding = variantRaw;
          console.log("Realistic Landing (hacanh.glb) eardrum model loaded successfully!");
        }
        this.updateFlightModel();
      };

      const loadVariant = (url, b64Data, type) => {
        const parseB64 = () => {
          if (!b64Data) return;
          try {
            let buffer;
            if (typeof Uint8Array.fromBase64 === 'function') {
              buffer = Uint8Array.fromBase64(b64Data).buffer;
            } else {
              const chunkSize = 65536;
              const chunks = [];
              for (let i = 0; i < b64Data.length; i += chunkSize) {
                const bin = atob(b64Data.slice(i, i + chunkSize));
                const u8 = new Uint8Array(bin.length);
                for (let j = 0; j < bin.length; j++) u8[j] = bin.charCodeAt(j);
                chunks.push(u8);
              }
              const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
              const fullU8 = new Uint8Array(totalLen);
              let off = 0;
              for (const c of chunks) {
                fullU8.set(c, off);
                off += c.length;
              }
              buffer = fullU8.buffer;
            }
            loader.parse(fullU8.buffer, '', (gltf) => {
              setupVariantMesh(gltf, type);
            }, (err) => console.error(`Error parsing ${type} base64:`, err));
          } catch(e) {
            console.error(`Failed base64 ${type}:`, e);
          }
        };

        loader.load(url, (gltf) => {
          setupVariantMesh(gltf, type);
        }, undefined, () => {
          parseB64();
        });
      };

      loadVariant('catcanh.glb', window.CATCANH_GLB_BASE64, 'takeoff');
      loadVariant('hacanh.glb', window.HACANH_GLB_BASE64, 'landing');
    };

    const parseBase64 = () => {
      const b64 = window.EAR_GLB_BASE64 || window.EAR_MODEL_GLB_BASE64;
      if (b64) {
        try {
          let buffer;
          if (typeof Uint8Array.fromBase64 === 'function') {
            buffer = Uint8Array.fromBase64(b64).buffer;
          } else {
            const chunkSize = 65536;
            const chunks = [];
            for (let i = 0; i < b64.length; i += chunkSize) {
              const slice = b64.slice(i, i + chunkSize);
              const bin = atob(slice);
              const u8 = new Uint8Array(bin.length);
              for (let j = 0; j < bin.length; j++) u8[j] = bin.charCodeAt(j);
              chunks.push(u8);
            }
            const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
            const fullU8 = new Uint8Array(totalLen);
            let off = 0;
            for (const c of chunks) {
              fullU8.set(c, off);
              off += c.length;
            }
            buffer = fullU8.buffer;
          }
          loader.parse(buffer, '', (gltf) => {
            buildFull3DModel(gltf);
          }, (err) => {
            console.error("Base64 GLTF parse error:", err);
          });
        } catch (e) {
          console.error("Failed to parse base64 glb:", e);
        }
      }
    };

    // Try direct fetch first (for local web server), fallback to base64 (for file:// protocol)
    loader.load(
      'ear_model.glb',
      (gltf) => {
        buildFull3DModel(gltf);
      },
      undefined,
      (err) => {
        loader.load(
          'human_ear_anatomy.glb',
          (gltf) => {
            buildFull3DModel(gltf);
          },
          undefined,
          (err2) => {
            console.warn("Direct GLB load unavailable, loading offline base64 model:", err2);
            parseBase64();
          }
        );
      }
    );
  }

  // -------------------------------------------------------------
  // UPDATE FLIGHT 3D MODEL (Switching Normal, Takeoff, Landing Models)
  // -------------------------------------------------------------
  updateFlightModel() {
    if (!this.meshNormal) return;

    let target = 'normal';
    if (this.subMode === 'pressure') {
      // In flight pressure mode:
      // Stage 1 = Cân bằng (mô hình chuẩn phẳng)
      // Stage 2 = Áp suất đổi (mô hình màng nhĩ biến dạng thực tế)
      // Stage 3 = Tiếng động lạ / Ù tai (mô hình màng nhĩ biến dạng thực tế)
      // Stage 4 = Nuốt / ngáp (mô hình biến dạng cho tới khi học sinh bấm nút Nuốt/Ngáp)
      const isDeformed = (this.stage === 2 || this.stage === 3 || (this.stage === 4 && !this.isEqualized));
      if (isDeformed) {
        if (this.flightType === 'takeoff' && this.meshTakeoff) {
          target = 'takeoff';
        } else if (this.flightType === 'landing' && this.meshLanding) {
          target = 'landing';
        }
      }
    }

    this.meshNormal.visible = (target === 'normal');
    if (this.meshTakeoff) this.meshTakeoff.visible = (target === 'takeoff');
    if (this.meshLanding) this.meshLanding.visible = (target === 'landing');

    if (this.eardrumMesh3D) {
      this.eardrumMesh3D.visible = false;
    }
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
    if (!this.viewport) return;
    const rect = this.viewport.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;

    if (this.canvas && this.ctx) {
      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }

    if (this.camera && this.renderer) {
      this.camera.aspect = (rect.width || 800) / (rect.height || 520);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(rect.width, rect.height);
      this.renderer.setPixelRatio(dpr);
    }
  }

  // -------------------------------------------------------------
  // 3D VIEW CONTROLS (Tự lắc, Chú thích, Zoom +, Zoom -, 100%)
  // -------------------------------------------------------------
  toggleAutoSway() {
    this.isAutoSway = !this.isAutoSway;
    const btn = document.getElementById('btnAutoSway');
    const label = document.getElementById('autoSwayLabel');
    if (btn) {
      if (this.isAutoSway) {
        btn.classList.add('active');
        if (label) label.textContent = 'Đang lắc...';
      } else {
        btn.classList.remove('active');
        if (label) label.textContent = 'Tự lắc';
      }
    }
    if (window.sound) window.sound.playClick();
  }

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
    if (!this.camera) return;
    this.camera.position.z = Math.max(2.2, this.camera.position.z - 0.4);
    if (window.sound) window.sound.playClick();
  }

  zoomOut() {
    if (!this.camera) return;
    this.camera.position.z = Math.min(6.5, this.camera.position.z + 0.4);
    if (window.sound) window.sound.playClick();
  }

  resetZoom() {
    this.reset3DView();
  }

  update3DTransform() {
    this.resize();
  }

  reset3DView() {
    if (!this.camera || !this.controls || !this.modelGroup) return;
    this.camera.position.set(0, -0.05, 4.2);
    this.controls.target.set(0, 0, 0);
    this.modelGroup.rotation.set(this.baseRotX, this.baseRotY, 0);
    this.isAutoSway = false;
    const btn = document.getElementById('btnAutoSway');
    const label = document.getElementById('autoSwayLabel');
    if (btn) btn.classList.remove('active');
    if (label) label.textContent = 'Tự lắc';
    if (window.sound) window.sound.playClick();
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
    if (bTitle) bTitle.textContent = 'Khám Phá 7 Bộ Phận Của Tai (Mô Hình 3D)';
    if (bLatin) bLatin.textContent = 'Kéo chuột để xoay 3D • Cuộn chuột để phóng to/thu nhỏ • Bấm điểm (1 - 7)';
    if (bRole) bRole.textContent = 'Hãy xoay mô hình 3D và bấm vào các điểm số (1 - 7) để tìm hiểu cấu tạo và chức năng từng bộ phận!';
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

      if (p.pinMesh) {
        p.pinMesh.material.emissiveIntensity = 0.40;
        p.pinMesh.scale.set(1, 1, 1);
      }
    });
  }

  // -------------------------------------------------------------
  // SUB-MODE SWITCHING ('anatomy' vs 'pressure')
  // -------------------------------------------------------------
  setSubMode(mode) {
    if (mode === 'pressure' && !this.unlockedFlightMode && this.exploredParts.size < 7) {
      if (window.sound) window.sound.playBuzz();
      alert(`Bạn cần bấm tìm hiểu đủ 7 bộ phận của tai trước khi mở khóa mục "Vì sao có tiếng động trong tai"! (Hiện đã khám phá: ${this.exploredParts.size}/7)`);
      return;
    }

    this.subMode = mode;
    const tabAnat = document.getElementById('subTabAnatomy');
    const tabPres = document.getElementById('subTabPressure');
    const panelAnat = document.getElementById('panelAnatomyCard');
    const panelPres = document.getElementById('panelPressureCard');

    if (mode === 'anatomy') {
      if (tabAnat) {
        tabAnat.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs shadow-sm transition";
      }
      if (tabPres) {
        tabPres.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition";
      }
      if (panelAnat) panelAnat.classList.remove('hidden');
      if (panelPres) panelPres.classList.add('hidden');
      if (this.eardrumMesh3D) this.eardrumMesh3D.visible = false;
      this.isEustachianOpen = false;
    } else {
      if (tabAnat) {
        tabAnat.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition";
      }
      if (tabPres) {
        tabPres.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs shadow-sm transition";
      }
      if (panelAnat) panelAnat.classList.add('hidden');
      if (panelPres) panelPres.classList.remove('hidden');
      if (this.eardrumMesh3D) this.eardrumMesh3D.visible = true;

      this.setFlightType(this.flightType || 'landing');
      this.setStage(1);
    }
    this.updateFlightModel();

    if (window.sound) window.sound.playClick();
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

    // Highlight active 3D badge and pin
    EAR_PARTS.forEach(p => {
      const bEl = document.getElementById(`earBadge-${p.id}`);
      if (bEl) {
        if (p.id === id) {
          bEl.classList.add('active');
        } else {
          bEl.classList.remove('active');
        }
      }

      const pinEl = document.getElementById(`earPin-${p.id}`);
      if (pinEl) {
        if (p.id === id) {
          pinEl.classList.add('active');
        } else {
          pinEl.classList.remove('active');
        }
      }

      // Highlight 3D mesh pin
      if (p.pinMesh) {
        if (p.id === id) {
          p.pinMesh.material.emissiveIntensity = 0.95;
          p.pinMesh.scale.set(1.35, 1.35, 1.35);
        } else {
          p.pinMesh.material.emissiveIntensity = 0.40;
          p.pinMesh.scale.set(1, 1, 1);
        }
      }
    });

    // Update bottom info card
    this.updateBottomInfoBanner(part);

    // Update exploration progress
    this.updateExplorationProgress();

    if (window.sound) window.sound.playTone(320 + id * 60, 0.12, 'sine');
  }

  nextPart() {
    if (!this.selectedPartId) {
      this.selectPart(1);
      return;
    }
    const nextId = (this.selectedPartId % 7) + 1;
    this.selectPart(nextId);
  }

  updateBottomInfoBanner(part) {
    const banner = document.getElementById('earPartInfoBanner');
    const bNum = document.getElementById('bannerPartNum');
    const bTitle = document.getElementById('bannerPartTitle');
    const bLatin = document.getElementById('bannerPartLatin');
    const bRole = document.getElementById('bannerPartRole');
    const bDetails = document.getElementById('bannerPartDetails');
    const nextBtn = document.getElementById('btnBannerNextPart');

    if (banner) {
      banner.classList.remove('hidden');
      banner.style.borderTopColor = part.color;
    }
    if (bNum) {
      bNum.textContent = part.id;
      bNum.style.background = part.color;
      bNum.style.color = '#ffffff';
    }
    if (bTitle) bTitle.textContent = `${part.id}. ${part.name}`;
    if (bLatin) bLatin.textContent = part.latin;
    if (bRole) bRole.textContent = part.role;
    if (bDetails) bDetails.textContent = part.details;

    if (nextBtn) {
      const nextId = (part.id % 7) + 1;
      const nextPart = EAR_PARTS.find(p => p.id === nextId);
      nextBtn.innerHTML = `<span>Tiếp theo: ${nextId}. ${nextPart.name} →</span>`;
      nextBtn.onclick = () => this.selectPart(nextId);
    }
  }

  updateExplorationProgress() {
    const count = this.exploredParts.size;
    const progressText = document.getElementById('earProgressText');
    const progressBar = document.getElementById('earProgressBar');
    const progressBadge = document.getElementById('earProgressBadge');

    if (progressText) progressText.textContent = `${count} / 7 hoàn thành`;
    if (progressBar) progressBar.style.width = `${Math.round((count / 7) * 100)}%`;
    if (progressBadge) progressBadge.textContent = `${count} / 7 bộ phận`;

    // Cập nhật trạng thái từng dòng hiển thị tiến độ bên phải
    EAR_PARTS.forEach(p => {
      const itemEl = document.getElementById(`partStatus-${p.id}`);
      if (itemEl) {
        const isExplored = this.exploredParts.has(p.id);
        const isCurrent = (this.selectedPartId === p.id);
        const checkEl = itemEl.querySelector('.part-check');

        if (isCurrent) {
          itemEl.className = "part-status-item p-2 rounded-xl border-2 border-sky-500 bg-sky-50 text-sky-900 font-bold flex items-center justify-between shadow-sm transition";
          if (checkEl) {
            checkEl.textContent = '✓';
            checkEl.className = 'part-check font-black text-xs text-sky-600';
          }
        } else if (isExplored) {
          itemEl.className = "part-status-item p-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-medium flex items-center justify-between transition";
          if (checkEl) {
            checkEl.textContent = '✓';
            checkEl.className = 'part-check font-black text-xs text-emerald-600';
          }
        } else {
          itemEl.className = "part-status-item p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 flex items-center justify-between transition";
          if (checkEl) {
            checkEl.textContent = '○';
            checkEl.className = 'part-check font-bold text-xs text-slate-400';
          }
        }
      }
    });

    // Mở khóa phần áp suất khi hoàn thành đủ 7 bộ phận
    if (count === 7 && !this.unlockedFlightMode) {
      this.unlockedFlightMode = true;
      const unlockAlert = document.getElementById('flightUnlockedAlert');
      const lockBadge = document.getElementById('flightLockBadge');

      if (unlockAlert) unlockAlert.classList.remove('hidden');
      if (lockBadge) lockBadge.classList.add('hidden');

      if (window.sound) window.sound.playFanfare();
    }
  }

  // -------------------------------------------------------------
  // FLIGHT SCENARIO TOGGLE (Takeoff vs Landing)
  // -------------------------------------------------------------
  setFlightType(type) {
    this.flightType = (type === 'takeoff') ? 'takeoff' : 'landing';
    const btnTakeoff = document.getElementById('btnFlightTakeoff');
    const btnLanding = document.getElementById('btnFlightLanding');

    if (this.flightType === 'takeoff') {
      if (btnTakeoff) {
        btnTakeoff.className = "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition shadow-sm bg-sky-600 text-white";
      }
      if (btnLanding) {
        btnLanding.className = "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition shadow-sm bg-transparent text-slate-600 hover:text-slate-800";
      }
    } else {
      if (btnLanding) {
        btnLanding.className = "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition shadow-sm bg-amber-600 text-white";
      }
      if (btnTakeoff) {
        btnTakeoff.className = "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition shadow-sm bg-transparent text-slate-600 hover:text-slate-800";
      }
    }

    this.setStage(1);
    if (window.sound) window.sound.playClick();
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
    this.isEqualized = false;

    // Update 4 quick pills
    for (let i = 1; i <= 4; i++) {
      const btn = document.getElementById(`stageBtn-${i}`);
      if (btn) {
        if (i === stageNum) {
          btn.className = "stage-nav-pill active flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border border-amber-400 bg-amber-100 text-amber-900 shadow-sm transition";
        } else {
          btn.className = "stage-nav-pill flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition";
        }
      }
    }

    const titleEl = document.getElementById('flightStageTitle');
    const descEl = document.getElementById('flightStageDesc');
    const outerPEl = document.getElementById('flightOuterP');
    const innerPEl = document.getElementById('flightInnerP');
    const deltaPEl = document.getElementById('flightDeltaP');
    const badgeEl = document.getElementById('eardrumStateBadge');
    const stepInd = document.getElementById('stageStepIndicator');
    const btnPrev = document.getElementById('btnPrevStage');
    const btnNext = document.getElementById('btnNextStage');
    const swallowBtn = document.getElementById('swallowActionBtn');

    if (stepInd) stepInd.textContent = `Giai đoạn ${stageNum} / 4`;
    if (btnPrev) btnPrev.disabled = (stageNum === 1);
    if (btnNext) btnNext.disabled = (stageNum === 4);

    const isLanding = (this.flightType === 'landing');

    if (stageNum === 1) {
      // 1. CÂN BẰNG
      if (isLanding) {
        this.pOuter = 80;
        this.pInner = 80;
        if (titleEl) titleEl.textContent = "1. Cân bằng: Máy bay bay ổn định trên cao";
        if (descEl) descEl.textContent = "Trong khoang máy bay trên cao (độ cao ổn định), áp suất khoảng 80 kPa. Áp suất hai bên màng nhĩ bằng nhau (80 kPa = 80 kPa) nên màng nhĩ ở vị trí phẳng cân bằng, vòi tai đang đóng. Ta nghe rõ và không có tiếng động lạ.";
      } else {
        this.pOuter = 101;
        this.pInner = 101;
        if (titleEl) titleEl.textContent = "1. Cân bằng: Máy bay chuẩn bị cất cánh ở mặt đất";
        if (descEl) descEl.textContent = "Ở mặt đất, áp suất khí quyển là 101 kPa. Áp suất trong ống tai và tai giữa đều bằng 101 kPa. Màng nhĩ ở trạng thái phẳng cân bằng, vòi tai đang đóng kín tự nhiên.";
      }

      this.targetDeform = 0;
      this.isEustachianOpen = false;
      if (swallowBtn) {
        swallowBtn.disabled = true;
        swallowBtn.classList.remove('animate-pulse');
      }

      if (badgeEl) {
        badgeEl.textContent = "Màng nhĩ: Cân bằng phẳng (Bình thường)";
        badgeEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
      }
    }
    else if (stageNum === 2) {
      // 2. ÁP SUẤT ĐỔI
      if (isLanding) {
        this.pOuter = 101;
        this.pInner = 80;
        if (titleEl) titleEl.textContent = "2. Áp suất đổi: Máy bay hạ cánh, áp suất ngoài tăng";
        if (descEl) descEl.textContent = "Máy bay hạ độ cao rất nhanh từ trên trời xuống đất: áp suất không khí bên ngoài tăng vọt từ 80 lên 101 kPa. Không khí bên ngoài tràn vào ống tai tức thì, trong khi vòi tai vẫn đóng nên tai giữa chưa kịp thích ứng (vẫn còn 80 kPa).";
      } else {
        this.pOuter = 80;
        this.pInner = 101;
        if (titleEl) titleEl.textContent = "2. Áp suất đổi: Máy bay cất cánh bay lên cao, áp suất ngoài giảm";
        if (descEl) descEl.textContent = "Máy bay lấy độ cao rất nhanh: áp suất không khí bên ngoài giảm nhanh từ 101 xuống còn 80 kPa. Áp suất trong ống tai giảm theo, trong khi áp suất trong tai giữa vẫn giữ mức 101 kPa ban đầu.";
      }

      this.targetDeform = 0.5;
      this.isEustachianOpen = false;
      if (swallowBtn) {
        swallowBtn.disabled = true;
        swallowBtn.classList.remove('animate-pulse');
      }

      if (badgeEl) {
        badgeEl.textContent = isLanding ? "Màng nhĩ: Bắt đầu bị ép vào trong" : "Màng nhĩ: Bắt đầu bị đẩy phồng ra ngoài";
        badgeEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300";
      }
    }
    else if (stageNum === 3) {
      // 3. TIẾNG ĐỘNG / Ù TAI
      if (isLanding) {
        this.pOuter = 101;
        this.pInner = 80;
        if (titleEl) titleEl.textContent = "3. Mất cân bằng áp suất: Tiếng động trong tai / Ù tai!";
        if (descEl) descEl.textContent = "Áp suất ngoài (101 kPa) LỚN HƠN áp suất trong (80 kPa), tạo lực ép mạnh đẩy màng nhĩ đột ngột lõm sâu về phía tai giữa! Sự biến dạng đột ngột này tạo nên cảm giác căng tức, tiếng 'bộp' hoặc triệu chứng ù tai.";
      } else {
        this.pOuter = 80;
        this.pInner = 101;
        if (titleEl) titleEl.textContent = "3. Mất cân bằng áp suất: Màng nhĩ phồng lồi ra ngoài → Tiếng 'bộp' / Ù tai!";
        if (descEl) descEl.textContent = "Áp suất ngoài (80 kPa) NHỎ HƠN áp suất trong (101 kPa)! Không khí trong tai giữa nở ra đẩy màng nhĩ phồng lồi ra phía ngoài ống tai, gây căng tức màng nhĩ và sinh ra tiếng động lạ/ù tai!";
      }

      this.targetDeform = 1.0;
      this.isEustachianOpen = false;
      if (swallowBtn) {
        swallowBtn.disabled = true;
        swallowBtn.classList.remove('animate-pulse');
      }

      if (badgeEl) {
        badgeEl.textContent = isLanding ? "⚠️ Màng nhĩ: LÕM SÂU VÀO TRONG (Ù TAI)" : "⚠️ Màng nhĩ: PHỒNG LỒI RA NGOÀI (Ù TAI)";
        badgeEl.className = "px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse";
      }

      if (window.sound) {
        window.sound.playTone(180, 0.35, 'sawtooth');
        setTimeout(() => window.sound.playTone(2800, 0.45, 'sine'), 100);
      }
    }
    else if (stageNum === 4) {
      // 4. NUỐT / NGÁP (Học sinh chủ động bấm)
      if (titleEl) titleEl.textContent = "4. Nuốt / ngáp: Mở vòi tai cân bằng lại áp suất!";
      if (descEl) descEl.textContent = "Vòi tai đang đóng nên áp suất hai bên chưa thể cân bằng. Hãy bấm vào nút [🗣️ NUỐT / NGÁP] màu xanh bên dưới để mở vòi tai, cho luồng khí lưu thông cân bằng lại màng nhĩ!";

      this.targetDeform = 1.0;
      this.isEustachianOpen = false;
      if (swallowBtn) {
        swallowBtn.disabled = false;
        swallowBtn.classList.add('animate-pulse');
      }

      if (badgeEl) {
        badgeEl.textContent = "👉 Hãy bấm nút [🗣️ NUỐT / NGÁP] bên dưới!";
        badgeEl.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-400";
      }
    }

    const delta = Math.abs(this.pOuter - this.pInner);
    if (outerPEl) outerPEl.textContent = `${this.pOuter} kPa`;
    if (innerPEl) innerPEl.textContent = `${this.pInner} kPa`;
    if (deltaPEl) deltaPEl.textContent = `${delta} kPa`;

    // Update 3D realistic eardrum model based on current stage & flight scenario
    this.updateFlightModel();
  }

  // Action khi học sinh bấm nút "Nuốt / Ngáp" ở giai đoạn 4
  doSwallowOrYawn() {
    this.isEqualized = true;
    this.isEustachianOpen = true;
    this.targetDeform = 0; // Màng nhĩ bật phẳng trở lại

    // Đưa áp suất hai bên về cân bằng
    this.pInner = this.pOuter;

    const titleEl = document.getElementById('flightStageTitle');
    const descEl = document.getElementById('flightStageDesc');
    const innerPEl = document.getElementById('flightInnerP');
    const deltaPEl = document.getElementById('flightDeltaP');
    const badgeEl = document.getElementById('eardrumStateBadge');
    const swallowBtn = document.getElementById('swallowActionBtn');

    if (innerPEl) innerPEl.textContent = `${this.pInner} kPa`;
    if (deltaPEl) deltaPEl.textContent = `0 kPa`;

    const isLanding = (this.flightType === 'landing');

    if (titleEl) titleEl.textContent = "4. Đã cân bằng: Màng nhĩ bật phẳng trở lại!";
    if (descEl) {
      if (isLanding) {
        descEl.textContent = "Vòi tai đã mở! Không khí từ vòm mũi - họng tràn qua vòi tai vào tai giữa, đưa áp suất trong tai giữa lên bằng 101 kPa. Màng nhĩ bật phẳng trở lại vị trí bình thường, tiếng ù tai biến mất hoàn toàn!";
      } else {
        descEl.textContent = "Vòi tai đã mở! Không khí dư thừa trong tai giữa theo vòi tai thoát xuống họng, đưa áp suất tai giữa giảm về 80 kPa bằng áp suất bên ngoài. Màng nhĩ bật phẳng trở lại, tai nghe rõ ràng!";
      }
    }

    if (badgeEl) {
      badgeEl.textContent = "✅ Màng nhĩ: CÂN BẰNG PHẲNG HOÀN TOÀN (Nghe rõ)";
      badgeEl.className = "px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300";
    }

    if (swallowBtn) {
      swallowBtn.classList.remove('animate-pulse');
    }

    // Switch back to normal balanced 3D model
    this.updateFlightModel();

    if (window.sound) {
      window.sound.playTone(450, 0.12, 'sine');
      setTimeout(() => window.sound.playTone(650, 0.18, 'sine'), 120);
      setTimeout(() => window.sound.playTone(950, 0.35, 'triangle'), 240);
    }
  }

  // -------------------------------------------------------------
  // SOUND WAVE PROPAGATION ANIMATION (Phát sóng âm)
  // -------------------------------------------------------------
  playAcousticWave() {
    this.isAcousticPlaying = true;
    this.acousticProgress = 0;

    if (window.sound) {
      window.sound.playTone(260, 0.1, 'sine');
      setTimeout(() => window.sound.playTone(390, 0.1, 'sine'), 400);
      setTimeout(() => window.sound.playTone(520, 0.1, 'sine'), 800);
      setTimeout(() => window.sound.playTone(650, 0.1, 'sine'), 1200);
      setTimeout(() => window.sound.playTone(850, 0.18, 'triangle'), 1600);
    }
  }

  // -------------------------------------------------------------
  // 2D CANVAS DRAWING (Arrows, Sound Waves & Overlays)
  // -------------------------------------------------------------
  renderCanvasOverlays() {
    if (!this.ctx || !this.viewport) return;
    const ctx = this.ctx;
    const canvasRect = this.viewport.getBoundingClientRect();
    ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);

    // 1. Sync 3D Pin positions to DOM and draw dynamic connecting arrows
    this.update3DPinProjections(ctx, canvasRect);

    // 2. Sound Wave Traveling Animation
    if (this.isAcousticPlaying) {
      this.drawAcousticWaveFlow(ctx, canvasRect);
    }

    // 3. Pressure Mode Overlays (Arrows & Eustachian Airflow)
    if (this.subMode === 'pressure') {
      this.drawFlightPressureEffects(ctx, canvasRect);
    }
  }

  // Project 3D positions to 2D screen coordinates and draw arrows
  update3DPinProjections(ctx, canvasRect) {
    if (!this.camera || !this.modelGroup) return;

    EAR_PARTS.forEach(part => {
      const pinEl = document.getElementById(`earPin-${part.id}`);
      if (!pinEl || !part.pinMesh) return;

      // World position of 3D pin
      const p3D = part.pinMesh.getWorldPosition(new THREE.Vector3());
      p3D.project(this.camera);

      // Clip if behind camera
      if (p3D.z > 1.0) {
        pinEl.style.display = 'none';
        return;
      }
      pinEl.style.display = 'flex';

      // Screen pixel coordinates
      const sx = (p3D.x * 0.5 + 0.5) * canvasRect.width;
      const sy = (-p3D.y * 0.5 + 0.5) * canvasRect.height;

      // Update DOM pin position
      pinEl.style.left = `${sx}px`;
      pinEl.style.top = `${sy}px`;

      // Save for arrow rendering
      part.screenX = sx;
      part.screenY = sy;
    });

    // Draw connecting arrows if HUD is visible
    if (this.showCallouts) {
      EAR_PARTS.forEach(part => {
        const badgeEl = document.getElementById(`earBadge-${part.id}`);
        if (!badgeEl || part.screenX === undefined) return;

        const bRect = badgeEl.getBoundingClientRect();
        const vRect = canvasRect;

        // Start coordinate from badge border
        let startX, startY;
        if (part.arrowSide === 'right') {
          startX = (bRect.right - vRect.left);
          startY = (bRect.top + bRect.bottom) / 2 - vRect.top;
        } else if (part.arrowSide === 'bottom') {
          startX = (bRect.left + bRect.right) / 2 - vRect.left;
          startY = (bRect.bottom - vRect.top);
        } else {
          startX = (bRect.left - vRect.left);
          startY = (bRect.top + bRect.bottom) / 2 - vRect.top;
        }

        const endX = part.screenX;
        const endY = part.screenY;

        const isCurrent = (this.selectedPartId === part.id);
        const arrowColor = isCurrent ? '#fbbf24' : part.color;
        const lineWidth = isCurrent ? 2.8 : 2.0;

        ctx.save();
        ctx.strokeStyle = arrowColor;
        ctx.fillStyle = arrowColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Smooth cubic bezier line
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        let cp1x = midX;
        let cp1y = startY;
        let cp2x = midX;
        let cp2y = endY;

        if (part.id === 4) {
          // Chuỗi xương con: graceful vertical curve from top-center badge down to pin
          cp1x = startX;
          cp1y = startY + (endY - startY) * 0.45;
          cp2x = endX;
          cp2y = endY - (endY - startY) * 0.35;
        } else if (part.id === 3) {
          // Màng nhĩ: sweep smoothly below ear canal to avoid crossing Pin 2
          cp1x = startX + (endX - startX) * 0.55;
          cp1y = startY;
          cp2x = endX - 40;
          cp2y = endY + 45;
        }

        // Calculate approach angle towards pin
        const angle = Math.atan2(endY - cp2y, endX - cp2x);
        const pinRadius = 14;
        const targetX = endX - Math.cos(angle) * pinRadius;
        const targetY = endY - Math.sin(angle) * pinRadius;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, targetX, targetY);
        ctx.stroke();

        // Arrow head ending cleanly at pin outer rim
        const headLen = isCurrent ? 12 : 9;
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(targetX - headLen * Math.cos(angle - Math.PI / 7), targetY - headLen * Math.sin(angle - Math.PI / 7));
        ctx.lineTo(targetX - headLen * Math.cos(angle + Math.PI / 7), targetY - headLen * Math.sin(angle + Math.PI / 7));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    }
  }

  // Sound wave ripples
  drawAcousticWaveFlow(ctx, canvasRect) {
    const p1 = EAR_PARTS.find(p => p.id === 1);
    const p2 = EAR_PARTS.find(p => p.id === 2);
    const p3 = EAR_PARTS.find(p => p.id === 3);
    const p4 = EAR_PARTS.find(p => p.id === 4);
    const p6 = EAR_PARTS.find(p => p.id === 6);
    const p5 = EAR_PARTS.find(p => p.id === 5);

    if (!p1 || !p2 || !p3 || !p4 || !p6 || !p5) return;
    const waypoints = [p1, p2, p3, p4, p6, p5];

    const totalSegs = waypoints.length - 1;
    const scaledProg = this.acousticProgress * totalSegs;
    const currSeg = Math.min(totalSegs - 1, Math.floor(scaledProg));
    const segT = scaledProg - currSeg;

    const A = waypoints[currSeg];
    const B = waypoints[currSeg + 1];

    if (A.screenX && B.screenX) {
      const curX = A.screenX + (B.screenX - A.screenX) * segT;
      const curY = A.screenY + (B.screenY - A.screenY) * segT;

      ctx.save();
      // Wave rings
      for (let r = 1; r <= 3; r++) {
        const radius = (r * 12) + (segT * 10);
        const alpha = Math.max(0, 1 - (radius / 45));
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(curX, curY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Energy core
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(curX, curY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Pressure mode overlays (Airflow along curved Eustachian tube & pressure vectors)
  drawFlightPressureEffects(ctx, canvasRect) {
    const eardrum = EAR_PARTS.find(p => p.id === 3);
    const eustachian = EAR_PARTS.find(p => p.id === 7);
    if (!eardrum || !eustachian || !eardrum.screenX || !eustachian.screenX) return;

    // 1. Airflow stream along Eustachian tube during Stage 4
    if (this.isEustachianOpen) {
      const isLanding = (this.flightType === 'landing');
      // Spline from throat (pin 7) to middle ear (pin 3)
      const startX = eustachian.screenX;
      const startY = eustachian.screenY;
      const endX = eardrum.screenX + 20;
      const endY = eardrum.screenY + 10;
      const cpX = (startX + endX) / 2 + 15;
      const cpY = (startY + endY) / 2;

      ctx.save();
      this.eustachianParticles.forEach(p => {
        p.progress += 0.015 * p.speed;
        if (p.progress > 1) p.progress = 0;

        const t = isLanding ? p.progress : (1 - p.progress);
        const oneMinusT = 1 - t;
        // Quadratic bezier formula
        const bx = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * cpX + t * t * endX;
        const by = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * cpY + t * t * endY;

        ctx.fillStyle = isLanding ? '#34d399' : '#38bdf8';
        ctx.shadowColor = isLanding ? '#10b981' : '#0284c7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bx + p.offset, by, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 2. Pressure vectors across eardrum in Stage 2 and 3
    if (this.stage === 2 || this.stage === 3) {
      const isLanding = (this.flightType === 'landing');
      const edX = eardrum.screenX;
      const edY = eardrum.screenY;

      ctx.save();
      // Outer ear canal pressure arrow (blue)
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(edX - 45, edY);
      ctx.lineTo(edX - 12, edY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(edX - 10, edY);
      ctx.lineTo(edX - 20, edY - 6);
      ctx.lineTo(edX - 20, edY + 6);
      ctx.closePath();
      ctx.fill();

      // Inner ear pressure arrow (amber/rose)
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = '#f43f5e';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(edX + 45, edY);
      ctx.lineTo(edX + 12, edY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(edX + 10, edY);
      ctx.lineTo(edX + 20, edY - 6);
      ctx.lineTo(edX + 20, edY + 6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  // -------------------------------------------------------------
  // MOUSE & TOUCH EVENT LISTENERS (Orbit & Raycaster Pin Click)
  // -------------------------------------------------------------
  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    if (!this.viewport) return;

    // Click on 3D Viewport Raycaster to select pin/part
    this.viewport.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('.ear-callout-badge')) return;

      const rect = this.viewport.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.camera && this.interactiveMeshes && this.interactiveMeshes.length > 0) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveMeshes);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (hit.userData && hit.userData.partId) {
            this.selectPart(hit.userData.partId);
          }
        }
      }
    });

    // Double-click to reset 3D camera
    this.viewport.addEventListener('dblclick', (e) => {
      if (e.target.closest('button') || e.target.closest('.ear-callout-badge')) return;
      this.reset3DView();
    });
  }

  // -------------------------------------------------------------
  // ANIMATION LOOP (60 FPS)
  // -------------------------------------------------------------
  startLoop() {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // 1. Controls update
      if (this.controls) {
        this.controls.update();
      }

      // 2. Auto-Sway smooth 3D oscillation
      if (this.isAutoSway && !this.isDragging && this.modelGroup) {
        this.swayTime += dt * 0.9;
        this.modelGroup.rotation.y = this.baseRotY + Math.sin(this.swayTime) * 0.22;
        this.modelGroup.rotation.x = this.baseRotX + Math.cos(this.swayTime * 0.7) * 0.06;
      }

      // 3. Realistic Eardrum Deformation & Physiological Tremor (Stage 3 Ù tai / Tiếng động)
      this.eardrumDeform += (this.targetDeform - this.eardrumDeform) * 8.0 * dt;
      if (this.subMode === 'pressure' && this.stage === 3 && this.modelCenter && this.modelScale) {
        const vibrate = Math.sin(now * 0.045) * 0.0022;
        const baseY = -this.modelCenter.y * this.modelScale;
        if (this.meshTakeoff && this.meshTakeoff.visible) {
          this.meshTakeoff.position.y = baseY + vibrate;
        }
        if (this.meshLanding && this.meshLanding.visible) {
          this.meshLanding.position.y = baseY + vibrate;
        }
      } else if (this.modelCenter && this.modelScale) {
        const baseY = -this.modelCenter.y * this.modelScale;
        if (this.meshTakeoff) this.meshTakeoff.position.y = baseY;
        if (this.meshLanding) this.meshLanding.position.y = baseY;
      }

      // 4. Acoustic wave progression
      if (this.isAcousticPlaying) {
        this.acousticProgress += dt * 0.45;
        if (this.acousticProgress >= 1.0) {
          this.isAcousticPlaying = false;
          this.acousticProgress = 0;
        }
      }

      // 5. Render Three.js 3D WebGL Scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      // 6. Render 2D Overlays (Projected 3D Pins, Arrows & Particles)
      this.renderCanvasOverlays();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('ear3DViewport')) {
    window.earSim = new EarSimulation('earCanvas');
  }
});
