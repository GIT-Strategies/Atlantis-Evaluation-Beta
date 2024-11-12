document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('downloadChart').addEventListener('click', downloadChart);
    document.getElementById('savePlayer').addEventListener('click', savePlayerData);
    document.getElementById('playerList').addEventListener('change', loadPlayerData);

    // Define the levels
    const levels = ['Insufficient', 'Developing', 'Sufficient', 'Select', 'Elite'];

    // Function to update the displayed level for each slider
    function updateLevelDisplay(slider, displayElement) {
        const levelIndex = slider.value;
        displayElement.textContent = levels[levelIndex];
    }

    const ctx = document.getElementById('radarChart').getContext('2d');
    const data = {
        labels: ['Character', 'Pass-Catch', 'Carry (with the ball)', 'Lines of Running (Without the Ball)', 'Tackle-Contact Area', 'Game Sense'],
        datasets: [{
            label: 'Player Evaluation',
            data: [0, 0, 0, 0, 0, 0],
            fill: true,
            backgroundColor: 'rgba(51, 51, 51, 0.2)',
            borderColor: '#C8A563',
            pointBackgroundColor: '#C8A563',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#C8A563'
        }]
    };

    const config = {
        type: 'radar',
        data: data,
        options: {
            elements: { line: { borderWidth: 3 } },
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 4, // Adjusted to match the new scale (0-4)
                    ticks: { display: false } // Hide ticks for a cleaner look
                }
            }
        }
    };

    const radarChart = new Chart(ctx, config);

    function updateChart() {
        const scores = [];
        document.querySelectorAll('.score-slider').forEach(slider => {
            const levelIndex = parseInt(slider.value);
            scores.push(levelIndex); // Push the index to the radar chart data array
            const displayElement = document.getElementById(`${slider.id}Value`);
            updateLevelDisplay(slider, displayElement);
        });
        radarChart.data.datasets[0].data = scores;
        radarChart.update();
    }

    document.querySelectorAll('.score-slider').forEach(slider => {
        slider.addEventListener('input', () => {
            updateChart();
            const displayElement = document.getElementById(slider.id + 'Value');
            updateLevelDisplay(slider, displayElement);
        });
    });

    function savePlayerData() {
        const playerName = document.getElementById('playerName').value;
        const evaluationDate = document.getElementById('evaluationDate').value;

        if (!playerName || !evaluationDate) {
            alert('Please enter a player name and select a date');
            return;
        }

        const scores = radarChart.data.datasets[0].data;
        const players = JSON.parse(localStorage.getItem('players')) || {};
        players[playerName] = { scores, evaluationDate };

        localStorage.setItem('players', JSON.stringify(players));
        loadPlayerList();
        showFeedbackMessage('Player data saved successfully.');
    }

    function loadPlayerData() {
        const playerName = document.getElementById('playerList').value;
        if (!playerName) {
            alert('Please select a player');
            return;
        }

        const players = JSON.parse(localStorage.getItem('players')) || {};
        if (players[playerName]) {
            radarChart.data.datasets[0].data = players[playerName].scores;
            radarChart.update();
            setSliderValues(players[playerName].scores);
            document.getElementById('evaluationDate').value = players[playerName].evaluationDate;
            showFeedbackMessage('Player data loaded successfully.');
        }
    }

    function setSliderValues(scores) {
        const sliderIds = ['character', 'passCatch', 'carry', 'linesOfRunning', 'tackleContact', 'gameSense'];
        sliderIds.forEach((id, index) => {
            const slider = document.getElementById(id);
            slider.value = scores[index];
            const displayElement = document.getElementById(id + 'Value');
            updateLevelDisplay(slider, displayElement);
        });
    }

    function loadPlayerList() {
        const players = JSON.parse(localStorage.getItem('players')) || {};
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = '<option value="">Select a Player</option>';

        Object.keys(players).forEach(playerName => {
            const option = document.createElement('option');
            option.value = playerName;
            option.textContent = `${players[playerName].evaluationDate} - ${playerName}`;
            playerList.appendChild(option);
        });
    }

    function showFeedbackMessage(message) {
        const feedbackMessage = document.getElementById('feedbackMessage');
        feedbackMessage.textContent = message;
        setTimeout(() => feedbackMessage.textContent = '', 3000);
    }

    function downloadChart() {
        const playerName = document.getElementById('playerName').value.trim();
        const evaluationDate = document.getElementById('evaluationDate').value || 'MM/DD/YYYY';
        const data = {
            playerName: playerName,
            evaluationDate: evaluationDate,
            character: document.getElementById('character').value,
            passCatch: document.getElementById('passCatch').value,
            carry: document.getElementById('carry').value,
            linesOfRunning: document.getElementById('linesOfRunning').value,
            tackleContact: document.getElementById('tackleContact').value,
            gameSense: document.getElementById('gameSense').value,
            comments: document.getElementById('comments').value
        };

        const rightSection = document.querySelector('.right-section');
        const downloadButton = document.getElementById('downloadChart');
        const playerListDropdown = document.getElementById('playerList');
        const playerNameInput = document.getElementById('playerName');
        const evaluationDateInput = document.getElementById('evaluationDate');
        const commentsTextarea = document.getElementById('comments');

        downloadButton.style.display = 'none';
        playerListDropdown.style.display = 'none';
        playerNameInput.style.display = 'none';
        evaluationDateInput.style.display = 'none';
        commentsTextarea.style.display = 'none';

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');

        pdf.setFillColor(51, 51, 51);
        pdf.rect(0, 0, pdf.internal.pageSize.width, 60, 'F');
        pdf.setTextColor(200, 165, 99);
        pdf.setFont('Times', 'bold');
        pdf.setFontSize(24);
        const playerTitle = `${evaluationDate} - ${playerName}`;
        pdf.text(playerTitle, pdf.internal.pageSize.width / 2, 40, { align: 'center' });

        html2canvas(rightSection).then(canvas => {
            const imgData = canvas.toDataURL('image/png');

            downloadButton.style.display = '';
            playerListDropdown.style.display = '';
            playerNameInput.style.display = '';
            evaluationDateInput.style.display = '';
            commentsTextarea.style.display = '';

            pdf.addImage(imgData, 'PNG', 40, 120, 500, 500);

            const sliderLabels = ['Character', 'Pass-Catch', 'Carry (with the ball)', 'Lines of Running', 'Tackle-Contact Area', 'Game Sense'];
            const sliderValues = [
                document.getElementById('character').value,
                document.getElementById('passCatch').value,
                document.getElementById('carry').value,
                document.getElementById('linesOfRunning').value,
                document.getElementById('tackleContact').value,
                document.getElementById('gameSense').value
            ];

            pdf.setFont('Times', 'normal');
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);

            let sliderYPosition = 650;
            for (let i = 0; i < sliderLabels.length; i++) {
                pdf.text(`${sliderLabels[i]}: ${sliderValues[i]}`, 40, sliderYPosition);
                sliderYPosition += 15;
            }

            const dividerX = 200;
            pdf.setDrawColor(0);
            pdf.line(dividerX, 640, dividerX, sliderYPosition + 20);

            const commentsText = document.getElementById('comments').value;
            const commentsX = dividerX + 10;
            const commentsY = 650;
            const maxWidth = pdf.internal.pageSize.width - commentsX - 40;

            pdf.text('Comments:', commentsX, commentsY);
            pdf.setFont('Times', 'italic');
            const wrappedComments = pdf.splitTextToSize(commentsText, maxWidth);
            pdf.text(wrappedComments, commentsX, commentsY + 20);

            pdf.setFont('Times', 'italic');
            pdf.setFontSize(10);
            pdf.text('Powered by Give it a Try', 40, pdf.internal.pageSize.height - 40);

            pdf.save(`${playerTitle}-evaluation.pdf`);
        });
    }

    loadPlayerList();
});
