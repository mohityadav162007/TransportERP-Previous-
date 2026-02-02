const verifyLogin = async () => {
    try {
        console.log("Attempting login...");
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: "mohityadav16.2009@gmail.com",
                password: "Sanwariya1228"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();
        console.log("Login Successful!");
        console.log("User:", data.user);
    } catch (err) {
        console.error("Login Failed:", err.message);
        if (err.cause) console.error("Cause:", err.cause);
    }
};

verifyLogin();
