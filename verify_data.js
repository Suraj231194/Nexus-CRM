const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gvxnbwvlwmpttcnsugpp.supabase.co";
const supabaseKey = "sb_publishable_snvP0YXBAjDpuRamzhqiJg_1c3jnFR_";
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log("Checking Leads Schema access...");
    // Try to select 1 row
    const { data, error } = await supabase.from('leads').select('*').limit(1);
    if (error) {
        console.error("Select Error:", error);
    } else {
        console.log("Select Success. Columns potentially visible.");
    }

    // Try to insert a row with 'name' to see if other cols are required in leads
    const { error: leadsIncompleteError } = await supabase.from('leads').insert({ name: 'Test Lead' });
    if (leadsIncompleteError) {
        console.error("Leads Incomplete Insert Error:", leadsIncompleteError);
    } else {
        console.log("Leads Insert Success (minimal fields).");
    }

    // Check Deals schema
    const { error: dealsEmptyError } = await supabase.from('deals').insert({});
    if (dealsEmptyError) {
        console.error("Deals Empty Insert Error:", dealsEmptyError);
    }
}

verify();
