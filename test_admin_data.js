import axios from "axios";

// Helper Script to check if the Admin endpoints are actually returning data
// Requires a valid Admin JWT token.

const testEndpoints = async () => {
    try {
        console.log("----------------------------------------");
        console.log("Fetching Admin Login Token...");
        
        // Log in as the default hardcoded admin from setup (if available) or standard seeded admin
        // For testing we will just try to retrieve Enquiries and Applications using a dummy token or standard admin
        const loginRes = await axios.post('http://localhost:5000/api/auth/admin/login', {
            email: 'admin@tiis.co.in',
            password: 'admin' // typical seed password
        });

        const token = loginRes.data.token;
        console.log("Successfully retrieved Token!");
        console.log("----------------------------------------");
        
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        console.log("Testing GET /api/enquiries ...");
        try {
            const eqRes = await axios.get('http://localhost:5000/api/enquiries', config);
            console.log(`[Enquiries] Success! Count: ${eqRes.data.length}`);
        } catch (err) {
            console.error(`[Enquiries] Error:`, err.response ? err.response.data : err.message);
        }

        console.log("----------------------------------------");
        console.log("Testing GET /api/applications ...");
        try {
            const appRes = await axios.get('http://localhost:5000/api/applications', config);
            console.log(`[Applications] Success! Count: ${appRes.data.length}`);
            if(appRes.data.length > 0) {
               console.log("Sample Data:", appRes.data[0]);
            }
        } catch (err) {
            console.error(`[Applications] Error:`, err.response ? err.response.data : err.message);
        }

    } catch(err) {
        console.error("Failed to login or test endpoints:", err.response ? err.response.data : err.message);
    }
}

testEndpoints();
