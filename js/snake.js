(function() {
  function initSnake() {
    const canvas = document.getElementById("background-game");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width, height;
    let snake = [];
    let food = {};
    let particles = [];
    let floatingText = null;
    
    // Config
    const numSegments = 35;
    const segmentLength = 5;
    const maxSpeed = 3.5;
    const turnSpeed = 0.12; // Radians per frame
    let headAngle = Math.random() * Math.PI * 2;
    let time = Math.random() * 100;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      width = canvas.width;
      height = canvas.height;
      if (snake.length === 0) spawnSnake();
      if (!food.x) spawnFood();
    }

    function spawnSnake() {
      const startX = width / 2;
      const startY = height / 2;
      snake = [];
      for (let i = 0; i < numSegments; i++) {
        snake.push({ x: startX, y: startY });
      }
      headAngle = Math.random() * Math.PI * 2;
    }

    function spawnFood() {
      food = {
        x: Math.floor(Math.random() * (width - 100)) + 50,
        y: Math.floor(Math.random() * (height - 100)) + 50
      };
    }

    window.addEventListener("resize", resize);
    resize();

    document.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Leniency check for splat collision
      const clicked = snake.some(seg => {
        return Math.hypot(seg.x - clickX, seg.y - clickY) < 24;
      });

      if (clicked) {
        if (window.playSnakeDeathSound) window.playSnakeDeathSound();
        const bodyStyles = getComputedStyle(document.body);
        const colorRed = bodyStyles.getPropertyValue("--color-accent-red").trim() || "#cd5c5c";
        const colorGreen = bodyStyles.getPropertyValue("--color-accent-green").trim() || "#556b2f";

        particles = [];
        snake.forEach((seg, i) => {
          if (i % 2 !== 0) return; 
          for (let j = 0; j < 3; j++) {
            particles.push({
              x: seg.x,
              y: seg.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              alpha: 1.0,
              color: Math.random() > 0.5 ? colorGreen : colorRed
            });
          }
        });

        floatingText = {
          x: clickX,
          y: clickY,
          text: "SPLAT! +100",
          timer: 45
        };

        spawnSnake();
        spawnFood();
      }
    });

    function normalizeAngle(angle) {
      while (angle <= -Math.PI) angle += Math.PI * 2;
      while (angle > Math.PI) angle -= Math.PI * 2;
      return angle;
    }

    function updatePhysics() {
      time += 0.12;
      
      let mouseX = (window.mouseGridX !== undefined && window.mouseGridX !== -100) ? window.mouseGridX * 10 : -1000;
      let mouseY = (window.mouseGridY !== undefined && window.mouseGridY !== -100) ? window.mouseGridY * 10 : -1000;
      
      const head = snake[0];
      let targetAngle = headAngle;

      const distToMouse = Math.hypot(mouseX - head.x, mouseY - head.y);
      const distToFood = Math.hypot(food.x - head.x, food.y - head.y);

      if (distToMouse < 150) {
        // Flee cursor (hammer) aggressively
        targetAngle = Math.atan2(head.y - mouseY, head.x - mouseX);
      } else {
        // Seek food with organic slithering offset
        let angleToFood = Math.atan2(food.y - head.y, food.x - head.x);
        targetAngle = angleToFood + Math.sin(time) * 0.6;
      }

      // Smooth steering
      let diff = normalizeAngle(targetAngle - headAngle);
      headAngle += Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);

      // Move head forward
      let nextX = head.x + Math.cos(headAngle) * maxSpeed;
      let nextY = head.y + Math.sin(headAngle) * maxSpeed;

      // Screen wrapping
      if (nextX < 0) nextX += width;
      if (nextX >= width) nextX -= width;
      if (nextY < 0) nextY += height;
      if (nextY >= height) nextY -= height;

      snake[0].x = nextX;
      snake[0].y = nextY;

      // Kinematic follow for the rest of the body
      for (let i = 1; i < numSegments; i++) {
        let cur = snake[i];
        let prev = snake[i - 1];
        
        let dx = prev.x - cur.x;
        let dy = prev.y - cur.y;
        
        // Handle wrap around when calculating distance
        if (Math.abs(dx) > width / 2) dx -= Math.sign(dx) * width;
        if (Math.abs(dy) > height / 2) dy -= Math.sign(dy) * height;

        let dist = Math.hypot(dx, dy);
        
        if (dist > segmentLength) {
          let angle = Math.atan2(dy, dx);
          let targetCurX = prev.x - Math.cos(angle) * segmentLength;
          let targetCurY = prev.y - Math.sin(angle) * segmentLength;

          if (targetCurX < 0) targetCurX += width;
          if (targetCurX >= width) targetCurX -= width;
          if (targetCurY < 0) targetCurY += height;
          if (targetCurY >= height) targetCurY -= height;

          cur.x = targetCurX;
          cur.y = targetCurY;
        }
      }

      // Eat food
      if (distToFood < 20) {
        spawnFood();
      }
    }

    function render() {
      updatePhysics();

      ctx.clearRect(0, 0, width, height);

      const bodyStyles = getComputedStyle(document.body);
      const colorRed = bodyStyles.getPropertyValue("--color-accent-red").trim() || "#cd5c5c";
      const colorGreen = bodyStyles.getPropertyValue("--color-accent-green").trim() || "#556b2f";
      const colorBlue = bodyStyles.getPropertyValue("--color-accent-blue").trim() || "#6495ed";

      // Draw splat particles
      particles.forEach((p, idx) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        if (p.alpha <= 0) particles.splice(idx, 1);
      });
      ctx.globalAlpha = 1.0;

      // Floating text
      if (floatingText && floatingText.timer > 0) {
        ctx.fillStyle = colorRed;
        ctx.font = "bold 11px 'Press Start 2P', Courier, monospace";
        ctx.fillText(floatingText.text, floatingText.x, floatingText.y);
        floatingText.y -= 1.2;
        floatingText.timer--;
      }

      // Draw Food (Apple with leaf)
      ctx.fillStyle = colorRed;
      ctx.beginPath();
      ctx.arc(food.x, food.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colorGreen;
      ctx.fillRect(food.x + 1, food.y - 6, 3, 3);

      // Body rendering - break paths if wrapping around screen
      let paths = [];
      let currentPath = [snake[0]];
      
      for (let i = 1; i < numSegments; i++) {
        let dx = snake[i].x - snake[i-1].x;
        let dy = snake[i].y - snake[i-1].y;
        if (Math.abs(dx) > width / 2 || Math.abs(dy) > height / 2) {
          paths.push(currentPath);
          currentPath = [snake[i]];
        } else {
          currentPath.push(snake[i]);
        }
      }
      paths.push(currentPath);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      paths.forEach(path => {
        if (path.length < 2) return;
        
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        ctx.shadowOffsetX = 2;

        for (let i = 0; i < path.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(path[i].x, path[i].y);
          ctx.lineTo(path[i+1].x, path[i+1].y);
          
          let globalIndex = snake.indexOf(path[i]);
          let taper = 1 - (globalIndex / numSegments) * 0.75; // Thick head, thinner tail
          
          ctx.lineWidth = 14 * taper;
          ctx.strokeStyle = (globalIndex % 2 === 0) ? colorGreen : colorBlue;
          ctx.stroke();
        }
        
        ctx.shadowColor = "transparent";
      });

      // Draw Head
      const head = snake[0];
      ctx.fillStyle = colorGreen;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Organic Eyes
      ctx.fillStyle = "#ffffff";
      let eyeOffsetX = Math.cos(headAngle + Math.PI/2) * 4.5;
      let eyeOffsetY = Math.sin(headAngle + Math.PI/2) * 4.5;
      let eyeDist = 2;
      let ex1 = head.x + Math.cos(headAngle)*eyeDist + eyeOffsetX;
      let ey1 = head.y + Math.sin(headAngle)*eyeDist + eyeOffsetY;
      let ex2 = head.x + Math.cos(headAngle)*eyeDist - eyeOffsetX;
      let ey2 = head.y + Math.sin(headAngle)*eyeDist - eyeOffsetY;
      
      ctx.beginPath(); ctx.arc(ex1, ey1, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex2, ey2, 2.5, 0, Math.PI*2); ctx.fill();
      
      ctx.fillStyle = "#000000"; // Pupils
      let pupilDist = 3;
      let px1 = head.x + Math.cos(headAngle)*pupilDist + eyeOffsetX;
      let py1 = head.y + Math.sin(headAngle)*pupilDist + eyeOffsetY;
      let px2 = head.x + Math.cos(headAngle)*pupilDist - eyeOffsetX;
      let py2 = head.y + Math.sin(headAngle)*pupilDist - eyeOffsetY;
      
      ctx.beginPath(); ctx.arc(px1, py1, 1.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(px2, py2, 1.2, 0, Math.PI*2); ctx.fill();

      // Flickering Tongue
      if (Math.sin(Date.now() / 80) > 0) {
        ctx.strokeStyle = colorRed;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(head.x + Math.cos(headAngle)*7, head.y + Math.sin(headAngle)*7);
        ctx.lineTo(head.x + Math.cos(headAngle)*16, head.y + Math.sin(headAngle)*16);
        ctx.stroke();
      }

      requestAnimationFrame(render);
    }
    
    requestAnimationFrame(render);
  }

  window.initSnake = initSnake;
})();
