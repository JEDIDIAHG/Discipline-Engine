// --- STATE MANAGEMENT ---
let dailyPlan = {
    date: new Date().toLocaleDateString(),
    tasks: [], // Array of { id, text, completed, failureReason }
    executionScore: 0,
    isEvaluated: false
};

// --- DOM ELEMENTS ---
const dateEl = document.getElementById('current-date');
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const evaluateBtn = document.getElementById('evaluate-btn');
const evaluationModal = document.getElementById('evaluation-modal');
const evaluationItems = document.getElementById('evaluation-items');
const submitEvaluationBtn = document.getElementById('submit-evaluation');
const dashboardSection = document.getElementById('dashboard-section');
const scorePercentageEl = document.getElementById('score-percentage');
const verdictTextEl = document.getElementById('verdict-text');

// Initialize Date Display
dateEl.textContent = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});

// --- MORNING PHASE: TASKS MANAGEMENT ---
addBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (!text) return;
    
    if (dailyPlan.tasks.length >= 5) {
        alert("Discipline rule: Focus on a maximum of 5 core tasks today.");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        failureReason: null
    };

    dailyPlan.tasks.push(newTask);
    taskInput.value = '';
    renderTasks();
});

function renderTasks() {
    taskList.innerHTML = '';
    dailyPlan.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `<span>${task.text}</span>`;
        taskList.appendChild(li);
    });
}

// --- NIGHT PHASE: EVALUATION ARCHITECTURE ---
evaluateBtn.addEventListener('click', () => {
    if (dailyPlan.tasks.length === 0) {
        alert("You have no blueprint to evaluate today.");
        return;
    }
    
    buildEvaluationUI();
    evaluationModal.classList.remove('hidden');
});

function buildEvaluationUI() {
    evaluationItems.innerHTML = '';
    
    dailyPlan.tasks.forEach((task, index) => {
        const row = document.createElement('div');
        row.className = 'eval-row';
        row.innerHTML = `
            <p><strong>Task ${index + 1}:</strong> ${task.text}</p>
            <div class="eval-controls">
                <button type="button" class="eval-btn" id="success-${task.id}">EXECUTED</button>
                <button type="button" class="eval-btn" id="fail-${task.id}">FAILED</button>
            </div>
            <div id="reason-container-${task.id}" class="hidden">
                <select id="reason-${task.id}">
                    <option value="Procrastinated/Distracted">Procrastinated/Distracted</option>
                    <option value="Poor Time Allocation">Poor Time Allocation</option>
                    <option value="Unforeseen External Blocker">Unforeseen External Blocker</option>
                </select>
            </div>
        `;
        evaluationItems.appendChild(row);

        // Target buttons for this specific task row
        const successBtn = document.getElementById(`success-${task.id}`);
        const failBtn = document.getElementById(`fail-${task.id}`);
        const reasonContainer = document.getElementById(`reason-container-${task.id}`);

        successBtn.addEventListener('click', () => {
            task.completed = true;
            successBtn.classList.add('active-success');
            failBtn.classList.remove('active-fail');
            reasonContainer.classList.add('hidden');
        });

        failBtn.addEventListener('click', () => {
            task.completed = false;
            failBtn.classList.add('active-fail');
            successBtn.classList.remove('active-success');
            reasonContainer.classList.remove('hidden');
        });
    });
}

// --- CALCULATION AND SUBMISSION ---
submitEvaluationBtn.addEventListener('click', () => {
    // Basic verification check: make sure every task has a verdict assigned
    let allAssigned = true;
    dailyPlan.tasks.forEach(task => {
        const successBtn = document.getElementById(`success-${task.id}`);
        const failBtn = document.getElementById(`fail-${task.id}`);
        if (!successBtn.classList.contains('active-success') && !failBtn.classList.contains('active-fail')) {
            allAssigned = false;
        }
    });

    if (!allAssigned) {
        alert("Accountability requires checking every metric. Assign a status to all tasks.");
        return;
    }

    // Process final stats
    let completedCount = 0;
    dailyPlan.tasks.forEach(task => {
        if (task.completed) {
            completedCount++;
        } else {
            task.failureReason = document.getElementById(`reason-${task.id}`).value;
        }
    });

    dailyPlan.executionScore = Math.round((completedCount / dailyPlan.tasks.length) * 100);
    dailyPlan.isEvaluated = true;

    // Display updates
    evaluationModal.classList.add('hidden');
    displayDashboard(dailyPlan.executionScore);
});

function displayDashboard(score) {
    dashboardSection.classList.remove('hidden');
    scorePercentageEl.textContent = `${score}%`;
    
    let verdict = "";
    if (score === 100) verdict = "Absolute Mastery. Flawless execution.";
    else if (score >= 75) verdict = "Strong focus. High performance with minor room for adjustments.";
    else if (score >= 50) verdict = "Compromised execution. Identify the distractions and cut them out.";
    else verdict = "Discipline breakdown. Re-evaluate your focus immediately.";
    
    verdictTextEl.textContent = verdict;
    
    // Disable interface interactions to lock down today's verdict
    addBtn.disabled = true;
    taskInput.disabled = true;
    evaluateBtn.disabled = true;
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered successfully.', reg))
            .catch(err => console.log('Service Worker registration failed.', err));
    });
}