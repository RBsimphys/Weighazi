const userId = window.location.pathname.split('/')[2];
const addWeightForm = document.getElementById('add-form');
const homeBtn = document.getElementById('homeBtn');
const currentWeightEl = document.getElementById('currentWeight');
const progressRingEl = document.getElementById('progressRing');
const progressTextEl = document.getElementById('progressText');
const logList = document.getElementById('logList');
const weightChart = document.getElementById('weightChart');


let chartInstance = null;

init();

homeBtn.addEventListener('click', () => {
    window.location.href = '/';
});

addWeightForm.addEventListener('submit', handleAddWeight);

async function handleAddWeight(e) {
    e.preventDefault();

    const input = document.getElementById('add-weight');
    const weight = input.value.trim();

    if (!weight) return;

    try {
        const res = await fetch(`/user/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'add-weight': weight
            })
        });

        const json = await res.json();

        if (!json.success) return;

        updateUI(json.user, json.logs);

        input.value = '';

    } catch (err) {
        console.error(err);
    }
}

function updateUI(user, logs) {
    updateUserData(user);
    updateLogList(user, logs);
    updateChart(logs);
}

function updateUserData(user) {

    currentWeightEl.textContent = user.currentweight;

    const progress = Math.round(Number(user.progress));

    progressRingEl.style.setProperty(
        '--progress',
        progress
    );

    progressTextEl.textContent = `${progress}%`;
}

function updateLogList(user, logs) {

    logList.replaceChildren();

    [...logs]
        .reverse()
        .forEach(log => {

            const item = createLogItem(user, log);

            logList.appendChild(item);
        });
}

function createLogItem(user, log) {



    const item = document.createElement('div');
    item.className = 'log-item';

    const weight = document.createElement('span');
    weight.textContent = `${log.weight} lbs`;

    const date = document.createElement('span');
    date.textContent =
        new Date(log.logged_at).toLocaleDateString();

    const deleteLink = document.createElement('a');
    deleteLink.href = '#';
    deleteLink.className = 'delete-link';

    const img = document.createElement('img');
    img.src = '/icons/trash2.svg';
    img.alt = 'delete';
    img.className = 'log-item-img';

    deleteLink.appendChild(img);
    deleteLink.addEventListener('click', async (e) => {
        e.preventDefault();

        await deleteWeight(user.id, log.id);

        await refreshPageData();
    });

    item.append(
        weight,
        date,
        deleteLink
    );

    return item;
}

async function deleteWeight(userId, logId) {

    try {

        await fetch(
            `/user/delete/${userId}/${logId}`,
            {
                method: 'DELETE'
            }
        );

    } catch (err) {
        console.error(err);
    }
}

async function renderChart() {

    const res = await fetch(`/user/${userId}/logs`);

    const logs = await res.json();

    updateChart(logs);
}

function updateChart(logs) {

    const labels = logs.map(log =>
        new Date(log.logged_at).toLocaleDateString(
            'en-GB',
            {
                day: 'numeric',
                month: 'short'
            }
        )
    );

    const weights = logs.map(log => log.weight);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(weightChart, {
        type: 'line',

        data: {
            labels,

            datasets: [{
                label: 'Weight (lbs)',
                data: weights,

                borderColor: '#ecc31e',
                backgroundColor: 'rgba(236,195,30,0.1)',

                tension: 0.3,

                pointRadius: 4,
                pointBackgroundColor: '#ecc31e'
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

async function init() {

    const res = await fetch(`/user/${userId}/logs`);

    const logs = await res.json();

    const userRes = await fetch(`/api/user/${userId}`);

    const user = await userRes.json();

    updateUI(user, logs);
}


async function refreshPageData() {

    const [userRes, logsRes] = await Promise.all([
        fetch(`/api/user/${userId}`),
        fetch(`/user/${userId}/logs`)
    ]);

    const user = await userRes.json();
    const logs = await logsRes.json();

    updateUI(user, logs);
}

renderChart();