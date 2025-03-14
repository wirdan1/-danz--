function toggleMenu() {
    const menu = document.querySelector('.menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

document.addEventListener("click", function(event) {
    if (!event.target.closest(".navbar")) {
        document.querySelector('.menu').style.display = 'none';
    }
});

document.addEventListener("DOMContentLoaded", function() {
    let ctx = document.getElementById('cyberCrimeChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Plagiarisme", "DDoS", "Penipuan", "Pencurian Data"],
            datasets: [{
                label: "Jumlah Kasus 2024",
                data: [120, 300, 180, 90],
                backgroundColor: ["red", "orange", "yellow", "green"]
            }]
        }
    });

    let userCtx = document.getElementById('userStatsChart').getContext('2d');
    new Chart(userCtx, {
        type: 'line',
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "Mei"],
            datasets: [{
                label: "Pengguna Aktif",
                data: [500, 700, 1000, 1200, 1500],
                borderColor: "yellow",
                fill: false
            }]
        }
    });
});
