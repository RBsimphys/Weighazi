document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg');

    canvas.classList.add('tv-on');

    function navigateWithTvOff(url) {
        canvas.classList.remove('tv-on');
        canvas.classList.add('tv-off');
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    document.querySelectorAll('.user-row').forEach(row => {
        row.addEventListener('click', function () {
            navigateWithTvOff('/user/' + this.dataset.id);
        });
    });

    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            navigateWithTvOff('/');
        });
    }
});

