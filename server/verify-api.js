const http = require('http');

async function testFleet() {
    return new Promise((resolve) => {
        http.get('http://localhost:3000/api/v1/fleet', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const json = JSON.parse(data);
                console.log('Fleet API Status:', res.statusCode);
                console.log('Fleet Data Success:', json.success);
                console.log('Fleet Count:', json.data.length);
                resolve(json.success && json.data.length > 0);
            });
        });
    });
}

async function testRFAValidation() {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            clientName: "Test User",
            clientEmail: "test@example.com",
            phone: "0123456789",
            startDate: "2026-01-20",
            endDate: "2026-01-30", // 10 days - Should fail
            usageDescription: "Testing validation"
        });

        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/v1/requests',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const json = JSON.parse(data);
                console.log('RFA 10-day test Status:', res.statusCode);
                console.log('RFA 10-day test Error Code:', json.code);
                resolve(res.statusCode === 400 && json.code === 'ERR_VALIDATION');
            });
        });
        req.write(postData);
        req.end();
    });
}

async function runTests() {
    const fleetOk = await testFleet();
    const rfaOk = await testRFAValidation();

    if (fleetOk && rfaOk) {
        console.log('--- ALL VERIFICATION TESTS PASSED ---');
        process.exit(0);
    } else {
        console.log('--- VERIFICATION TESTS FAILED ---');
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error(err);
    process.exit(1);
});
