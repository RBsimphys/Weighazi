const form = document.getElementById('signUpForm');

function selectAct(el, value) {

    // remove previous selection
    document.querySelectorAll(".act-chip").forEach(chip => {
        chip.classList.remove("selected");
    });
    // highlight clicked chip
    el.classList.add("selected");
    // update hidden input value
    document.getElementById("activitylevel").value = value;
}

let lastScroll = 0;

const goback = document.getElementById("goback");

window.addEventListener("scroll", () => {

    const currentScroll = window.scrollY;

    if (currentScroll > lastScroll && currentScroll > 40) {

        goback.classList.add("hide");

    } else {

        goback.classList.remove("hide");
    }

    lastScroll = currentScroll;
});