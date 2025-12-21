const localDb = require('./utils/localDb');

async function checkData() {
    console.log('--- CHECKING LOCAL NODE.JS DATEBASE ---');

    // Check Users
    const users = await localDb.find('User');
    console.log(`\nFound ${users.length} Users in server/data/User.json:`);
    users.forEach(u => console.log(` - ${u.name} (${u.role})`));

    // Check Reports
    const reports = await localDb.find('Report');
    console.log(`\nFound ${reports.length} Reports in server/data/Report.json:`);
    reports.slice(0, 3).forEach(r => console.log(` - [${r.severity}] ${r.location}: ${r.symptoms.join(', ')}`));
    if (reports.length > 3) console.log(`   ...and ${reports.length - 3} more.`);

    // Check Alerts
    const alerts = await localDb.find('Alert');
    console.log(`\nFound ${alerts.length} Alerts in server/data/Alert.json:`);
    alerts.forEach(a => console.log(` - [${a.level}] ${a.location}: ${a.message.substring(0, 50)}...`));

    // Check Support Tickets
    const tickets = await localDb.find('SupportTicket');
    console.log(`\nFound ${tickets.length} Support Tickets in server/data/SupportTicket.json:`);
    tickets.forEach(t => console.log(` - [${t.status}] ${t.type}: ${t.message.substring(0, 50)}...`));

    console.log('\n--- VERIFICATION COMPLETE ---');
}

checkData();
