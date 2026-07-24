(function() {
  const pullChain = document.getElementById('theme-pull-chain');
  const chainBeads = document.getElementById('chain-beads');
  const knob = document.getElementById('chain-knob');
  
  if (!pullChain || !chainBeads || !knob) return;

  // Configuration
  const numBeads = 40;
  const REST_LENGTH = 11;
  const ANCHOR_Y = -250;
  const GRAVITY = 0.8;
  const FRICTION = 0.98;
  const NUM_ITERATIONS = 50; // Increased to 50 for a stiff chain that doesn't stretch
  const TOGGLE_THRESHOLD = 60; // How far down the knob needs to go to toggle
  
  // State
  const nodes = [];
  let isDragging = false;
  let draggedNodeIndex = -1;
  let hasTriggeredThisPull = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let knobStartX = 0;
  let knobStartY = 0;
  let mouseX = 0;
  let mouseY = 0;

  // Initialize nodes (0 to numBeads-1 are beads, numBeads is knob)
  for (let i = 0; i <= numBeads; i++) {
    let element = null;
    if (i < numBeads) {
      element = document.createElement('div');
      element.className = 'bead';
      chainBeads.appendChild(element);
    } else {
      element = knob;
    }
    
    // Initial position hanging straight down
    const startY = ANCHOR_Y + (i * REST_LENGTH); 
    
    nodes.push({
      x: 0,
      y: startY,
      oldX: 0,
      oldY: startY,
      element: element,
      mass: (i === numBeads) ? 3 : 1 // Knob is heavier
    });
  }

  function playPullChainSound() {
    if (window.isSoundEnabled && window.isSoundEnabled()) {
      if (window.initAudio) window.initAudio();
      const ctx = window.AudioContext || window.webkitAudioContext;
      if (!ctx) return;
      const audioCtx = new ctx();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = "square";
      osc.frequency.setValueAtTime(100, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    }
  }

  function toggleTheme() {
    const isActive = document.body.classList.toggle("dark-mode");
    localStorage.setItem("dark-mode", isActive);
    playPullChainSound();
  }

  function updatePhysics() {
    // 1. Verlet Integration (apply forces and update positions)
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      if (i === 0) {
        // Anchor point: bouncy/stretchy constraint back to origin
        const vx = (node.x - node.oldX) * FRICTION;
        const vy = (node.y - node.oldY) * FRICTION;
        
        node.oldX = node.x;
        node.oldY = node.y;
        
        // Stretchy anchor back to 0, ANCHOR_Y
        node.x += vx + (0 - node.x) * 0.1;
        node.y += vy + (ANCHOR_Y - node.y) * 0.1;
      } else if (i === draggedNodeIndex && isDragging) {
        // Being dragged by mouse
        const targetX = knobStartX + (mouseX - dragStartX);
        const targetY = knobStartY + (mouseY - dragStartY);
        
        // Prevent pushing up too high easily, mostly allow pulling down
        node.oldX = node.x;
        node.oldY = node.y;
        
        // Move towards target
        node.x += (targetX - node.x) * 0.5;
        node.y += (targetY - node.y) * 0.5;
        
      } else {
        // Normal node
        const vx = (node.x - node.oldX) * FRICTION;
        const vy = (node.y - node.oldY) * FRICTION;
        
        node.oldX = node.x;
        node.oldY = node.y;
        
        node.x += vx;
        node.y += vy + GRAVITY; // add gravity
        
        // Wind or noise could go here
      }
    }

    // 2. Resolve Constraints (keep distance between nodes)
    for (let iteration = 0; iteration < NUM_ITERATIONS; iteration++) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const node1 = nodes[i];
        const node2 = nodes[i + 1];
        
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) continue;
        
        const difference = REST_LENGTH - distance;
        const percent = difference / distance / 2;
        const offsetX = dx * percent;
        const offsetY = dy * percent;
        
        if (i === 0) {
          // If node 1 is anchor, only move node 2
          node2.x += offsetX * 2;
          node2.y += offsetY * 2;
        } else if (i + 1 === draggedNodeIndex && isDragging) {
          // If node 2 is being dragged, only move node 1
          node1.x -= offsetX * 2;
          node1.y -= offsetY * 2;
        } else if (i === draggedNodeIndex && isDragging) {
          // If node 1 is being dragged, only move node 2
          node2.x += offsetX * 2;
          node2.y += offsetY * 2;
        } else {
          // Move both equally
          node1.x -= offsetX;
          node1.y -= offsetY;
          node2.x += offsetX;
          node2.y += offsetY;
        }
      }
    }
    
    // Check threshold toggle
    const knobNode = nodes[nodes.length - 1];
    const restKnobY = ANCHOR_Y + (numBeads * REST_LENGTH);
    if (isDragging && draggedNodeIndex === nodes.length - 1 && !hasTriggeredThisPull && (knobNode.y - restKnobY > TOGGLE_THRESHOLD)) {
      hasTriggeredThisPull = true;
      toggleTheme();
    }

    // 3. Render
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.element.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
    }

    requestAnimationFrame(updatePhysics);
  }

  // Interaction
  function onPointerDown(e) {
    dragStartX = e.clientX || e.touches?.[0].clientX || 0;
    dragStartY = e.clientY || e.touches?.[0].clientY || 0;
    
    // Find clicked node
    draggedNodeIndex = -1;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].element === e.target) {
        draggedNodeIndex = i;
        break;
      }
    }
    // Default to knob if clicking empty container space
    if (draggedNodeIndex === -1) draggedNodeIndex = nodes.length - 1;
    
    isDragging = true;
    hasTriggeredThisPull = false;
    
    const targetNode = nodes[draggedNodeIndex];
    knobStartX = targetNode.x;
    knobStartY = targetNode.y;
    mouseX = dragStartX;
    mouseY = dragStartY;
    
    pullChain.style.cursor = 'grabbing';
    e.preventDefault();
    
    const cursor = document.getElementById('custom-cursor');
    if (cursor) cursor.style.display = 'none';
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    mouseX = e.clientX || e.touches?.[0].clientX || 0;
    mouseY = e.clientY || e.touches?.[0].clientY || 0;
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    pullChain.style.cursor = 'grab';
    
    // Add a slight random jolt on release to make it wobble realistically
    if (draggedNodeIndex !== -1) {
      nodes[draggedNodeIndex].x += (Math.random() - 0.5) * 10;
    }
    
    const cursor = document.getElementById('custom-cursor');
    if (cursor && !pullChain.matches(':hover')) {
      cursor.style.display = 'block';
    }
  }

  pullChain.addEventListener('mousedown', onPointerDown);
  pullChain.addEventListener('touchstart', onPointerDown, { passive: false });
  
  pullChain.addEventListener('mouseenter', () => {
    const cursor = document.getElementById('custom-cursor');
    if (cursor) cursor.style.display = 'none';
  });
  pullChain.addEventListener('mouseleave', () => {
    if (isDragging) return;
    const cursor = document.getElementById('custom-cursor');
    if (cursor) cursor.style.display = 'block';
  });
  
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('touchend', onPointerUp);
  
  // Start loop
  requestAnimationFrame(updatePhysics);
  
})();
