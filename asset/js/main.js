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
    
    // Modal tab navigation
    const modalTabButtons = document.querySelectorAll('.tab-button');
    
    modalTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            modalTabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Show the target tab content
            const targetId = this.getAttribute('data-tab');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
    
    // Close modals when clicking the X button
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});