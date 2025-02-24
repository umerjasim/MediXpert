db.replacingHashtags.insertMany([
    {
        key: "#full-name",
        value: "Full Name",
        description: "Patient's full name, including first, middle and last name.",
        active: true,
        created: {
            by: "system",
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        key: "#place",
        value: "Place",
        description: "Patient's place name.",
        active: true,
        created: {
            by: "system",
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        key: "#doctor",
        value: "Doctor",
        description: "Patient's consulting doctor name.",
        active: true,
        created: {
            by: "system",
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        key: "#mobile-number-with-code",
        value: "Mobile Number",
        description: "Patient's mobile number, including country code.",
        active: true,
        created: {
            by: "system",
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        key: "#mobile-number",
        value: "Mobile Number",
        description: "Patient's mobile number, excluding country code.",
        active: true,
        created: {
            by: "system",
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        key: "#invoice-number",
        value: "Invoice Number",
        description: "Patient's invoice number.",
        active: true,
        created: {
            by: "system",
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        key: "#date",
        value: "Current Date",
        description: "Current date (dd/mm/yyyy).",
        active: true,
        created: {
            by: "system",
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        key: "#date-time",
        value: "Current Date Time",
        description: "Current date with time (dd/mm/yyyy hh:mm:ss A).",
        active: true,
        created: {
            by: "system",
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        key: "#invoice-date",
        value: "Invoice Date",
        description: "Patient's invoice generated date (dd/mm/yyyy).",
        active: true,
        created: {
            by: "system",
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    },
    {
        key: "#invoice-date-time",
        value: "Invoice Date Time",
        description: "Patient's invoice generated date with time (dd/mm/yyyy hh:mm:ss A).",
        active: true,
        created: {
            by: "system",
            on: new Date().toLocaleString(),
            date: new Date()
        },
        modified: {
            by: null,
            on: null,
            date: null
        }
    }
]);

print("✅ Data inserted successfully!");
