use MediXpert

const hashtagData = [
    {
        key: "#full-name",
        value: "Full Name",
        description: "Patient's full name, including first, middle, and last name.",
        active: true
    },
    {
        key: "#place",
        value: "Place",
        description: "Patient's place name.",
        active: true
    },
    {
        key: "#doctor",
        value: "Doctor",
        description: "Patient's consulting doctor name.",
        active: true
    },
    {
        key: "#mobile-number-with-code",
        value: "Mobile Number",
        description: "Patient's mobile number, including country code.",
        active: true
    },
    {
        key: "#mobile-number",
        value: "Mobile Number",
        description: "Patient's mobile number, excluding country code.",
        active: true
    },
    {
        key: "#invoice-number",
        value: "Invoice Number",
        description: "Patient's invoice number.",
        active: true
    },
    {
        key: "#date",
        value: "Current Date",
        description: "Current date (YYYY-MM-DD).",
        active: true
    },
    {
        key: "#date-time",
        value: "Current Date Time",
        description: "Current date with time (YYYY-MM-DD HH:mm:ss).",
        active: true
    },
    {
        key: "#invoice-date",
        value: "Invoice Date",
        description: "Patient's invoice generated date (YYYY-MM-DD).",
        active: true
    },
    {
        key: "#invoice-date-time",
        value: "Invoice Date Time",
        description: "Patient's invoice generated date with time (YYYY-MM-DD HH:mm:ss).",
        active: true
    }
];

hashtagData.forEach(item => {
    db.replacingHashtags.updateOne(
        { key: item.key },
        {
            $set: {
                value: item.value,
                description: item.description,
                active: item.active,
                modified: {
                    by: "system",
                    on: new Date().toLocaleString(),
                    date: new Date()
                }
            },
            $setOnInsert: {
                created: {
                    by: "system",
                    on: new Date().toLocaleString(),
                    date: new Date()
                }
            }
        },
        { upsert: true }
    );
});

print("✅ Hashtag data inserted/updated successfully!");

const docTypesData = [
    {
        name: "Sale Invoice",
        value: "sale-invoice",
        active: true
    },
    {
        name: "Sale Bill",
        value: "sale-bill",
        active: true
    },
];

docTypesData.forEach(item => {
    db.documentTypes.updateOne(
        { value: item.value },
        {
            $set: {
                name: item.name,
                value: item.value,
                active: item.active,
                modified: {
                    by: "system",
                    on: new Date().toLocaleString(),
                    date: new Date()
                }
            },
            $setOnInsert: {
                created: {
                    by: "system",
                    on: new Date().toLocaleString(),
                    date: new Date()
                }
            }
        },
        { upsert: true }
    );
});

print("✅ Document Types Data inserted/updated successfully!");
