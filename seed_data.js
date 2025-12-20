
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gvxnbwvlwmpttcnsugpp.supabase.co";
const supabaseKey = "sb_publishable_snvP0YXBAjDpuRamzhqiJg_1c3jnFR_";

async function seedData() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Authenticating...");
    const email = 'seed_admin@test.com';
    const password = 'Password123!';

    let { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError || !user) {
        console.log("User not found, signing up...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: 'Seed Admin',
                }
            }
        });
        if (signUpError) {
            console.error("Error signing up:", signUpError.message);
            return;
        }
        user = signUpData.user;
        console.log("Signed up user:", user.id);
    } else {
        console.log("Logged in user:", user.id);
    }

    // Check if session is established? The client should auto-persist session in memory for this instance?
    // Actually standard supabase-js client persists session.

    // Checking tables...
    console.log("Checking tables...");

    // 1. Leads
    const { count: leadsCount, error: countError } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    if (countError) console.error("Error counting leads:", countError.message);
    console.log(`Leads count: ${leadsCount}`);

    if (leadsCount === 0) {
        console.log("Seeding leads...");
        const { error } = await supabase.from('leads').insert([
            { name: 'Sarah Connor', email: 'sarah@skynet.com', company: 'Cyberdyne', status: 'new', score: 85, source: 'Website', owner_id: user.id },
            { name: 'John Wick', email: 'john@continental.com', company: 'The Continental', status: 'qualified', score: 95, source: 'Referral', owner_id: user.id },
            { name: 'Tony Stark', email: 'tony@stark.com', company: 'Stark Ind', status: 'contacted', score: 90, source: 'LinkedIn', owner_id: user.id },
            { name: 'Bruce Wayne', email: 'bruce@wayne.com', company: 'Wayne Ent', status: 'new', score: 60, source: 'Website', owner_id: user.id },
            { name: 'Diana Prince', email: 'diana@themyscira.gov', company: 'Justice League', status: 'qualified', score: 88, source: 'Cold Call', owner_id: user.id },
            { name: 'Clark Kent', email: 'clark@dailyplanet.com', company: 'Daily Planet', status: 'unqualified', score: 20, source: 'Website', owner_id: user.id },
            { name: 'Peter Parker', email: 'peter@bugle.com', company: 'Daily Bugle', status: 'new', score: 45, source: 'Referral', owner_id: user.id },
            { name: 'Natasha Romanoff', email: 'nat@shield.gov', company: 'SHIELD', status: 'converted', score: 98, source: 'LinkedIn', owner_id: user.id },
            { name: 'Steve Rogers', email: 'steve@avengers.com', company: 'Avengers', status: 'contacted', score: 75, source: 'Conference', owner_id: user.id },
            { name: 'Wanda Maximoff', email: 'wanda@magic.com', company: 'Westview', status: 'qualified', score: 92, source: 'Website', owner_id: user.id },
        ]);
        if (error) console.error("Error seeding leads:", error.message);
        else console.log("Seeded 10 leads");
    }

    // 2. Deals
    const { count: dealsCount } = await supabase.from('deals').select('*', { count: 'exact', head: true });
    console.log(`Deals count: ${dealsCount}`);

    if (dealsCount === 0) {
        console.log("Seeding deals...");
        const { error } = await supabase.from('deals').insert([
            { name: 'Cyberdyne AI Contract', value: 500000, stage: 'negotiation', probability: 80, owner_id: user.id },
            { name: 'Stark Arc Reactor', value: 1200000, stage: 'proposal', probability: 60, owner_id: user.id },
            { name: 'Wayne Security', value: 750000, stage: 'discovery', probability: 30, owner_id: user.id },
            { name: 'Continental Membership', value: 50000, stage: 'won', probability: 100, owner_id: user.id },
            { name: 'Bugle Ad Space', value: 5000, stage: 'lost', probability: 0, owner_id: user.id },
        ]);
        if (error) console.error("Error seeding deals:", error.message);
        else console.log("Seeded 5 deals");
    }

    console.log("Seeding complete!");
}

seedData();
