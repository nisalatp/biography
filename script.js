document.addEventListener('DOMContentLoaded', function() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  const setupThemeToggle = () => {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.innerHTML = document.documentElement.getAttribute('data-theme') === 'light' ? '🌙' : '☀️';
      
      btn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = 'dark';
        let icon = '☀️';
        
        if (theme === 'dark') {
          newTheme = 'light';
          icon = '🌙';
        }
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        document.querySelectorAll('.theme-toggle-btn').forEach(b => {
          b.innerHTML = icon;
        });
      });
    });
  };
  
  setupThemeToggle();

  const contactForm = document.getElementById('contactForm');
  const alertContainer = document.getElementById('alertContainer');

  if (contactForm && alertContainer) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      alertContainer.className = 'alert d-none';
      alertContainer.style.opacity = '0';
      alertContainer.style.transform = 'translateY(-10px)';
      alertContainer.style.transition = 'all 0.3s ease';

      const showAlert = (text, isSuccess) => {
        alertContainer.textContent = text;
        alertContainer.classList.remove('d-none');
        alertContainer.classList.add(isSuccess ? 'alert-success' : 'alert-danger');
        alertContainer.classList.add('glass-panel');
        setTimeout(() => {
          alertContainer.style.opacity = '1';
          alertContainer.style.transform = 'translateY(0)';
        }, 50);
      };

      if (name === "" || email === "" || message === "") {
        showAlert("⚠️ Error: Please fill in all fields before submitting.", false);
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showAlert("⚠️ Error: Please enter a valid email address.", false);
        return;
      }

      showAlert(`🚀 Success! Thank you, ${name}. Your message has been routed to Nisala's cloud inbox. (Mock Mode)`, true);
      contactForm.reset();
    });
  }

  const terminalBody = document.getElementById('terminalBody');
  const actionButtons = document.querySelectorAll('.terminal-action-btn');

  if (terminalBody && actionButtons.length > 0) {
    let isCommandRunning = false;

    const commands = {
      'az-deploy': {
        cmd: 'az webapp deployment source config-zip --name nisalatp-portfolio --src build.zip',
        output: [
          { text: 'Starting deployment upload to Azure Resource Group...', type: 'info' },
          { text: 'Checking Azure subscription validation: SUCCESS', type: 'success' },
          { text: 'Uploading package build.zip (428.6 KB) -> Kudu Endpoint', type: 'info' },
          { text: 'Server status: extracting deployment assets...', type: 'info' },
          { text: 'Deployment sync verified. Live status: OK (200)', type: 'success' },
          { text: 'App Service URL: https://nisalatp-portfolio.azurewebsites.net', type: 'success' }
        ]
      },
      'ping-hosts': {
        cmd: 'ping -c 3 csi-pd-portal.internal',
        output: [
          { text: 'PING csi-pd-portal.internal (10.0.8.4): 56 data bytes', type: 'info' },
          { text: '64 bytes from 10.0.8.4: icmp_seq=0 ttl=64 time=0.42 ms', type: 'output' },
          { text: '64 bytes from 10.0.8.4: icmp_seq=1 ttl=64 time=0.51 ms', type: 'output' },
          { text: '64 bytes from 10.0.8.4: icmp_seq=2 ttl=64 time=0.48 ms', type: 'output' },
          { text: '--- csi-pd-portal.internal ping statistics ---', type: 'output' },
          { text: '3 packets transmitted, 3 packets received, 0.0% packet loss', type: 'success' }
        ]
      },
      'docker-up': {
        cmd: 'docker-compose -f nutt-messenger.yml up -d',
        output: [
          { text: 'Creating network "nutt-network" with driver "bridge"...', type: 'info' },
          { text: 'Creating volume "nutt-db-data" ... done', type: 'success' },
          { text: 'Container nutt-server-1  Starting', type: 'info' },
          { text: 'Container nutt-client-1  Starting', type: 'info' },
          { text: 'Container nutt-server-1  Started - Listening on Port 5005', type: 'success' },
          { text: 'Container nutt-client-1  Started - GUI Environment Ready', type: 'success' }
        ]
      },
      'k8s-get': {
        cmd: 'kubectl get pods -n production -o wide',
        output: [
          { text: 'NAME                               READY   STATUS    RESTARTS   AGE    IP', type: 'output' },
          { text: 'alivio-hms-frontend-87d2a1-xc291   1/1     Running   0          12d    10.244.2.14', type: 'success' },
          { text: 'alivio-hms-backend-f726a2-998ab    2/2     Running   1          12d    10.244.2.15', type: 'success' },
          { text: 'jobdaddy-matching-b6ff65-1234a     1/1     Running   0          4d     10.244.1.92', type: 'success' }
        ]
      },
      'clear': {
        cmd: 'clear',
        output: []
      }
    };

    const appendLine = (text, type) => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'terminal-line';
      
      if (type === 'prompt') {
        lineDiv.innerHTML = `<span class="terminal-prompt">visitor@nisalatp-cloud:~$ </span><span class="terminal-command">${text}</span>`;
      } else {
        let spanClass = 'terminal-output';
        if (type === 'success') spanClass = 'terminal-success';
        if (type === 'warning') spanClass = 'terminal-warning';
        if (type === 'info') spanClass = 'text-white';
        
        lineDiv.innerHTML = `<span class="${spanClass}">${text}</span>`;
      }
      
      terminalBody.appendChild(lineDiv);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    };

    const runCommand = async (cmdId) => {
      if (isCommandRunning) return;
      isCommandRunning = true;

      const commandData = commands[cmdId];
      if (!commandData) {
        isCommandRunning = false;
        return;
      }

      appendLine(commandData.cmd, 'prompt');

      if (cmdId === 'clear') {
        setTimeout(() => {
          terminalBody.innerHTML = '';
          isCommandRunning = false;
        }, 150);
        return;
      }

      for (const line of commandData.output) {
        await new Promise(resolve => setTimeout(resolve, 400));
        appendLine(line.text, line.type);
      }

      isCommandRunning = false;
    };

    actionButtons.forEach(button => {
      button.addEventListener('click', function() {
        const cmdId = this.getAttribute('data-cmd');
        runCommand(cmdId);
      });
    });

    setTimeout(() => {
      appendLine('Welcome to Nisala Aloka Bandara\'s Interactive Portal shell.', 'info');
      appendLine('Click the actions below to query cluster nodes or simulate live deployments.', 'warning');
      appendLine('', 'output');
    }, 500);
  }
});
