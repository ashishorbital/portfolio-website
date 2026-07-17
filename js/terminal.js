(function() {
  function initTerminal() {
    const terminalInput = document.getElementById("terminal-input");
    const terminalLog = document.getElementById("terminal-log");
    const terminalBody = document.getElementById("terminal-body");
    if (!terminalInput || !terminalLog || !terminalBody) return;

    // Keep terminal focused when clicking anywhere inside its box
    terminalBody.addEventListener("click", () => {
      terminalInput.focus();
    });

    const commands = {
      help: () => `
SUPPORTED COMMANDS:
  about      - Display professional profile summary
  skills     - List technical skill arrays
  experience - Show industry & internship milestones
  projects   - Show software & ML projects
  education  - Display academic record
  contact    - Display active communication channels
  play       - Boot HACKER_CHALLENGE.SYS mini-game
  crt        - Toggle CRT retro scanline overlay
  dark       - Toggle retro dark mode color theme
  clear      - Clear terminal console log
  help       - Print this command directory
`,
      about: () => `
ASHISH P S - AI/ML ENGINEER & DATA ANALYST
-----------------------------------------
Specializing in Machine Learning pipelines, business intelligence, 
data engineering, and predictive workflows. 

[Current Goal]: Seeking to apply strong analytical and problem-solving 
skills to an AI/ML or Data Analyst role.

B.Tech Computer Science @ CUSAT (CGPA: 7.83)
Location: Kochi, Kerala, India
`,
      skills: () => `
TECHNICAL CAPABILITIES DIRECTORY:
---------------------------------
[Languages]
  - Python, C, Java, C++
[Data & ML]
  - Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn
  - Statistics, Feature Engineering, Predictive Modeling
[Database]
  - MySQL, SQL
[Web Development]
  - HTML, CSS, JavaScript
[Tools & Cloud]
  - Power BI, Tableau, Microsoft Azure, Git, GitHub
`,
      experience: () => `
WORK & INTERNSHIP MILESTONES:
-----------------------------
1. AI/ML Intern @ NestSoft TechnoMaster (May 2026 - Jun 2026)
   - Built 'Shelfsense' business intelligence tool for sales trends.
   - Built full ML pipelines in Python & Scikit-learn.

2. Data Analyst & ML Intern @ Elevate Labs (Apr 2025 - Jun 2025)
   - Performed EDA, cleaning, and statistics on real-world datasets.
   - Designed predictive ML models and evaluated metrics.

3. AI Azure Intern @ Edunet Foundation (May 2025 - Jun 2025)
   - Built deployment pipelines using Microsoft Azure AI services.
`,
      projects: () => `
KEY PROJECT ARTIFACTS:
----------------------
- FIFA WORLD CUP PREDICTION APP (JavaScript)
  Matches outcome predictor, reached 300+ users.
  
- SHELFSENSE BUSINESS INTELLIGENCE (Python, ML)
  Retail shelf/sales trend demand forecaster.

- INCENTIVE CALCULATION SYSTEM (JavaScript)
  Automated Nippon Toyota sales incentive logic.

- PERSONAL PORTFOLIO WEBSITE (HTML, CSS, JS)
  Retro pixel terminal portfolio. Fully responsive layout.
`,
      education: () => `
ACADEMIC RECORDS:
-----------------
B.Tech in Computer Science and Engineering (2023 - 2027)
Cochin University of Science and Technology (CUSAT)
CGPA Score: 7.83 / 10.0

Core Course Modules:
- Data Structures & Algorithms
- Database Management Systems (DBMS)
- Object-Oriented Programming (OOPs)
- Operating Systems (OS)
- Computer Networks
`,
      contact: () => `
COMMUNICATION ENDPOINTS:
------------------------
Email    : ashishpsadan@gmail.com
Phone    : +91-6282761232
LinkedIn : linkedin.com/in/ashishpsadan
GitHub   : github.com/ashishorbital
Location : Kochi, Kerala, India
`,
      crt: () => {
        const active = document.body.classList.toggle("crt-active");
        localStorage.setItem("crt-active", active);
        return `CRT FILTER OVERLAY STATE: ${active ? "ENABLED" : "DISABLED"}`;
      },
      dark: () => {
        const active = document.body.classList.toggle("dark-mode");
        localStorage.setItem("dark-mode", active);
        return `DARK MODE COLOR STATE: ${active ? "ENABLED" : "DISABLED"}`;
      },
      play: () => {
        terminalGameState = "start";
        return `
===================================================
HACKER_CHALLENGE.SYS v1.0.4 - EMULATION SUCCESSFUL
===================================================
You wake up in a locked server room. Alarms blare softly.
Beside you, there's a desk with a GLOWING THUMB DRIVE and a MANUAL.

WHAT WILL YOU DO?
[1] Plug the thumb drive into the mainframe server rack.
[2] Read the printed hacker manual on the desk.

Type '1' or '2' to decide. Type 'exit' to escape back to guest shell.
        `;
      },
      clear: () => {
        terminalLog.innerHTML = "";
        return "";
      }
    };

    let terminalGameState = null;

    function playTextAdventure(input) {
      const rawInput = input.trim().toLowerCase();
      if (rawInput === "exit" || rawInput === "quit") {
        terminalGameState = null;
        return "SIMULATION TERMINATED. BACK TO GUEST SHELL.";
      }

      if (terminalGameState === "start") {
        if (rawInput === "1") {
          terminalGameState = "plugged";
          return `
Mainframe alarms trigger! A red screen demands a passcode:
"ENTER DEC-BASE HASH FOR IP 127.0.0.1".
Beside the terminal is a sticky note with scribbled text: "binary 10101".

WHAT IS THE PASSCODE IN DECIMAL?
[hint] Convert 10101 to decimal.

Type your number answer. Type 'exit' to quit.
          `;
        } else if (rawInput === "2") {
          terminalGameState = "manual";
          return `
You open the manual. On page 42, it describes a backdoor command:
"Type 'hack' to inject override packets."

WHAT DO YOU DO?
[1] Execute the backdoor command 'hack'.
[2] Put the manual down and plug the thumb drive in.

Type '1' or '2'. Type 'exit' to quit.
          `;
        } else {
          return "INVALID SELECTION. Type '1', '2' or 'exit'.";
        }
      }

      if (terminalGameState === "plugged") {
        if (rawInput === "21") {
          terminalGameState = null;
          return `
PASSCODE CORRECT! Mainframe bypassed. 
You have successfully hacked the server room and unlocked the exit door!
Congratulations, Hacker! You completed the challenge. (+500 PTS)

[SIMULATION COMPLETE. GUEST SHELL RESTORED]
          `;
        } else {
          return `
ACCESS DENIED. ALARM SIRENS INTENSIFY.
[hint] 10101 in binary = (1*16) + (0*8) + (1*4) + (0*2) + (1*1) = ?
Try again or type 'exit' to escape.
          `;
        }
      }

      if (terminalGameState === "manual") {
        if (rawInput === "1" || rawInput === "hack") {
          terminalGameState = null;
          return `
Backdoor injected! Overriding mainframe system protocols...
Root access granted. The server room door unlocks silently.
Congratulations, Hacker! You bypassed the locks using documentation. (+500 PTS)

[SIMULATION COMPLETE. GUEST SHELL RESTORED]
          `;
        } else if (rawInput === "2") {
          terminalGameState = "plugged";
          return `
Alarms trigger! A red screen demands a passcode:
"ENTER DEC-BASE HASH FOR IP 127.0.0.1".
Beside the terminal is a sticky note with scribbled text: "binary 10101".

WHAT IS THE PASSCODE IN DECIMAL?
[hint] Convert 10101 to decimal.

Type your number answer. Type 'exit' to quit.
          `;
        } else {
          return "INVALID SELECTION. Type '1', '2' or 'exit'.";
        }
      }

      return "INVALID GAME STATE. Type 'exit' to reset.";
    }

    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag));
    }

    terminalInput.addEventListener("keydown", (e) => {
      if (window.playKeySound) window.playKeySound();
      if (e.key === "Enter") {
        const inputVal = terminalInput.value.trim();
        const safeInputVal = escapeHTML(inputVal);
        
        // Add prompt line
        const promptLine = document.createElement("div");
        promptLine.className = "terminal-line";
        promptLine.innerHTML = `<span class="terminal-prompt">guest@ashish:~$&nbsp;</span>${safeInputVal}`;
        terminalLog.appendChild(promptLine);

        // Intercept inputs if playing hacker minigame
        if (terminalGameState) {
          const responseLine = document.createElement("div");
          responseLine.className = "terminal-line";
          
          const result = playTextAdventure(inputVal);
          responseLine.innerHTML = result.replace(/\n/g, "<br>").replace(/  /g, "&nbsp;&nbsp;");
          terminalLog.appendChild(responseLine);
          
          terminalInput.value = "";
          terminalBody.scrollTo({ top: terminalBody.scrollHeight, behavior: 'smooth' });
          return;
        }

        const commandArgs = inputVal.toLowerCase().split(" ");
        const cmd = commandArgs[0];

        if (cmd) {
          const responseLine = document.createElement("div");
          responseLine.className = "terminal-line";
          
          if (commands[cmd]) {
            const result = commands[cmd]();
            if (cmd !== "clear") {
              responseLine.innerHTML = result.replace(/\n/g, "<br>").replace(/  /g, "&nbsp;&nbsp;");
              terminalLog.appendChild(responseLine);
            }
          } else {
            const safeCmd = escapeHTML(cmd);
            responseLine.innerHTML = `COMMAND NOT FOUND: '${safeCmd}'. Type 'help' for support directory.`;
            responseLine.style.color = "var(--color-accent-red)";
            terminalLog.appendChild(responseLine);
          }
        }

        // Clear input
        terminalInput.value = "";
        
        // Auto scroll
        terminalBody.scrollTo({ top: terminalBody.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  window.initTerminal = initTerminal;
})();
