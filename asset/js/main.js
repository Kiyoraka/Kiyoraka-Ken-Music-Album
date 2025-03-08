document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation
    const tabLinks = document.querySelectorAll('.sidebar .menu a');
    const contentSections = document.querySelectorAll('.main-content > div');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            tabLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show the target content section
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
    
    // Song list toggle
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const songList = document.getElementById(targetId);
            
            // Close all other song lists
            document.querySelectorAll('.song-list.active').forEach(list => {
                if (list.id !== targetId) {
                    list.classList.remove('active');
                }
            });
            
            // Toggle current song list
            songList.classList.toggle('active');
            
            // Update button text
            if (songList.classList.contains('active')) {
                this.textContent = 'Hide Songs';
            } else {
                this.textContent = 'View Songs';
            }
        });
    });
});