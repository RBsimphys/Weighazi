const canvas2 = document.getElementById('profile-bg');
const homeBtn = document.getElementById('homeBtn');
const addWeightForm = document.getElementById('add-form');
const weightChart = document.getElementById('weightChart');

let chartInstance = null;

if (homeBtn) {
    homeBtn.addEventListener('click', () => {
        window.location.href = '/';
    });
}

if (addWeightForm) {
    addWeightForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const input = document.querySelector('#add-weight');
        const data = input.value;
        const id = window.location.pathname.split('/')[2];

        if (!data) return;

        if (typeof flashStart !== 'undefined') {
            flashStart = performance.now();
        }

        try {
            const res = await fetch(`/user/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'add-weight': data })
            });

            const json = await res.json();

            if (json.success) {
                const { user, logs } = json;

                document.querySelector('#currentWeight').textContent = user.currentweight;

                const progress = Math.round(Number(user.progress));
                document.querySelector('#progressRing').style.setProperty('--progress', progress);
                document.querySelector('#progressText').textContent = `${progress}%`;

                const logList = document.querySelector('#logList');
                const newestLog = logs[logs.length - 1];

                logList.insertAdjacentHTML('afterbegin', `
                    <div class="log-item">
                        <span>${newestLog.weight} lbs</span>
                        <span>${new Date(newestLog.logged_at).toLocaleDateString()}</span>
                    </div>
                `);

                input.value = '';

                await renderChart();
            }

        } catch (error) {
            console.error('fetch error:', error);
        }
    });
}

async function renderChart() {
    if (!weightChart) return;

    const id = window.location.pathname.split('/')[2];
    const res = await fetch(`/user/${id}/logs`);
    const json = await res.json();

    const labels = json.map(e =>
        new Date(e.logged_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short'
        })
    );

    const weights = json.map(e => e.weight);

    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = weights;
        chartInstance.update();
        return;
    }

    chartInstance = new Chart(weightChart, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Weight (lbs)',
                data: weights,
                borderColor: '#ecc31e',
                backgroundColor: 'rgba(236, 195, 30, 0.1)',
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#ecc31e'
            }]
        },
        options: {
            responsive: true,
            animation: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}

renderChart();