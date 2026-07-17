(function() {
  function initSnake() {
    const canvas = document.getElementById("background-game");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const scale = 10; // Smaller grid cell size (10px) for a smaller snake
    let gridW, gridH;
    let snake = [];
    let food = {};
    let particles = [];
    let floatingText = null;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gridW = Math.ceil(canvas.width / scale);
      gridH = Math.ceil(canvas.height / scale);
      if (snake.length === 0) spawnSnake();
      if (!food.x) spawnFood();
    }

    function spawnSnake() {
      // Spawn at a random location on the screen
      const startX = Math.floor(Math.random() * (gridW - 10)) + 5;
      const startY = Math.floor(Math.random() * (gridH - 10)) + 5;
      snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY },
        { x: startX - 3, y: startY },
        { x: startX - 4, y: startY }
      ];
    }

    function spawnFood() {
      food = {
        x: Math.floor(Math.random() * (gridW - 4)) + 2,
        y: Math.floor(Math.random() * (gridH - 4)) + 2
      };
    }

    window.addEventListener("resize", resize);
    resize();

    // Autonomous snake update loop using recursive setTimeout for variable pacing (slithering)
    function updateSnake() {
      if (snake.length === 0) {
        setTimeout(updateSnake, 130);
        return;
      }

      const head = snake[0];
      const dx = food.x - head.x;
      const dy = food.y - head.y;

      const options = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
      ];

      // Sort moves by distance to food
      options.sort((a, b) => {
        const dA = Math.hypot(head.x + a.x - food.x, head.y + a.y - food.y);
        const dB = Math.hypot(head.x + b.x - food.x, head.y + b.y - food.y);
        return dA - dB;
      });

      // Introduce organic curiosity / winding paths when further from food
      const distToFood = Math.hypot(head.x - food.x, head.y - food.y);
      if (distToFood > 4 && Math.random() < 0.22) {
        // Swap best move with second best move to create natural crawling curves
        const temp = options[0];
        options[0] = options[1] || options[0];
        options[1] = temp;
      }

      // Hammer avoidance logic: filter out moves that get too close to the cursor (ready-to-strike zone)
      const avoidDist = 6; // Grid cells of safety zone
      const safeOptions = options.filter(opt => {
        const nextX = (head.x + opt.x + gridW) % gridW;
        const nextY = (head.y + opt.y + gridH) % gridH;
        const distToMouse = Math.hypot(nextX - (window.mouseGridX || -100), nextY - (window.mouseGridY || -100));
        return distToMouse > avoidDist;
      });

      // Fallback to all options if the snake is cornered or mouse is off-screen
      const choices = ((window.mouseGridX || -100) >= 0 && safeOptions.length > 0) ? safeOptions : options;

      // Seek food while avoiding own body
      let move = null;
      for (const opt of choices) {
        const nextX = (head.x + opt.x + gridW) % gridW;
        const nextY = (head.y + opt.y + gridH) % gridH;
        
        const collidesBody = snake.slice(1).some(seg => seg.x === nextX && seg.y === nextY);
        if (!collidesBody) {
          move = { x: nextX, y: nextY };
          break;
        }
      }

      if (!move) {
        // Trapped: force closest direction
        const nextX = (head.x + options[0].x + gridW) % gridW;
        const nextY = (head.y + options[0].y + gridH) % gridH;
        move = { x: nextX, y: nextY };
      }

      // Add new head
      snake.unshift(move);

      // Consume food
      if (move.x === food.x && move.y === food.y) {
        spawnFood();
      } else {
        snake.pop();
      }

      // Calculate next update delay (organic crawl variation: slither, pause, surge)
      let nextDelay = 110;
      const rand = Math.random();
      
      if (rand < 0.08) {
        // Pause to inspect surroundings/smell the air (300ms - 550ms)
        nextDelay = Math.floor(Math.random() * 250) + 300;
      } else if (rand < 0.20) {
        // Surge forward in excitement (60ms - 80ms)
        nextDelay = Math.floor(Math.random() * 20) + 60;
      } else {
        // Normal slithering variation (100ms - 130ms)
        nextDelay = Math.floor(Math.random() * 30) + 100;
      }

      setTimeout(updateSnake, nextDelay);
    }
    
    // Begin update loops
    setTimeout(updateSnake, 130);

    // Click to Splat & Instantly Respawn
    document.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = Math.floor((e.clientX - rect.left) / scale);
      const clickY = Math.floor((e.clientY - rect.top) / scale);

      // Leniency check (within 2 cells grid distance) for easier clicking on smaller scale
      const clicked = snake.some(seg => {
        return Math.abs(seg.x - clickX) <= 2 && Math.abs(seg.y - clickY) <= 2;
      });

      if (clicked) {
        if (window.playSnakeDeathSound) window.playSnakeDeathSound();
        // Resolve colors dynamically based on active theme variables
        const bodyStyles = getComputedStyle(document.body);
        const colorRed = bodyStyles.getPropertyValue("--color-accent-red").trim() || "#cd5c5c";
        const colorGreen = bodyStyles.getPropertyValue("--color-accent-green").trim() || "#556b2f";

        // 1. Spawn visual splat particles at the old snake location
        particles = [];
        snake.forEach(seg => {
          for (let i = 0; i < 3; i++) {
            particles.push({
              x: (seg.x + 0.5) * scale,
              y: (seg.y + 0.5) * scale,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              alpha: 1.0,
              color: Math.random() > 0.5 ? colorGreen : colorRed
            });
          }
        });

        // 2. Trigger floating score text
        floatingText = {
          x: e.clientX,
          y: e.clientY,
          text: "SPLAT! +100",
          timer: 45
        };

        // 3. Instantly vanish and respawn elsewhere
        spawnSnake();
        spawnFood();
      }
    });

    // Render loop (smooth drawing & splat updates)
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Resolve theme colors dynamically for dark mode support
      const bodyStyles = getComputedStyle(document.body);
      const colorRed = bodyStyles.getPropertyValue("--color-accent-red").trim() || "#cd5c5c";
      const colorGreen = bodyStyles.getPropertyValue("--color-accent-green").trim() || "#556b2f";
      const colorBlue = bodyStyles.getPropertyValue("--color-accent-blue").trim() || "#6495ed";

      // Draw fading splat particles
      particles.forEach((p, idx) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, scale * 0.25, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        
        // Remove dead particles
        if (p.alpha <= 0) {
          particles.splice(idx, 1);
        }
      });
      ctx.globalAlpha = 1.0; // Reset alpha

      // Draw floating score text
      if (floatingText && floatingText.timer > 0) {
        ctx.fillStyle = colorRed;
        ctx.font = "bold 11px 'Press Start 2P', monospace";
        ctx.fillText(floatingText.text, floatingText.x, floatingText.y);
        floatingText.y -= 1.2;
        floatingText.timer--;
      }

      // Draw Food (red circle representing a small apple/berry)
      ctx.fillStyle = colorRed;
      ctx.beginPath();
      ctx.arc(food.x * scale + scale / 2, food.y * scale + scale / 2, scale * 0.4, 0, Math.PI * 2);
      ctx.fill();
      // Draw tiny green leaf pixel for realism
      ctx.fillStyle = colorGreen;
      ctx.fillRect(food.x * scale + scale / 2 + 1, food.y * scale + 1, 1.5, 1.5);

      // Draw Snake (Tapered circles with realistic skin pattern, eyes, and tongue)
      snake.forEach((seg, idx) => {
        const segX = seg.x * scale + scale / 2;
        const segY = seg.y * scale + scale / 2;
        
        // Calculate tapered radius (thick head, thinner tail)
        const radius = (scale * 0.45) * (1 - (idx / snake.length) * 0.45);

        if (idx === 0) {
          // Draw Head
          ctx.fillStyle = colorGreen;
          ctx.beginPath();
          ctx.arc(segX, segY, radius, 0, Math.PI * 2);
          ctx.fill();

          // Calculate movement direction for eyes/tongue positioning
          let dir = { x: 1, y: 0 };
          if (snake.length > 1) {
            let dx = snake[0].x - snake[1].x;
            let dy = snake[0].y - snake[1].y;
            // Handle grid wrap-around check
            if (Math.abs(dx) > 1) dx = -Math.sign(dx);
            if (Math.abs(dy) > 1) dy = -Math.sign(dy);
            dir = { x: dx, y: dy };
          }

          // Blinking red tongue
          if (Math.sin(Date.now() / 80) > 0) {
            ctx.strokeStyle = colorRed;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(segX, segY);
            ctx.lineTo(segX + dir.x * (scale * 0.8), segY + dir.y * (scale * 0.8));
            ctx.stroke();
          }

          // Draw small eyes
          ctx.fillStyle = "#ffffff";
          const eyeRadius = scale * 0.12;
          if (dir.x !== 0) {
            // Horizontal movement, stack eyes vertically
            ctx.beginPath(); ctx.arc(segX + dir.x * (scale * 0.2), segY - (scale * 0.25), eyeRadius, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(segX + dir.x * (scale * 0.2), segY + (scale * 0.25), eyeRadius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#000000";
            ctx.beginPath(); ctx.arc(segX + dir.x * (scale * 0.2), segY - (scale * 0.25), eyeRadius * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(segX + dir.x * (scale * 0.2), segY + (scale * 0.25), eyeRadius * 0.5, 0, Math.PI * 2); ctx.fill();
          } else {
            // Vertical movement, stack eyes horizontally
            ctx.beginPath(); ctx.arc(segX - (scale * 0.25), segY + dir.y * (scale * 0.2), eyeRadius, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(segX + (scale * 0.25), segY + dir.y * (scale * 0.2), eyeRadius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#000000";
            ctx.beginPath(); ctx.arc(segX - (scale * 0.25), segY + dir.y * (scale * 0.2), eyeRadius * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(segX + (scale * 0.25), segY + dir.y * (scale * 0.2), eyeRadius * 0.5, 0, Math.PI * 2); ctx.fill();
          }
        } else {
          // Draw Body segments (alternating colors for a skin pattern)
          ctx.fillStyle = (idx % 2 === 0) ? colorGreen : colorBlue; 
          ctx.beginPath();
          ctx.arc(segX, segY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  window.initSnake = initSnake;
})();
