// Main init file (can be extended)
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('usernameInput');
    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            document.getElementById('loginBtn').click();
        }
    });
    input.focus();
});
