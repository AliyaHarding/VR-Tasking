    document.addEventListener('DOMContentLoaded', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const taskId = urlParams.get('id');
        
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
           
            document.getElementById('categoryTitle').textContent = task.category;
            
            document.getElementById('taskTitle').textContent = task.title;
            
            const descriptionElement = document.getElementById('taskDescription');
            if (task.description) {
                let formattedDescription = task.description
                    .replace(/([^\s]{20})/g, '$1 ') 
                    .replace(/\n/g, '<br>'); 
                
                descriptionElement.innerHTML = formattedDescription;
            } else {
                descriptionElement.textContent = 'Geen beschrijving toegevoegd.';
            }
            
            const categoryElement = document.getElementById('taskCategory');
            categoryElement.textContent = task.category;
            categoryElement.className = task.category.toLowerCase();
            
            const headerTitle = document.getElementById('categoryTitle');
            switch(task.category) {
                case 'WERK':
                    headerTitle.style.color = '#2EACFF';
                    document.getElementById('taskTitle').style.color = '#2EACFF';
                    categoryElement.style.backgroundColor = '#2EACFF';
                    break;
                case 'UITJES':
                    headerTitle.style.color = '#FECD00';
                    document.getElementById('taskTitle').style.color = '#FECD00';
                    categoryElement.style.backgroundColor = '#FECD00';
                    break;
                case 'PRIVE':
                    headerTitle.style.color = '#36F2AA';
                    document.getElementById('taskTitle').style.color = '#36F2AA';
                    categoryElement.style.backgroundColor = '#36F2AA';
                    break;
            }
            
            const date = new Date(task.date);
            const formattedDate = date.toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('taskDate').textContent = formattedDate;
            
            // Set up delete and complete functions
            window.deleteTask = function() {
                if (confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
                    // Remove task from array
                    const updatedTasks = tasks.filter(t => t.id !== taskId);
                    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
                    window.location.href = '/';
                }
            };
            
            window.completeTask = function() {
                if (confirm('Markeer deze taak als voltooid?')) {
                    // Mark task as completed
                    task.completed = true;
                    task.completedAt = new Date().toISOString();
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    window.location.href = '/';
                }
            };
        } else {
            document.getElementById('taskTitle').textContent = 'Taak niet gevonden';
            document.getElementById('taskDescription').textContent = 'De opgevraagde taak bestaat niet of is verwijderd.';
            document.querySelector('.statusBtn').style.display = 'none';
        }
        
        const style = document.createElement('style');
        style.textContent = `
            .beschrijving p {
                word-wrap: break-word;
                word-break: break-word;
                overflow-wrap: break-word;
                white-space: pre-wrap;
                max-width: 100%;
            }
            
            /* Force text to wrap within container */
            .beschrijving {
                overflow-wrap: break-word;
                word-wrap: break-word;
                -ms-word-break: break-all;
                word-break: break-word;
                -ms-hyphens: auto;
                -moz-hyphens: auto;
                -webkit-hyphens: auto;
                hyphens: auto;
            }
        `;
        document.head.appendChild(style);
    });
