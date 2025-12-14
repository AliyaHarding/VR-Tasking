    document.addEventListener('DOMContentLoaded', function() {
        // Get task ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const taskId = urlParams.get('id');
        
        // Load tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            // Update page title
            document.title = task.title;
            
            // Update header with category
            document.getElementById('categoryTitle').textContent = task.category;
            
            // Update task title
            document.getElementById('taskTitle').textContent = task.title;
            
            // Update task description with automatic word wrap
            const descriptionElement = document.getElementById('taskDescription');
            if (task.description) {
                // Break long words and preserve line breaks
                let formattedDescription = task.description
                    .replace(/([^\s]{20})/g, '$1 ') // Break words longer than 20 chars
                    .replace(/\n/g, '<br>'); // Preserve line breaks
                
                descriptionElement.innerHTML = formattedDescription;
            } else {
                descriptionElement.textContent = 'Geen beschrijving toegevoegd.';
            }
            
            // Update category with color
            const categoryElement = document.getElementById('taskCategory');
            categoryElement.textContent = task.category;
            categoryElement.className = task.category.toLowerCase();
            
            // Update category color in header
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
            
            // Update date
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
                    window.location.href = 'index.html';
                }
            };
            
            window.completeTask = function() {
                if (confirm('Markeer deze taak als voltooid?')) {
                    // Mark task as completed
                    task.completed = true;
                    task.completedAt = new Date().toISOString();
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    window.location.href = 'index.html';
                }
            };
        } else {
            // Task not found
            document.getElementById('taskTitle').textContent = 'Taak niet gevonden';
            document.getElementById('taskDescription').textContent = 'De opgevraagde taak bestaat niet of is verwijderd.';
            document.querySelector('.statusBtn').style.display = 'none';
        }
        
        // Add CSS for text wrapping
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
