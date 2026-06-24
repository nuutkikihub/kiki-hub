document.addEventListener('DOMContentLoaded', () => {
  // 1. Parse App Config from URL Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const appId = urlParams.get('app') || 'kiki-box';
  const isMockMode = urlParams.get('mock') === 'true';

  // 2. Define App Configuration Registry
  const APPS_CONFIG = {
    "kiki-box": {
      title: "KIKI BOX",
      prefix: "kiki-box",
      buildDir: "WebGL/kiki-box/Build",
      description: "Flawless Snap-Fit, Zero Friction Out of the Box. Say goodbye to parts that are too tight to assemble or too loose to hold. KIKI HUB's advanced procedural geometry core automatically calculates the perfect mechanical tolerance required for structural connections. No matter how much you scale or resize your models, every joint, interlocking latch, and puzzle box edge will snap together seamlessly and securely on your first print minutes."
    },
    "kiki-joint": {
      title: "KIKI JOINT",
      prefix: "kiki-joint",
      buildDir: "WebGL/kiki-joint/Build",
      description: "Flawless Snap-Fit, Zero Friction Out of the Box. Say goodbye to parts that are too tight to assemble or too loose to hold. KIKI HUB's advanced procedural geometry core automatically calculates the perfect mechanical tolerance required for structural connections. No matter how much you scale or resize your models, every joint, interlocking latch, and puzzle box edge will snap together seamlessly and securely on your first print minutes."
    },
    "kiki-frame": {
      title: "KIKI FRAME",
      prefix: "kiki-frame",
      buildDir: "WebGL/kiki-frame/Build",
      description: "Flawless Snap-Fit, Zero Friction Out of the Box. Say goodbye to parts that are too tight to assemble or too loose to hold. KIKI HUB's advanced procedural geometry core automatically calculates the perfect mechanical tolerance required for structural connections. No matter how much you scale or resize your models, every joint, interlocking latch, and puzzle box edge will snap together seamlessly and securely on your first print minutes."
    },
    "kiki-lattice": {
      title: "KIKI LATTICE",
      prefix: "kiki-lattice",
      buildDir: "WebGL/kiki-lattice/Build",
      description: "Flawless Snap-Fit, Zero Friction Out of the Box. Say goodbye to parts that are too tight to assemble or too loose to hold. KIKI HUB's advanced procedural geometry core automatically calculates the perfect mechanical tolerance required for structural connections. No matter how much you scale or resize your models, every joint, interlocking latch, and puzzle box edge will snap together seamlessly and securely on your first print minutes."
    },
    "kiki-vase": {
      title: "KIKI VASE",
      prefix: "kiki-vase",
      buildDir: "WebGL/kiki-vase/Build",
      description: "Flawless Snap-Fit, Zero Friction Out of the Box. Say goodbye to parts that are too tight to assemble or too loose to hold. KIKI HUB's advanced procedural geometry core automatically calculates the perfect mechanical tolerance required for structural connections. No matter how much you scale or resize your models, every joint, interlocking latch, and puzzle box edge will snap together seamlessly and securely on your first print minutes."
    }
  };

  // Get active config
  const config = APPS_CONFIG[appId] || APPS_CONFIG["kiki-box"];

  // 3. Update DOM Titles & Descriptions
  document.title = `${config.title} Player - KIKI HUB`;
  const appDisplayTitle = document.getElementById('app-display-title');
  const appMetaTitle = document.getElementById('app-meta-title');
  const appMetaDesc = document.querySelector('.app-meta p');
  const loadingAppName = document.getElementById('loading-app-name');
  
  if (appDisplayTitle) appDisplayTitle.textContent = config.title;
  if (appMetaTitle) appMetaTitle.textContent = config.title;
  if (appMetaDesc) appMetaDesc.textContent = config.description;
  if (loadingAppName) loadingAppName.textContent = `LOADING ${config.title}...`;

  // UI Element Selectors
  const canvas = document.getElementById('unity-canvas');
  
  // Disable right-click context menu on canvas to allow orbiting with right-click drag
  if (canvas) {
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  const loadingOverlay = document.getElementById('loading-overlay');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressPercent = document.getElementById('progress-percent');
  const errorBox = document.getElementById('error-box');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  // 4. Initialize Loader (Mock vs Real WebGL)
  if (isMockMode) {
    runMockLoadingSequence();
  } else {
    // Attempt to load the real Unity WebGL script
    loadRealUnityBuild();
  }

  // --- Real Unity Loader Logic ---
  function loadRealUnityBuild() {
    const loaderScriptUrl = `${config.buildDir}/${config.prefix}.loader.js`;

    const script = document.createElement('script');
    script.src = loaderScriptUrl;
    
    script.onload = () => {
      const unityConfig = {
        dataUrl: `${config.buildDir}/${config.prefix}.data.unityweb`,
        frameworkUrl: `${config.buildDir}/${config.prefix}.framework.js.unityweb`,
        codeUrl: `${config.buildDir}/${config.prefix}.wasm.unityweb`,
        streamingAssetsUrl: "StreamingAssets",
        companyName: "KIKI PRODUCTION",
        productName: config.title,
        productVersion: "1.0.0",
      };

      // Call Unity 6 initialization
      if (typeof createUnityInstance !== 'undefined') {
        createUnityInstance(canvas, unityConfig, (progress) => {
          const percent = Math.round(progress * 100);
          progressBarFill.style.width = `${percent}%`;
          progressPercent.textContent = `Loading resources: ${percent}%`;
        }).then((unityInstance) => {
          // Success: Fade out overlay
          loadingOverlay.classList.add('fade-out');
          window.unityInstance = unityInstance;
        }).catch((err) => {
          showError(`Failed to initialize WebGL player: ${err}`);
        });
      } else {
        showError("Unity WebGL loader loaded, but 'createUnityInstance' is not defined.");
      }
    };

    script.onerror = () => {
      // Fallback to Mock Mode automatically so the user can preview the website dashboard
      console.warn(`Could not load real WebGL script at ${loaderScriptUrl}. Falling back to interactive Mock Mode.`);
      showWarningPopup(`No WebGL build found at: "${loaderScriptUrl}". Running in Preview Mock Mode.`);
      runMockLoadingSequence();
    };

    document.body.appendChild(script);
  }

  // --- Mock/Preview Simulator Sequence ---
  function runMockLoadingSequence() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          loadingOverlay.classList.add('fade-out');
          initializeInteractiveMockCanvas();
        }, 300);
      }
      progressBarFill.style.width = `${progress}%`;
      progressPercent.textContent = `[PREVIEW MOCK] Loading resources: ${progress}%`;
    }, 150);
  }

  // Draw an interactive animated canvas if real WebGL isn't built yet
  function initializeInteractiveMockCanvas() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotation = 0;

    function drawMock() {
      // Clear
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid helper
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw 3D Box Simulation based on App type
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      ctx.fillStyle = 'rgba(198, 40, 40, 0.8)';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;

      ctx.font = '800 1.5rem Outfit, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(`${config.title} (PREVIEW WORKSPACE)`, 0, -180);

      ctx.font = '500 1rem Outfit, sans-serif';
      ctx.fillStyle = '#b0b0b0';
      ctx.fillText("Unity WebGL build files are not yet detected.", 0, 160);
      ctx.fillText("Upload your WebGL build to start using the real tool.", 0, 185);

      // Rotate box
      rotation += 0.01;
      ctx.rotate(rotation);

      // Simple 3D projection of shape
      const size = 120;
      if (appId === 'kiki-box') {
        ctx.fillStyle = 'rgba(198, 40, 40, 0.4)';
        ctx.strokeRect(-size/2, -size/2, size, size);
        ctx.fillRect(-size/2, -size/2, size, size);
      } else if (appId === 'kiki-vase') {
        // Draw Vase Shape
        ctx.fillStyle = 'rgba(255, 235, 59, 0.2)';
        ctx.strokeStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.moveTo(-size/3, -size/2);
        ctx.quadraticCurveTo(-size, 0, -size/3, size/2);
        ctx.lineTo(size/3, size/2);
        ctx.quadraticCurveTo(size, 0, size/3, -size/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Star or Pentagon Generator representation
        ctx.fillStyle = 'rgba(0, 150, 136, 0.3)';
        ctx.strokeStyle = '#009688';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * size / 1.5,
                     Math.sin((18 + i * 72) * Math.PI / 180) * size / 1.5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
      requestAnimationFrame(drawMock);
    }

    drawMock();
  }

  // --- Helper Popup Alert ---
  function showWarningPopup(msg) {
    const banner = document.createElement('div');
    banner.style.position = 'absolute';
    banner.style.bottom = '10px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.backgroundColor = '#f57f17';
    banner.style.color = '#fff';
    banner.style.padding = '8px 16px';
    banner.style.borderRadius = '20px';
    banner.style.fontSize = '0.85rem';
    banner.style.fontFamily = 'Outfit, sans-serif';
    banner.style.fontWeight = 'bold';
    banner.style.zIndex = '999';
    banner.style.opacity = '0.85';
    banner.textContent = msg;

    const wrapper = document.getElementById('webgl-container');
    if (wrapper) {
      wrapper.appendChild(banner);
      setTimeout(() => banner.remove(), 6000);
    }
  }

  // --- Error display ---
  function showError(msg) {
    console.error(msg);
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
    loadingOverlay.style.display = 'none';
  }

  // 5. Fullscreen Event Binding
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (window.unityInstance) {
        window.unityInstance.SetFullscreen(1);
      } else if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
      } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen(); // Safari support
      } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen(); // IE/Edge support
      }
    });
  }
});
