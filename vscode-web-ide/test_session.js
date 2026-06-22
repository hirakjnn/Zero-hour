const sessionManager = require('./backend/services/SessionManager');

(async () => {
    try {
        console.log('Testing createSession...');
        const session = await sessionManager.createSession(null, 'converge');
        console.log('Success:', session);
    } catch (e) {
        console.error('Error:', e);
    }
})();
