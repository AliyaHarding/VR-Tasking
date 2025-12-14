document.addEventListener('DOMContentLoaded', function() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    const categories = {
        'WERK': {
            color: '#2EACFF',
            name: 'WERK',
            borderColor: '#2EACFF'
        },
        'UITJES': {
            color: '#FECD00',
            name: 'UITJES',
            borderColor: '#FECD00'
        },
        'PRIVE': {
            color: '#36F2AA',
            name: 'PRIVE',
            borderColor: '#36F2AA'
        }
    };
    
    const monthYear = document.getElementById('monthYear');
    const calendarDays = document.getElementById('calendarDays');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    const taakForm = document.querySelector('.taakForm');
    const plusBtn = document.querySelector('.plusBtn button');
    const closeBtn = document.querySelector('.closeBtn button');
    const form = document.querySelector('.taakForm form');
    const categoryBtns = document.querySelectorAll('.catagoryBtns button');
    const taakView = document.querySelector('.taakView');
    
    const werkSlide = document.querySelector('.werkSlide');
    const uitSlide = document.querySelector('.uitSlide');
    const priveSlide = document.querySelector('.priveSlide');
    
    const werkCompleted = document.querySelector('.werkScroll');
    const uitjesCompleted = document.querySelector('.uitjesScroll');
    const priveCompleted = document.querySelector('.priveScroll');
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        opacity: 0.5;
        display: none;
        z-index: 1;
    `;
    document.body.appendChild(overlay);
    
    let currentDate = new Date();
    let selectedCategory = '';
    
    init();
    
    function init() {
        showCalendar();
        showTodayTasks();
        loadTasks();
        setupEvents();
    }
    
    // ----- CALENDAR FUNCTIONS -----
    function showCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
                           'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
        monthYear.textContent = `${monthNames[month]} ${year}`;
        
        calendarDays.innerHTML = '';
        
        const days = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
        days.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.textContent = day;
            dayEl.style.fontWeight = 'bold';
            calendarDays.appendChild(dayEl);
        });
        
        // Get first day of month
        const firstDay = new Date(year, month, 1);
        const startDay = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Empty days at start
        for (let i = 0; i < startDay; i++) {
            calendarDays.appendChild(document.createElement('div'));
        }
        
        // Add all days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.textContent = day;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayEl.dataset.date = dateStr;
            
            // Check if today
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayEl.classList.add('today');
            }
            
            const dayTasks = getTasksForDate(dateStr);
            if (dayTasks.length > 0) {
                const dotContainer = document.createElement('div');
                dotContainer.style.cssText = 'display: flex; justify-content: center; gap: 3px; margin-top: 5px;';
                
                const uniqueCats = [...new Set(dayTasks.map(task => task.category))];
                uniqueCats.forEach(cat => {
                    const dot = document.createElement('div');
                    dot.style.cssText = `
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background-color: ${categories[cat]?.color || '#FD3E81'};
                    `;
                    dotContainer.appendChild(dot);
                });
                
                dayEl.appendChild(dotContainer);
            }
            
            dayEl.addEventListener('click', function() {
                showTasksForDate(this.dataset.date);
            });
            
            dayEl.style.cursor = 'pointer';
            dayEl.style.padding = '10px 5px';
            dayEl.style.borderRadius = '5px';
            dayEl.style.transition = 'background-color 0.3s';
            
            dayEl.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            
            dayEl.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
            
            calendarDays.appendChild(dayEl);
        }
    }
    
    function getTasksForDate(dateString) {
        return tasks.filter(task => task.date === dateString && !task.completed);
    }
    
    function showTasksForDate(date) {
        selectedDate = date;
        const tasksForDate = getTasksForDate(date);
        const dateObj = new Date(date);
        const formatted = dateObj.toLocaleDateString('nl-NL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const groupedTasks = {};
        tasksForDate.forEach(task => {
            if (!groupedTasks[task.category]) {
                groupedTasks[task.category] = [];
            }
            groupedTasks[task.category].push(task);
        });
        
        let html = `<h2 style="color: var(--pink); margin-bottom: 20px; border-bottom: 2px solid var(--pink); padding-bottom: 10px;">${formatted}</h2>`;
        
        if (tasksForDate.length === 0) {
            html += '<p style="color: white; opacity: 0.7; text-align: center; padding: 20px;">Geen taken voor deze dag</p>';
        } else {
            Object.keys(categories).forEach(category => {
                if (groupedTasks[category]) {
                    html += `
                        <div style="
                            background-color: ${categories[category].color}20;
                            border-left: 4px solid ${categories[category].color};
                            color: ${categories[category].color};
                            padding: 10px;
                            border-radius: 10px;
                            margin: 15px 0;
                            font-weight: bold;
                        ">
                            ${category}
                        </div>
                    `;
                    
                    groupedTasks[category].forEach(task => {
                        html += createTaskHTML(task, true);
                    });
                }
            });
        }
        
        taakView.innerHTML = html;
    }
    
    function showTodayTasks() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        showTasksForDate(todayStr);
    }
    
    // ----- TASK FUNCTIONS -----
    function loadTasks() {
        loadTodoSlides();      
        loadCompletedTasks(); 
    }
    
    function loadTodoSlides() {
        werkSlide.innerHTML = '<h2>WERK</h2>';
        uitSlide.innerHTML = '<h2>UITJES</h2>';
        priveSlide.innerHTML = '<h2>PRIVE</h2>';
        
        const incompleteTasks = tasks.filter(task => !task.completed);
        
        incompleteTasks.forEach(task => {
            const taskElement = createTaskListItem(task);
            
            switch(task.category) {
                case 'WERK':
                    werkSlide.appendChild(taskElement);
                    break;
                case 'UITJES':
                    uitSlide.appendChild(taskElement);
                    break;
                case 'PRIVE':
                    priveSlide.appendChild(taskElement);
                    break;
            }
        });
    }
    
    function loadCompletedTasks() {
        if (werkCompleted) werkCompleted.innerHTML = '';
        if (uitjesCompleted) uitjesCompleted.innerHTML = '';
        if (priveCompleted) priveCompleted.innerHTML = '';
        
        const completedTasks = tasks.filter(task => task.completed);
        
        completedTasks.forEach(task => {
            addCompletedTask(task);
        });
    }
    
    function addCompletedTask(task) {
        const categoryConfig = categories[task.category];
        const element = document.createElement('div');
        element.className = 'completed-task';
        element.dataset.taskId = task.id;
        element.style.cssText = `
            background: rgba(30, 25, 33, 0.8);
            border-left: 4px solid ${categoryConfig.color};
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 8px;
            color: white;
            opacity: 0.7;
            text-decoration: line-through;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        
        const date = task.completedAt ? new Date(task.completedAt) : new Date();
        element.innerHTML = `
            <div>
                <strong style="color: ${categoryConfig.color};">${truncateText(task.title, 20)}</strong>
                <small style="opacity: 0.6; font-size: 0.8em; display: block; margin-top: 5px;">
                    Voltooid: ${date.toLocaleDateString('nl-NL')}
                </small>
            </div>
        `;
        
        switch(task.category) {
            case 'WERK':
                if (werkCompleted) werkCompleted.appendChild(element);
                break;
            case 'UITJES':
                if (uitjesCompleted) uitjesCompleted.appendChild(element);
                break;
            case 'PRIVE':
                if (priveCompleted) priveCompleted.appendChild(element);
                break;
        }
    }
    
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    function createTaskHTML(task, isLink) {
        const categoryConfig = categories[task.category];
        const shortTitle = truncateText(task.title, 25);
        const shortDescription = task.description ? truncateText(task.description, 40) : '';
        
        if (isLink) {
            return `
                <a href="taakInfo.html?id=${task.id}" 
                   style="
                       display: block;
                       background-color: ${categoryConfig.color}20;
                       border: 1px solid ${categoryConfig.color};
                       color: ${categoryConfig.color};
                       padding: 12px;
                       margin-bottom: 10px;
                       border-radius: 8px;
                       text-decoration: none;
                       transition: all 0.3s;
                   "
                   onmouseover="this.style.backgroundColor='${categoryConfig.color}'; this.style.color='var(--bgColor)';"
                   onmouseout="this.style.backgroundColor='${categoryConfig.color}20'; this.style.color='${categoryConfig.color}';">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1; min-width: 0;">
                            <strong style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${shortTitle}
                            </strong>
                            ${shortDescription ? `<p style="opacity: 0.8; margin-top: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${shortDescription}</p>` : ''}
                        </div>
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </div>
                </a>
            `;
        }
    }
    
    function createTaskListItem(task) {
        const categoryConfig = categories[task.category];
        const shortTitle = truncateText(task.title, 25);
        
        const element = document.createElement('div');
        element.className = 'task-item';
        element.dataset.taskId = task.id;
        element.style.cssText = `
            background: rgba(30, 25, 33, 0.8);
            border-left: 4px solid ${categoryConfig.color};
            padding: 12px;
            margin-top: 10px;
            border-radius: 8px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            overflow: hidden;
            transition: transform 0.3s, opacity 0.3s;
        `;
        
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.opacity = '0.9';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.opacity = '1';
        });
        
        element.innerHTML = `
            <div style="flex: 1; min-width: 0;">
                <strong style="color: ${categoryConfig.color}; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${shortTitle}
                </strong>
                <small style="opacity: 0.6; font-size: 0.8em; display: block; margin-top: 5px;">${formatDateDisplay(task.date)}</small>
            </div>
            <button class="complete-btn" style="
                background: none;
                border: 1px solid ${categoryConfig.color};
                color: ${categoryConfig.color};
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s;
                white-space: nowrap;
                flex-shrink: 0;
                margin-left: 10px;
            ">Voltooi</button>
        `;
        
        const completeBtn = element.querySelector('.complete-btn');
        completeBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = categoryConfig.color;
            this.style.color = 'var(--bgColor)';
        });
        
        completeBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
            this.style.color = categoryConfig.color;
        });
        
        completeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeTask(task.id);
        });
        
        element.addEventListener('click', function(e) {
            if (!e.target.closest('.complete-btn')) {
                window.location.href = `taakInfo.html?id=${task.id}`;
            }
        });
        
        return element;
    }
    
    function formatDateDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    function completeTask(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = true;
            tasks[taskIndex].completedAt = new Date().toISOString();
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            loadTodoSlides();      
            loadCompletedTasks();  
            showCalendar();        
            showTodayTasks();      
        }
    }
    
    // ----- FORM FUNCTIONS -----
    function setupEvents() {
        prevBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            showCalendar();
        });
        
        nextBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            showCalendar();
        });
        
        monthYear.addEventListener('click', function() {
            currentDate = new Date();
            showCalendar();
            showTodayTasks();
        });
        
        plusBtn.addEventListener('click', openForm);
        closeBtn.addEventListener('click', closeForm);
        overlay.addEventListener('click', closeForm);
        
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedCategory = this.textContent;
            });
        });
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!selectedCategory) {
                alert('Selecteer een categorie!');
                return;
            }
            
            const title = document.getElementById('taakTitel').value.trim();
            if (!title) {
                alert('Voer een titel in!');
                return;
            }
            
            const newTask = {
                id: Date.now().toString(),
                title: title,
                description: document.getElementById('taakBeschrijving').value.trim(),
                date: document.getElementById('taakDatum').value,
                category: selectedCategory,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            closeForm();
            loadTodoSlides();      
            showCalendar();        
            showTodayTasks();      
            
            alert(`Taak "${newTask.title}" toegevoegd!`);
        });
        
        const sliderBtns = document.querySelectorAll('.slidesBtn button');
        const takenSlider = document.querySelector('.taken');
        
        sliderBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const direction = this.classList.contains('prevBtn') ? -1 : 1;
                const scrollAmount = takenSlider.clientWidth * direction;
                takenSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        });
    }
    
    function openForm() {
        taakForm.style.display = 'block';
        overlay.style.display = 'block';
        
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        document.getElementById('taakDatum').value = `${yyyy}-${mm}-${dd}`;
    }
    
    function closeForm() {
        taakForm.style.display = 'none';
        overlay.style.display = 'none';
        form.reset();
        categoryBtns.forEach(btn => btn.classList.remove('active'));
        selectedCategory = '';
    }
});