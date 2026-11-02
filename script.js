let habits = [];
let habitChart = null;
const API_URL = 'http://localhost:3000/habits';

async function fetchHabits() {
    try {
        const response = await fetch(API_URL);
        habits = await response.json();
        renderTable();
        updateGraph();
    } catch (error) {
        console.error('Error fetching habits:', error);
    }
}

async function addHabit() {
    const input = document.getElementById('habitInput');
    const durationSelect = document.getElementById('durationSelect');
    const habitName = input.value.trim();
    const totalDays = parseInt(durationSelect.value);
    
    if (habitName === "") {
        alert("Kripya habit ka naam likhein!");
        return;
    }

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: habitName, totalDays: totalDays })
    });

    input.value = "";
    fetchHabits();
}

async function toggleDay(id, dayIndex, currentDays) {
    currentDays[dayIndex] = !currentDays[dayIndex];

    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: currentDays })
    });
    fetchHabits();
}

async function deleteHabit(id) { 
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    fetchHabits();
}

function renderTable() {
    const tbody = document.getElementById('habitTableBody');
    tbody.innerHTML = "";

    habits.forEach(habit => {
        const row = document.createElement('tr');
        
        // Single line horizontal scroll grid for days
        let daysHtml = `<div class="days-scroll-container">`;
        for (let i = 0; i < habit.totalDays; i++) {
            let isChecked = habit.days[i] ? 'checked' : '';
            let daysString = JSON.stringify(habit.days).replace(/"/g, '&quot;');
            daysHtml += `
                <div class="day-item">
                    <input type="checkbox" class="day-checkbox" ${isChecked} onclick="toggleDay('${habit.id || habit._id}', ${i}, JSON.parse('${daysString}'))" title="Day ${i+1}">
                    <span>${i+1}</span>
                </div>
            `;
        }
        daysHtml += `</div>`;

        row.innerHTML = `
            <td class="habit-name">${habit.name} <br><small style="color:#94a3b8; font-weight:normal;">${habit.totalDays} Days Goal</small></td>
            <td>${daysHtml}</td>
            <td><button class="delete-btn" onclick="deleteHabit('${habit.id || habit._id}')">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

function updateGraph() {
    let maxDays = habits.length > 0 ? Math.max(...habits.map(h => h.totalDays)) : 30;
    let progressPerDay = new Array(maxDays).fill(0);
    
    habits.forEach(habit => {
        for (let i = 0; i < habit.totalDays; i++) {
            if (habit.days[i]) {
                progressPerDay[i]++;
            }
        }
    });

    let cumulativeSum = [];
    let total = 0;
    for(let i = 0; i < maxDays; i++) {
        total += progressPerDay[i];
        cumulativeSum.push(total);
    }

    const labels = Array.from({length: maxDays}, (_, i) => `Day ${i + 1}`);
    const ctx = document.getElementById('habitChart').getContext('2d');

    if (habitChart) {
        habitChart.destroy();
    }

    // Gradient fill for smooth modern look
    let gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    habitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Progress',
                data: cumulativeSum,
                borderColor: '#10b981',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: { color: '#94a3b8', font: { family: 'Inter' } }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(51, 65, 85, 0.3)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(51, 65, 85, 0.3)' },
                    ticks: { color: '#94a3b8', stepSize: 1 }
                }
            }
        }
    });
}

fetchHabits();