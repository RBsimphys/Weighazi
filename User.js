
class User {
    constructor(name, goal, weights = []) {
        this.name = name;
        this.goal = goal;
        this.weights = weights;
        this.chart = null;
    }

    getCurrentWeight() {
        return this.weights[this.weights.length - 1];
    }

    getStartingWeight() {
        return this.weights[0];
    }

    addWeight(weight) {
        this.weights.push(weight);
    }

    deleteLastWeight() {
        if (this.weights.length <= 1) return;
        this.weights.pop();
    }

    getProgress() {
        const start = this.getStartingWeight();
        const current = this.getCurrentWeight();

        const total = start - this.goal;
        if (total === 0) return { value: 100, color: "#2ecc71" };

        const raw = ((start - current) / total) * 100;

        let color = "#2ecc71";
        if (raw < 0) color = "#e74c3c";
        else if (raw >= 100) color = "#d2cb00";

        return {
            value: Math.round(raw),
            color
        };
    }

    createWeightChart(canvas) {
        if (this.chart) this.chart.destroy();

        const labels = this.weights.map((_, i) => `Day ${i + 1}`);
        const goalLine = Array(this.weights.length).fill(this.goal);

        const isAboveGoal = this.getCurrentWeight() > this.goal;

        this.chart = new Chart(canvas, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: `${this.name} Weight`,
                        data: this.weights,
                        borderColor: isAboveGoal ? "#e74c3c" : "#2ecc71",
                        backgroundColor: isAboveGoal
                            ? "rgba(231, 76, 60, 0.2)"
                            : "rgba(46, 204, 113, 0.2)",
                        tension: 0.3,
                        fill: true,
                        pointRadius: 4
                    },
                    {
                        label: "Goal",
                        data: goalLine,
                        borderColor: "#f1c40f",
                        borderDash: [6, 6],
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    render() {
        const row = document.createElement("div");
        row.classList.add("row", "player");

        const current = this.getCurrentWeight();
        const progress = this.getProgress();

        row.innerHTML = `
            <span class="name">${this.name}</span>
            <span>${current} lbs</span>
            <span>${this.goal} lbs</span>
            <span class="progress-text" style="color:${progress.color}">
                ${progress.value}%
            </span>

            <div class="details">
                <div class="weight-section">
                    <div class="big-weight">${current} lbs</div>

                    <div class="input-row">
                        <input type="number" class="weight-input" placeholder="New weight"/>
                        <button class="add-btn">Add</button>
                        <button class="delete-btn">Undo</button>
                    </div>
                </div>

                <canvas class="chart"></canvas>
            </div>
        `;

        row.onclick = () => {
            row.classList.toggle("active");

            requestAnimationFrame(() => {
                const canvas = row.querySelector(".chart");

                if (row.classList.contains("active") && !canvas.dataset.rendered) {
                    this.createWeightChart(canvas);
                    canvas.dataset.rendered = "true";
                }
            });
        };

        const addBtn = row.querySelector(".add-btn");
        const deleteBtn = row.querySelector(".delete-btn");
        const input = row.querySelector(".weight-input");

        addBtn.onclick = (e) => {
            e.stopPropagation();

            const value = Number(input.value);
            if (!value) return;

            this.addWeight(value);
            input.value = "";

            this.updateRow(row);
        };

        deleteBtn.onclick = (e) => {
            e.stopPropagation();

            this.deleteLastWeight();
            this.updateRow(row);
        };

        input.onclick = (e) => e.stopPropagation();

        return row;
    }

    updateRow(row) {
        row.querySelector(".big-weight").textContent =
            `${this.getCurrentWeight()} lbs`;

        const progress = this.getProgress();
        const progressEl = row.querySelector(".progress-text");

        progressEl.textContent = `${progress.value}%`;
        progressEl.style.color = progress.color;

        const canvas = row.querySelector(".chart");
        this.createWeightChart(canvas);
        canvas.dataset.rendered = "true";
    }
}

