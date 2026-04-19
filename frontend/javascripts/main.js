const userArray = [];


userArray.push(new User(
    "Ahmad Hijazi",
    150,
    [120]
));

userArray.push(new User(
    "Lina Hijazi",
    165,
    [120]
));

userArray.push(new User(
    "Mohammad Hijazi",
    140,
    [120]
));
userArray.push(new User(
    "Sulieman Barakat",
    140,
    [120]
));
userArray.push(new User(
    "Rami Barakat",
    140,
    [120]
));

userArray.push(new User(
    "Mahdi Joudah   ",
    140,
    [120]
));
userArray.push(new User(
    "Ben Barani",
    140,
    [120]
));
const container = document.querySelector(".container");

userArray.forEach(user => {
    container.appendChild(user.render());
});

