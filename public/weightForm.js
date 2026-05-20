
const canvas2 = document.getElementById('profile-bg');

const homeBtn = document.getElementById('homeBtn');

homeBtn.addEventListener('click', () => {
    navigateWithTvOff('/');
});

function navigateWithTvOff(url) {
    canvas.classList.remove('tv-on');
    canvas.classList.add('tv-off');
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

const addWeightForm = document.getElementById('add-form');

if (addWeightForm) {
    addWeightForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.querySelector('#add-weight');  // define input here
        const data = input.value;
        const id = window.location.pathname.split('/')[2];

        if (!data) return;
        flashStart = performance.now();
        try {
            const res = await fetch(`/user/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'add-weight': data })
            });

            const json = await res.json();
            console.log(json); // check what's coming back


            if (json.success) {
                const { user, logs } = json;

                document.querySelector('#currentWeight').textContent = user.currentweight;

                const progress = Math.round(Number(user.progress));
                document.querySelector('#progressRing').style.setProperty('--progress', progress);
                document.querySelector('#progressText').textContent = `${progress}%`;

                const logList = document.querySelector('#logList');
                logList.innerHTML = logs.map(log => `
                    <div class="log-item">
                        <span>${log.weight} lbs</span>
                        <span>${new Date(log.logged_at).toLocaleDateString()}</span>
                    </div>
                `).join('');

                input.value = '';
                renderChart();
            }

        } catch (error) {
            console.error('fetch error:', error);
        }
    });
}


const weightChart = document.getElementById('weightChart');
let chartInstance = null;

async function renderChart() {

    const id = window.location.pathname.split('/')[2];
    const res = await fetch(`/user/${id}/logs`);
    const json = await res.json();

    const labels = json.map(e => new Date(e.logged_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
    const weights = json.map(e => e.weight);

    if (chartInstance !== null) {
        chartInstance.destroy();
        chartInstance = null;
    }

    let cfg = {
        type: 'line',
        data: {
            labels: labels,
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
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: false }
            }
        }
    };



    chartInstance = new Chart(weightChart, cfg);
}

renderChart();
